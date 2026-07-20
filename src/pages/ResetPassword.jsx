import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Leaf, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../services/auth.js'
import { getSupabaseConfigStatus } from '../utils/appConfig.js'

export function ResetPassword() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { token: tokenParam } = useParams()
    const [searchParams] = useSearchParams()
    const token = tokenParam || searchParams.get('token')
    const supabaseStatus = getSupabaseConfigStatus()
    const ready = Boolean(token)

    useEffect(() => {
        if (!token) {
            setError('Lien de réinitialisation invalide ou incomplet. Demandez un nouveau lien depuis la page de connexion.')
        }
    }, [token])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!token) {
            setError('Lien de réinitialisation invalide ou incomplet.')
            return
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.')
            return
        }

        if (password !== confirmPassword) {
            setError('Les deux mots de passe ne correspondent pas.')
            return
        }

        setLoading(true)

        try {
            await resetPassword(token, password)
            setSuccess('Mot de passe mis à jour avec succès. Vous pouvez vous connecter.')
            setTimeout(() => navigate('/login', { replace: true }), 1500)
        } catch (err) {
            setError(err.message || 'Impossible de mettre à jour le mot de passe.')
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
                <p className="text-white/90 text-sm mt-2">Réinitialisation du mot de passe</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-emerald-900 text-center mb-6">Nouveau mot de passe</h1>

                    {!supabaseStatus.configured && (
                        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{supabaseStatus.message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700" role="status">
                            {success}
                        </div>
                    )}

                    {ready ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="password" className="mb-1 block text-sm font-medium text-emerald-900">
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white py-3 pl-10 pr-12 text-emerald-900 outline-none transition-all placeholder-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
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

                            <div>
                                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-emerald-900">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-emerald-200 bg-white py-3 pl-10 pr-12 text-emerald-900 outline-none transition-all placeholder-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
                            </button>
                        </form>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                            Ouvrez le lien reçu par email et revenez ici pour définir un nouveau mot de passe.
                            <div className="mt-3">
                                <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
                                    Retour à la connexion
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
