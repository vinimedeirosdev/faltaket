// Gera todas as imagens da marca a partir de branding/logo-original.png.
//
//   npm run marca
//
// Saídas:
//   src/assets/brand/logo.webp      logo completa (telas de login, cadastro, splash)
//   src/assets/brand/icone.webp     só a ilustração, sem o texto (topo do app)
//   public/pwa-*.png, maskable-*, apple-touch-icon-*, favicon.ico, favicon-*.png
//
// Se a logo mudar, troque o arquivo em branding/ e rode o script de novo.
// Ajuste os recortes abaixo se a composição da nova logo for diferente.

import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import ico from 'sharp-ico'

const ORIGEM = 'branding/logo-original.png'
const BRANCO = { r: 255, g: 255, b: 255, alpha: 1 }
const PNG = { compressionLevel: 9, palette: true, quality: 90 } // ícones bem menores, sem perda visível

// Recortes sobre a imagem original (1254×1254)
const ILUSTRACAO = { left: 115, top: 40, width: 1050, height: 800 } // estudante + calendário, sem o texto
const ROSTO = { left: 300, top: 110, width: 660, height: 660 } // para ícones minúsculos (favicon)

/** Recorta a ilustração e completa até virar um quadrado com fundo branco. */
async function ilustracaoQuadrada() {
  const { width, height } = ILUSTRACAO
  const lado = Math.max(width, height)
  return sharp(ORIGEM)
    .extract(ILUSTRACAO)
    .extend({
      top: Math.floor((lado - height) / 2),
      bottom: Math.ceil((lado - height) / 2),
      left: Math.floor((lado - width) / 2),
      right: Math.ceil((lado - width) / 2),
      background: BRANCO,
    })
    .png()
    .toBuffer()
}

async function main() {
  await mkdir('src/assets/brand', { recursive: true })
  const quadrada = await ilustracaoQuadrada()
  const rosto = await sharp(ORIGEM).extract(ROSTO).png().toBuffer()

  // ── usadas pelo app (importadas no código; o Vite põe hash no nome) ──
  await sharp(ORIGEM).resize(720).webp({ quality: 86 }).toFile('src/assets/brand/logo.webp')
  await sharp(quadrada).resize(160).webp({ quality: 88 }).toFile('src/assets/brand/icone.webp')

  // ── PWA ──
  for (const lado of [64, 192, 512]) {
    await sharp(quadrada).resize(lado).png(PNG).toFile(`public/pwa-${lado}x${lado}.png`)
  }
  // maskable: o Android recorta em círculo/squircle; o conteúdo fica nos 80% centrais
  const seguro = Math.round(512 * 0.8)
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BRANCO } })
    .composite([
      { input: await sharp(quadrada).resize(seguro).png().toBuffer(), gravity: 'center' },
    ])
    .png(PNG)
    .toFile('public/maskable-icon-512x512.png')
  await sharp(quadrada).resize(180).png(PNG).toFile('public/apple-touch-icon-180x180.png')

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
