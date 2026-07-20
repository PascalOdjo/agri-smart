import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { signIn, resendConfirmationEmail, requestPasswordReset, getCurrentUser } from '../services/auth.js'
import { getSupabaseConfigStatus } from '../utils/appConfig.js'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const supabaseStatus = getSupabaseConfigStatus()

  const isEmailNotConfirmed = error && (
    /confirm|vérifiez|verified|confirmation/i.test(error) ||
    error.includes('Email not confirmed')
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await signIn(email, password)
      const user = res?.user || (await getCurrentUser())?.user

      if (user?.role === 'admin') {
        navigate('/super-admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendConfirmation() {
    if (!email) {
      setError('Saisissez votre email ci-dessus puis cliquez sur « Renvoyer l\'email ».')
      return
    }
    setError('')
    setSuccess('')
    setResendLoading(true)
    try {
      await resendConfirmationEmail(email)
      setSuccess('Un nouvel email de confirmation a été envoyé. Vérifiez votre boîte de réception (et les spams).')
    } catch (err) {
      setError(err.message || 'Impossible d\'envoyer l\'email.')
    } finally {
      setResendLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!supabaseStatus.configured) {
      setError('Impossible d\'envoyer le lien de réinitialisation : l\'API n\'est pas configurée.')
      return
    }

    if (!email) {
      setError('Saisissez votre adresse email pour recevoir le lien de réinitialisation.')
      return
    }

    setError('')
    setSuccess('')
    setForgotLoading(true)

    try {
      await requestPasswordReset(email)
      setSuccess('Si un compte existe pour cette adresse, un email de réinitialisation a été envoyé.')
    } catch (err) {
      setError(err.message || 'Impossible d\'envoyer l\'email de réinitialisation.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-8 px-4 text-center">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-white">
          <Leaf className="w-9 h-9" />
          <span className="text-xl">AgriSmart Togo</span>
        </Link>
        <p className="text-white/90 text-sm mt-2">Connexion à votre espace</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-emerald-900 text-center mb-6">Connexion</h1>
          {!supabaseStatus.configured && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{supabaseStatus.message}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg space-y-2" role="alert">
                <p>{error}</p>
                {isEmailNotConfirmed && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="text-emerald-700 font-semibold hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Envoi...' : 'Renvoyer l\'email de confirmation'}
                  </button>
                )}
              </div>
            )}
            {success && (
              <p className="text-emerald-700 text-sm bg-emerald-50 p-3 rounded-lg" role="status">
                {success}
              </p>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-emerald-900 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none "
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-emerald-900 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={!supabaseStatus.configured || forgotLoading || loading}
              className="w-full text-sm font-medium text-emerald-700 hover:underline disabled:opacity-50"
            >
              {forgotLoading ? 'Envoi...' : 'Mot de passe oublié ?'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className="mt-6 text-center text-emerald-800">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="font-semibold text-emerald-600 hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
