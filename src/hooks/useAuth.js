import { useState, useEffect } from 'react'
import { fetchCurrentUser, getStoredToken } from '../services/apiAuth.js'
import { clearAuthToken } from '../lib/api.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      setLoading(true)
      try {
        if (!getStoredToken()) {
          if (isMounted) setUser(null)
          return
        }

        const response = await fetchCurrentUser()
        if (response?.user && isMounted) {
          setUser(response.user)
        }
      } catch (error) {
        console.error('Unable to fetch current user:', error)
        clearAuthToken()
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  return { user, loading }
}
