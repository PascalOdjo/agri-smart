import { get, post } from '../lib/api.js'

export async function saveDiagnostic(payload) {
    return post('/diagnostics', payload)
}

export async function getDiagnostics() {
    const response = await get('/diagnostics')
    return response.diagnostics || []
}

export async function getDiagnostic(id) {
    return get(`/diagnostics/${id}`)
}
