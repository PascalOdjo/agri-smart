import { useState, useEffect } from 'react'
import { useAuth } from './useAuth.js'
import { fetchCurrentUser } from '../services/apiAuth.js'

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await fetchCurrentUser()
        const fetchedUser = response?.user
        if (fetchedUser) {
          setProfile({
            id: fetchedUser.id,
            role: fetchedUser.role,
            full_name: fetchedUser.fullName || fetchedUser.email?.split('@')[0],
            email: fetchedUser.email,
            region: fetchedUser.region || '',
            created_at: fetchedUser.createdAt,
            updated_at: fetchedUser.updatedAt
          })
        } else {
          setProfile({
            role: user.role || 'farmer',
            full_name: user.fullName || user.email?.split('@')[0],
            email: user.email
          })
        }
      } catch (error) {
        console.error('Erreur profil:', error)
        setProfile({
          role: user.role || 'farmer',
          full_name: user.fullName || user.email?.split('@')[0],
          email: user.email
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  return { profile, loading }
}
