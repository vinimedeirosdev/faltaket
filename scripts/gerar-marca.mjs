// Gera todas as imagens da marca a partir de branding/logo-original.png.
//
//   npm run marca
//
// Saídas:
//   branding/logo-transparente.png  logo sem fundo em alta (uso externo)
//   src/assets/brand/logo.webp      logo completa sem fundo (login, cadastro, splash)
//   src/assets/brand/icone.webp     só a ilustração, sem o texto (topo do app)
//   public/pwa-*.png, maskable-*, apple-touch-icon-*, favicon.ico, favicon-*.png
//
// Se a logo mudar, troque o arquivo em branding/ e rode o script de novo.
// Ajuste os recortes abaixo se a composição da nova logo for diferente.

import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import ico from 'sharp-ico'

const ORIGEM = 'branding/logo-original.png'
const TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 }
const ROSA_CLARO = { r: 255, g: 241, b: 247, alpha: 1 } // fundo dos ícones do sistema
const PNG = { compressionLevel: 9, palette: true, quality: 90 } // ícones bem menores, sem perda visível

// Recortes sobre a imagem original (1254×1254)
const ILUSTRACAO = { left: 115, top: 40, width: 1050, height: 800 } // estudante + calendário, sem o texto
const ROSTO = { left: 300, top: 110, width: 660, height: 660 } // para ícones minúsculos (favicon)

// Remoção do fundo.
// O fundo da arte é branco NEUTRO (ex.: 253,253,253). O papel do calendário é um
// rosa quase branco (254,247,251): por isso o critério olha também a diferença
// entre os canais, senão o preenchimento "vaza" para dentro do calendário pela
// borda de baixo, que encosta na onda branca.
const FUNDO_MIN = 245 // menor canal
const FUNDO_TOM = 4 // diferença máxima entre canais (quanto menor, mais neutro)
// Na faixa do texto, o miolo das letras (a, e...) fica cercado e levemente rosado
// (253,248,249): ali qualquer quase-branco vira fundo.
const TEXTO_Y = 870
const TEXTO_MIN = 238
const FAIXA = 2 // largura (px) da borda suavizada em volta do desenho

/**
 * Deixa transparente o branco do fundo: o que está CONECTADO às bordas da
 * imagem (flood fill) e os miolos das letras. Brancos internos do desenho
 * (papel do calendário, brilhos) continuam opacos. Na faixa em volta do
 * recorte, o alpha é calculado "desmisturando" o branco, sem deixar contorno.
 */
async function removerFundo(entrada) {
  const { data, info } = await sharp(entrada)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const total = w * h
  const canais = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]
  const claro = (i) => {
    const c = canais(i)
    return Math.min(...c) >= FUNDO_MIN && Math.max(...c) - Math.min(...c) <= FUNDO_TOM
  }

  // 1. flood fill a partir de todas as bordas
  const fundo = new Uint8Array(total)
  for (let i = TEXTO_Y * w; i < total; i++) {
    if (Math.min(...canais(i)) >= TEXTO_MIN) fundo[i] = 1
  }
  const fila = new Int32Array(total)
  let ini = 0
  let fim = 0
  const semear = (i) => {
    if (!fundo[i] && claro(i)) {
      fundo[i] = 1
      fila[fim++] = i
    }
  }
  for (let x = 0; x < w; x++) (semear(x), semear((h - 1) * w + x))
  for (let y = 0; y < h; y++) (semear(y * w), semear(y * w + w - 1))
  while (ini < fim) {
    const i = fila[ini++]
    const x = i % w
    if (x > 0) semear(i - 1)
    if (x < w - 1) semear(i + 1)
    if (i >= w) semear(i - w)
    if (i < total - w) semear(i + w)
  }

  // 2. distância (em px, até FAIXA) de cada pixel do desenho até o fundo
  const dist = new Uint8Array(total).fill(255)
  for (let i = 0; i < total; i++) if (fundo[i]) dist[i] = 0
  for (let passo = 1; passo <= FAIXA; passo++) {
    for (let i = 0; i < total; i++) {
      if (dist[i] !== 255) continue
      const x = i % w
      const vizinho =
        (x > 0 && dist[i - 1] === passo - 1) ||
        (x < w - 1 && dist[i + 1] === passo - 1) ||
        (i >= w && dist[i - w] === passo - 1) ||
        (i < total - w && dist[i + w] === passo - 1)
      if (vizinho) dist[i] = passo
    }
  }

  // 3. aplica a transparência
  for (let i = 0; i < total; i++) {
    const p = i * 4
    if (fundo[i]) {
      data[p + 3] = 0
    } else if (dist[i] <= FAIXA) {
      // color-to-alpha contra o branco: a = quanto o pixel se afasta do branco
      const a = Math.max(255 - data[p], 255 - data[p + 1], 255 - data[p + 2]) / 255
      if (a <= 0.02) {
        data[p + 3] = 0
        continue
      }
      for (let c = 0; c < 3; c++) data[p + c] = Math.round(255 - (255 - data[p + c]) / a)
      data[p + 3] = Math.round(a * 255)
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer()
}

/** Completa a imagem até virar um quadrado, com o fundo dado. */
function quadrar(img, { width, height }, background) {
  const lado = Math.max(width, height)
  return sharp(img)
    .extend({
      top: Math.floor((lado - height) / 2),
      bottom: Math.ceil((lado - height) / 2),
      left: Math.floor((lado - width) / 2),
      right: Math.ceil((lado - width) / 2),
      background,
    })
    .png()
    .toBuffer()
}

async function main() {
  await mkdir('src/assets/brand', { recursive: true })
  const transparente = await removerFundo(ORIGEM)
  const recorte = await sharp(transparente).extract(ILUSTRACAO).png().toBuffer()
  const iconeTransparente = await quadrar(recorte, ILUSTRACAO, TRANSPARENTE)
  // ícones de sistema precisam de fundo sólido (o iOS pinta o transparente de preto)
  const iconeSolido = await sharp(iconeTransparente)
    .flatten({ background: ROSA_CLARO })
    .png()
    .toBuffer()
  const rosto = await sharp(ORIGEM).extract(ROSTO).png().toBuffer()

  // ── versão transparente em alta, para usar fora do app (redes, apresentações) ──
  await sharp(transparente).png({ compressionLevel: 9 }).toFile('branding/logo-transparente.png')

  // ── usadas pelo app (importadas no código; o Vite põe hash no nome) ──
  await sharp(transparente)
    .resize(720)
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile('src/assets/brand/logo.webp')
  await sharp(iconeTransparente)
    .resize(160)
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile('src/assets/brand/icone.webp')

  // ── PWA ──
  for (const lado of [64, 192, 512]) {
    await sharp(iconeSolido).resize(lado).png(PNG).toFile(`public/pwa-${lado}x${lado}.png`)
  }
  // maskable: o Android recorta em círculo/squircle; o conteúdo fica nos 80% centrais
  const seguro = Math.round(512 * 0.8)
  await sharp({ create: { width: 512, height: 512, channels: 4, background: ROSA_CLARO } })
    .composite([
      { input: await sharp(iconeTransparente).resize(seguro).png().toBuffer(), gravity: 'center' },
    ])
    .png(PNG)
    .toFile('public/maskable-icon-512x512.png')
  await sharp(iconeSolido).resize(180).png(PNG).toFile('public/apple-touch-icon-180x180.png')

  // ── favicon (em 16–48 px a ilustração inteira vira borrão: usa o rosto) ──
  await sharp(rosto).resize(48).png(PNG).toFile('public/favicon-48x48.png')
  const tamanhos = await Promise.all(
    [16, 32, 48].map((l) => sharp(rosto).resize(l).png().toBuffer()),
  )
  await writeFile('public/favicon.ico', ico.encode(tamanhos))

  console.log('Imagens da marca geradas.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
