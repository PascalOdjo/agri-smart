import { get, post, put } from '../lib/api.js'

export async function getOrders() {
    const response = await get('/orders')
    return response.orders || []
}

export async function getOrder(id) {
    return get(`/orders/${id}`)
}

export async function createOrder(payload) {
    return post('/orders', payload)
}

export async function updateOrderStatus(id, status) {
    return put(`/orders/${id}/status`, { status })
}

export async function cancelOrder(id) {
    return put(`/orders/${id}/cancel`)
}
