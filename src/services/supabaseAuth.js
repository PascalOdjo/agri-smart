import { supabase } from '../lib/supabase.js'

export async function signUp(email, password, fullName = '', role = 'farmer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role
      }
    }
  })

  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  
  // Fetch user profile after sign in
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.warn('Could not fetch profile:', profileError)
  }

  return {
    user: {
      ...data.user,
      role: profileData?.role || 'farmer',
      full_name: profileData?.full_name || data.user.user_metadata?.full_name || ''
    }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return { success: true }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) throw error
  if (!user) return null

  // Fetch user profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.warn('Could not fetch profile:', profileError)
  }

  return {
    user: {
      ...user,
      role: profileData?.role || user.user_metadata?.role || 'farmer',
      full_name: profileData?.full_name || user.user_metadata?.full_name || ''
    }
  }
}

export async function resendConfirmationEmail() {
  throw new Error('La confirmation d\'email doit être gérée via la console Supabase')
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
  return { success: true }
}

export async function resetPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  if (error) throw error
  return { success: true }
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        callback({
          user: {
            ...session.user,
            role: profileData?.role || session.user.user_metadata?.role || 'farmer',
            full_name: profileData?.full_name || session.user.user_metadata?.full_name || ''
          }
        })
      } else {
        callback(null)
      }
    }
  )

  return { unsubscribe: () => subscription.unsubscribe() }
}

export async function updateProfile(profileData) {
  const { data: { user }, error: userError } = await supabase.auth.updateUser({
    data: {
      full_name: profileData.full_name
    }
  })

  if (userError) throw userError

  // Update profile in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.full_name,
      ...(profileData.role && { role: profileData.role })
    })
    .eq('id', user.id)

  if (profileError) throw profileError

  return {
    user: {
      ...user,
      ...profileData
    }
  }
}
