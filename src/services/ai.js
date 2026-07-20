import { post } from '../lib/api.js'

function isLocalImageUrl(url) {
  if (!url) return true
  return /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url)
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Impossible de lire l\'image'))
    reader.readAsDataURL(file)
  })
}

async function resolveImageForVision(imageUrl, file) {
  if (file) {
    return fileToDataUrl(file)
  }

  if (imageUrl && !isLocalImageUrl(imageUrl)) {
    return imageUrl
  }

  throw new Error('Image locale introuvable pour l\'analyse')
}

export async function getDiagnosis(imageUrl, file = null) {
  try {
    const visionUrl = await resolveImageForVision(imageUrl, file)
    const response = await post('/diagnostics/analyze/image', { imageUrl: visionUrl })
    return response
  } catch (error) {
    console.error('Erreur lors du diagnostic d\'image:', error.message)
    throw error
  }
}

export async function getTextDiagnosis(description) {
  try {
    const response = await post('/diagnostics/analyze/text', { description })
    return response
  } catch (error) {
    console.error('Erreur lors du diagnostic texte:', error.message)
    throw error
  }
}

