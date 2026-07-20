import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Mail, Lock, User, Briefcase, Store, AlertCircle } from 'lucide-react'
import { signUp } from '../services/auth.js'
import { getSupabaseConfigStatus } from '../utils/appConfig.js'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('farmer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const supabaseStatus = getSupabaseConfigStatus()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, fullName, role)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-8 px-4 text-center">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-white">
          <Leaf className="w-9 h-9" />
          <span className="text-xl">AgriSmart Togo</span>
        </Link>
        <p className="text-white/90 text-sm mt-2">Rejoignez-nous aujourd'hui</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-emerald-900 text-center mb-6">Créer un compte</h1>
          {!supabaseStatus.configured && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{supabaseStatus.message}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg" role="alert">
                {error}
              </p>
            )}

            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex-1 min-h-[48px] px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${role === 'farmer'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
              >
                <Briefcase className="w-5 h-5" />
                Agriculteur
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex-1 min-h-[48px] px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${role === 'client'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
              >
                <Store className="w-5 h-5" />
                Client
              </button>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-emerald-900 mb-1">
                Nom (optionnel)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="Votre nom"
                />
              </div>
            </div>
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
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
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all outline-none"
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>
          <p className="mt-6 text-center text-emerald-800">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
