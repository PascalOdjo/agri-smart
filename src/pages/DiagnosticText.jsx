import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, FileText, AlertCircle, CheckCircle, Info, Leaf, Bug, Droplets, Shield, Sprout } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { getTextDiagnosis } from '../services/ai.js'
import { saveDiagnostic } from '../services/diagnostics.js'

export function DiagnosticText() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim() || !user) return

    setError('')
    setLoading(true)

    try {
      const diagnosisResult = await getTextDiagnosis(description)
      setResult(diagnosisResult)

      // Sauvegarder le diagnostic sans image
      await saveDiagnostic({
        userId: user.id,
        imageUrl: null,
        ...diagnosisResult,
      })

    } catch (err) {
      console.error('Erreur diagnostic:', err)
      setError(err.message || 'Erreur lors du diagnostic. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'elevee': return 'bg-red-100 text-red-800'
      case 'moderee': return 'bg-amber-100 text-amber-800'
      case 'faible': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-900">Diagnostic par description</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
            {result.severity}
          </span>
        </div>

        {/* Description soumise */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Votre description</h3>
          <p className="text-slate-700 italic">"{description}"</p>
        </div>

        {/* Carte principale - Maladie */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <Bug className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Maladie identifiée</h2>
              <p className="text-xl font-bold text-emerald-900">{result.disease_name}</p>
            </div>
          </div>
        </div>

        {/* Symptômes */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">Symptômes correspondants</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{result.symptoms}</p>
        </div>

        {/* Cause */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Cause probable</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{result.cause}</p>
        </div>

        {/* Traitements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traitement chimique */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Traitement chimique</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">{result.treatment}</p>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">
                ⚠️ Respecter les doses et les précautions d'usage
              </p>
            </div>
          </div>

          {/* Traitement écologique */}
          <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-900">Traitement biologique</h3>
            </div>
            <p className="text-emerald-800 leading-relaxed">{result.eco_treatment}</p>
            <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-700 font-medium">
                🌿 Solution naturelle et économique
              </p>
            </div>
          </div>
        </div>

        {/* Prévention */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900">Mesures préventives</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{result.prevention}</p>
        </div>

        {/* Pratiques culturales */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">Pratiques culturales recommandées</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{result.cultural_practices}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setResult(null)
              setDescription('')
            }}
            className="flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-center hover:bg-emerald-700"
          >
            Nouveau diagnostic
          </button>
          <button
            onClick={() => navigate('/diagnostic')}
            className="px-6 py-3 rounded-xl border border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-50"
          >
            📸 Diagnostic par photo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4">
          <Link to={user?.role === 'client' ? "/dashboard" : "/diagnostic"} className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium">
            ← Retour {user?.role === 'client' ? "au tableau de bord" : "au diagnostic"}
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 mb-2">Diagnostic par Description</h1>
        <p className="text-emerald-700 max-w-2xl mx-auto">
          Décrivez les symptômes que vous observez sur vos cultures et notre IA vous proposera des solutions adaptées.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-emerald-900">Comment décrire efficacement ?</h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Décrivez la plante concernée (maïs, manioc, etc.)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Mentionnez les parties affectées (feuilles, tiges, fruits)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Décrivez l'apparence (taches, couleur, forme)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Précisez depuis quand vous observez ces symptômes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
            Description des symptômes
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Les feuilles de mon maïs ont des taches jaunes qui deviennent brunes. Les taches sont d'abord petites puis s'agrandissent. J'ai remarqué ça depuis une semaine après les dernières pluies..."
            className="w-full min-h-[200px] px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            required
          />
          <p className="text-sm text-slate-500 mt-2">
            Soyez aussi précis que possible pour un meilleur diagnostic.
          </p>
        </div>

        {/* Alertes */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Bouton d'action */}
        <button
          type="submit"
          disabled={!description.trim() || loading}
          className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-3 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <div className="text-left">
                <div>Analyse en cours...</div>
                <div className="text-sm opacity-90">Notre IA examine votre description</div>
              </div>
            </>
          ) : (
            <>
              <FileText className="w-6 h-6" />
              <span>Analyser la description</span>
            </>
          )}
        </button>
      </form>

      {/* Footer info */}
      <div className="text-center text-sm text-slate-500">
        <p>Diagnostic gratuit et confidentiel • Résultats en quelques secondes</p>
        <p className="mt-1">Spécialisé dans les cultures tropicales d'Afrique de l'Ouest</p>
      </div>
    </div>
  )
}
