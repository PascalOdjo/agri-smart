import { postFormData } from '../lib/api.js'

export async function uploadPlantImage(file, userId) {
  const form = new FormData()
  form.append('file', file)
  form.append('userId', userId)

  const res = await postFormData('/upload', form, { headers: {} })
  if (!res?.file?.url) {
    throw new Error('Échec de l\'envoi de l\'image vers le serveur.')
  }
  return res.file.url
}
