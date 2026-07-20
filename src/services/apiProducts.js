import { get, post, put, del } from '../lib/api.js'

export async function listProducts(query = {}) {
    const params = new URLSearchParams(query)
    const response = await get(`/products?${params.toString()}`)
    return response.products || []
}

export async function getProduct(id) {
    return get(`/products/${id}`)
}

export async function createProduct(payload) {
    return post('/products', payload)
}

export async function updateProduct(id, payload) {
    return put(`/products/${id}`, payload)
}

export async function deleteProduct(id) {
    return del(`/products/${id}`)
}
