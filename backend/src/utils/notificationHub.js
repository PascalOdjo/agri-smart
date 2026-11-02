const subscribers = new Map()

export function subscribeToNotifications(userId, response) {
    const userSubscribers = subscribers.get(userId) || new Set()
    userSubscribers.add(response)
    subscribers.set(userId, userSubscribers)

    return () => {
        userSubscribers.delete(response)
        if (userSubscribers.size === 0) subscribers.delete(userId)
    }
}

export function publishNotification(notification) {
    const userSubscribers = subscribers.get(notification.userId)
    if (!userSubscribers) return

    const payload = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
    userSubscribers.forEach((response) => response.write(payload))
}