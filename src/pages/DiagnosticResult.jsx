import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Leaf, Bug, Droplets, Shield, Sprout } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { getDiagnosticById } from '../services/diagnostics.js'

export function DiagnosticResult() {
  const { id } = useParams()
  const { user } = useAuth()
  const [diagnostic, setDiagnostic] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !id) return
    getDiagnosticById(id, user.id)
      .then(setDiagnostic)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-emerald-800">Chargement...</p>
      </div>
    )
  }

  if (error || !diagnostic) {
    return (
      <div className="space-y-4">
        <p className="text-red-600 bg-red-50 p-4 rounded-xl">{error || 'Diagnostic introuvable.'}</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour au dashboard
        </Link>
      </div>
    )
  }

  const severityColor = diagnostic.severity === 'elevee' || diagnostic.severity === 'élevée'
    ? 'bg-red-100 text-red-800'
    : diagnostic.severity === 'moderee' || diagnostic.severity === 'modérée'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-800'

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900">Diagnostic agricole</h1>
        <span className={'inline-block px-3 py-1 rounded-full text-sm font-medium ' + severityColor}>
          {diagnostic.severity}
        </span>
      </div>

      {/* Image analysée */}
      {diagnostic.image_url && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <img
            src={diagnostic.image_url}
            alt="Plante analysée"
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Carte principale - Maladie */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <Bug className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Maladie identifiée</h2>
            <p className="text-xl font-bold text-emerald-900">{diagnostic.disease_name}</p>
          </div>
        </div>
      </div>

      {/* Symptômes */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">Symptômes observés</h3>
        </div>
        <p className="text-slate-700 leading-relaxed">{diagnostic.symptoms}</p>
      </div>

      {/* Cause */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-slate-900">Cause probable</h3>
        </div>
        <p className="text-slate-700 leading-relaxed">{diagnostic.cause}</p>
      </div>

      {/* Traitements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traitement chimique */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Traitement chimique</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{diagnostic.treatment}</p>
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
          <p className="text-emerald-800 leading-relaxed">{diagnostic.eco_treatment}</p>
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
        <p className="text-slate-700 leading-relaxed">{diagnostic.prevention}</p>
      </div>

      {/* Pratiques culturales */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">Pratiques culturales recommandées</h3>
        </div>
        <p className="text-slate-700 leading-relaxed">{diagnostic.cultural_practices}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link to={user?.user_metadata?.role === 'client' ? "/dashboard" : "/diagnostic"} className="flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-center hover:bg-emerald-700">
          {user?.user_metadata?.role === 'client' ? "Retour au tableau de bord" : "Nouveau diagnostic"}
        </Link>
        <button className="px-6 py-3 rounded-xl border border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-50">
          📋 Exporter le rapport
        </button>
      </div>
    </div>
  )
}
