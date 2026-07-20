import { get, post, put, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api.js'

export async function register(email, password, fullName = '', role = 'farmer') {
    const response = await post('/auth/register', { email, password, fullName, role })
    if (response?.token) {
        setAuthToken(response.token)
    }
    return response
}

export async function login(email, password) {
    const response = await post('/auth/login', { email, password })
    if (response?.token) {
        setAuthToken(response.token)
    }
    return response
}

export async function logout() {
    try {
        await post('/auth/logout')
    } finally {
        clearAuthToken()
    }
}

export async function requestPasswordReset(email) {
    return post('/auth/request-password-reset', { email })
}

export async function resetPassword(token, password) {
    return put(`/auth/reset-password/${token}`, { password })
}

export async function fetchCurrentUser() {
    return get('/users/me')
}

export async function refreshSession() {
    return post('/auth/refresh')
}

export async function updateProfile(profileData) {
    return put('/users/me', profileData)
}

export function getStoredToken() {
    return getAuthToken()
}
