import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

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
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Erreur profil:', error)
          // Fallback vers les métadonnées utilisateur
          setProfile({
            role: user.user_metadata?.role || 'farmer',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            email: user.email
          })
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error('Erreur profil:', error)
        // Fallback vers les métadonnées utilisateur
        setProfile({
          role: user.user_metadata?.role || 'farmer',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
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
