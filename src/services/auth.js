import {
  register,
  login,
  logout,
  requestPasswordReset as requestBackendPasswordReset,
  resetPassword as backendResetPassword,
  fetchCurrentUser,
  updateProfile as backendUpdateProfile
} from './apiAuth.js'

export async function signUp(email, password, fullName = '', role = 'farmer') {
  return register(email, password, fullName, role)
}

export async function signIn(email, password) {
  return login(email, password)
}

export async function signOut() {
  return logout()
}

export async function requestPasswordReset(email) {
  return requestBackendPasswordReset(email)
}

export async function resetPassword(token, newPassword) {
  return backendResetPassword(token, newPassword)
}

export async function updateProfile(profileData) {
  return backendUpdateProfile(profileData)
}

export async function getCurrentUser() {
  return fetchCurrentUser()
}

export function resendConfirmationEmail() {
  throw new Error('La confirmation d\'email n\'est pas gérée par l\'API backend actuellement.')
}

export async function updatePassword() {
  throw new Error('La mise à jour du mot de passe se fait via le lien de réinitialisation envoyé par email.')
}

export function onAuthStateChange(callback) {
  // Backend authentication does not support a real-time auth state listener.
  console.warn('onAuthStateChange is not supported with backend auth. Use refresh or user state polling.')
  return { unsubscribe: () => { } }
}
