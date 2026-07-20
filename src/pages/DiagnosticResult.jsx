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
    getDiagnosticById(id)
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

  const diseaseName = diagnostic.diseaseName || diagnostic.disease_name
  const imageUrl = diagnostic.imageUrl || diagnostic.image_url
  const solution = diagnostic.solution || diagnostic.treatment
  const ecoAlternative = diagnostic.ecoAlternative || diagnostic.eco_treatment || diagnostic.eco_alternative
  const severity = diagnostic.severity

  const severityColor = severity === 'elevee' || severity === 'élevée' || severity === 'high'
    ? 'bg-red-100 text-red-800'
    : severity === 'moderee' || severity === 'modérée' || severity === 'medium'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-800'

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-900">Diagnostic agricole</h1>
        {severity && (
          <span className={'inline-block px-3 py-1 rounded-full text-sm font-medium ' + severityColor}>
            {severity}
          </span>
        )}
      </div>

      {imageUrl && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <img
            src={imageUrl}
            alt="Plante analysée"
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <Bug className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Maladie identifiée</h2>
            <p className="text-xl font-bold text-emerald-900">{diseaseName || 'Non identifiée'}</p>
          </div>
        </div>
      </div>

      {solution && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Traitement recommandé</h3>
          </div>
          <p className="text-slate-700 leading-relaxed">{solution}</p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 font-medium">
              Respecter les doses et les précautions d'usage
            </p>
          </div>
        </div>
      )}

      {ecoAlternative && (
        <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900">Alternative écologique</h3>
          </div>
          <p className="text-emerald-800 leading-relaxed">{ecoAlternative}</p>
          <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
            <p className="text-xs text-emerald-700 font-medium">
              Solution naturelle et économique
            </p>
          </div>
        </div>
      )}

      {(diagnostic.symptoms || diagnostic.cause || diagnostic.prevention || diagnostic.cultural_practices) && (
        <>
          {diagnostic.symptoms && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-slate-900">Symptômes observés</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">{diagnostic.symptoms}</p>
            </div>
          )}

          {diagnostic.cause && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-slate-900">Cause probable</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">{diagnostic.cause}</p>
            </div>
          )}

          {diagnostic.prevention && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-900">Mesures préventives</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">{diagnostic.prevention}</p>
            </div>
          )}

          {diagnostic.cultural_practices && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-slate-900">Pratiques culturales recommandées</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">{diagnostic.cultural_practices}</p>
            </div>
          )}
        </>
      )}

      <div className="flex gap-4">
        <Link to={user?.role === 'client' ? "/dashboard" : "/diagnostic"} className="flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-center hover:bg-emerald-700">
          {user?.role === 'client' ? "Retour au tableau de bord" : "Nouveau diagnostic"}
        </Link>
      </div>
    </div>
  )
}
