import { post, get } from '../lib/api.js'

export async function saveDiagnostic({
  userId,
  imageUrl,
  disease_name,
  diseaseName,
  severity,
  solution,
  eco_alternative,
  ecoAlternative,
  treatment,
  eco_treatment,
  symptoms,
  cause,
  prevention,
  cultural_practices,
}) {
  const payload = {
    imageUrl,
    diseaseName: diseaseName || disease_name,
    severity,
    solution: solution || treatment,
    ecoAlternative: ecoAlternative || eco_alternative || eco_treatment,
    symptoms,
    cause,
    prevention,
    culturalPractices: cultural_practices,
  }
  const res = await post('/diagnostics', payload)
  return res?.diagnostic
}

export async function getDiagnosticsByUser(userId) {
  const res = await get(`/diagnostics?userId=${userId}`)
  return res?.diagnostics || []
}

export async function getDiagnosticById(id) {
  const res = await get(`/diagnostics/${id}`)
  return res?.diagnostic
}
