import { db } from './api'

const MAX_BYTES = 5 * 1024 * 1024
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

/**
 * Envia uma imagem para o bucket público `media` e devolve a URL.
 * O bucket também valida tipo e tamanho no servidor; só administradoras enviam.
 */
export async function uploadImage(file: File, folder: 'services' | 'gallery' | 'testimonials') {
  const extension = TYPES[file.type]
  if (!extension) throw new Error('Use uma imagem JPG, PNG ou WebP.')
  if (file.size > MAX_BYTES) throw new Error('A imagem precisa ter no máximo 5 MB.')

  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const { error } = await db().storage.from('media').upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (error) throw new Error('Não foi possível enviar a imagem.')
  return db().storage.from('media').getPublicUrl(path).data.publicUrl
}
