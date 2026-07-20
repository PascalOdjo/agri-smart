const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const TOKEN_STORAGE_KEY = 'agriSmartAuthToken'

export function getAuthToken() {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAuthToken(token) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function buildHeaders(headers = {}, body = null) {
    const token = getAuthToken()
    const baseHeaders = {}

    if (!(body instanceof FormData)) {
        baseHeaders['Content-Type'] = 'application/json'
    }

    if (token) {
        baseHeaders.Authorization = `Bearer ${token}`
    }

    return {
        ...baseHeaders,
        ...headers
    }
}

async function parseResponse(response) {
    const text = await response.text()
    if (!text) return null

    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

async function handleError(response) {
    const data = await parseResponse(response)
    const message = data?.error || data?.message || response.statusText || 'Erreur inconnue'
    const error = new Error(message)
    error.status = response.status
    if (data?.code) error.code = data.code
    throw error
}

async function apiFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
    const init = {
        method: 'GET',
        credentials: 'include',
        ...options
    }
    init.headers = buildHeaders(options.headers, init.body)

    if (init.body && !(init.body instanceof FormData)) {
        init.body = JSON.stringify(init.body)
    }

    const response = await fetch(url, init)

    if (response.ok) {
        return parseResponse(response)
    }

    const errorBody = await parseResponse(response)
    if (response.status === 401 && errorBody?.code === 'TOKEN_EXPIRED') {
        try {
            await refreshToken()
            const retryInit = {
                ...init,
                headers: buildHeaders(options.headers, init.body)
            }
            const retryResponse = await fetch(url, retryInit)
            if (retryResponse.ok) {
                return parseResponse(retryResponse)
            }
            return handleError(retryResponse)
        } catch (err) {
            clearAuthToken()
            throw err
        }
    }

    const message = errorBody?.error || errorBody?.message || response.statusText || 'Erreur inconnue'
    const error = new Error(message)
    error.status = response.status
    if (errorBody?.code) error.code = errorBody.code
    throw error
}

export async function refreshToken() {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Aucun jeton disponible pour actualiser la session')
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders()
    })

    if (!response.ok) {
        clearAuthToken()
        return handleError(response)
    }

    const data = await parseResponse(response)
    if (data?.token) {
        setAuthToken(data.token)
    }
    return data
}

export const get = (path, options = {}) => apiFetch(path, { method: 'GET', ...options })
export const post = (path, body, options = {}) => apiFetch(path, { method: 'POST', body, ...options })
export const put = (path, body, options = {}) => apiFetch(path, { method: 'PUT', body, ...options })
export const del = (path, options = {}) => apiFetch(path, { method: 'DELETE', ...options })
export const postFormData = (path, formData, options = {}) => apiFetch(path, { method: 'POST', body: formData, ...options })

export const isBackendConfigured = Boolean(import.meta.env.VITE_API_URL)
export const getApiBaseUrl = () => API_URL
