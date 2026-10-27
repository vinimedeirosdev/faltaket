/** Lado da foto de perfil, em pixels (quadrada). */
export const FOTO_LADO = 256

/** Limite aceito pelas Security Rules (caracteres da data URL). */
export const FOTO_MAX_CHARS = 150_000

/**
 * Recorta a imagem no centro (quadrado), reduz para 256×256 e comprime.
 * Usa WebP; se o navegador não gerar WebP (Safari antigo devolve PNG),
 * cai para JPEG. O resultado é uma data URL pequena (~10–30 KB) que vai
 * direto no perfil do Firestore, sem precisar do Firebase Storage.
 */
export async function prepararFotoPerfil(arquivo: File): Promise<string> {
  if (!arquivo.type.startsWith('image/')) {
    throw new Error('Escolha um arquivo de imagem.')
  }

  // imageOrientation corrige fotos de celular que vêm "deitadas" (EXIF)
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('Não foi possível ler essa imagem. Tente outra.')
  })

  const lado = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - lado) / 2
  const sy = (bitmap.height - lado) / 2

  const canvas = document.createElement('canvas')
  canvas.width = FOTO_LADO
  canvas.height = FOTO_LADO
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, sx, sy, lado, lado, 0, 0, FOTO_LADO, FOTO_LADO)
  bitmap.close()

  for (const qualidade of [0.85, 0.7, 0.5]) {
    let url = canvas.toDataURL('image/webp', qualidade)
    if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', qualidade)
    if (url.length <= FOTO_MAX_CHARS) return url
  }
  throw new Error('A imagem ficou grande demais. Tente outra.')
}
