import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, FileText, ArrowRight, Info, Sparkles, History } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { get } from '../lib/api.js'
import { getSupabaseConfigStatus } from '../utils/appConfig.js'

export function DiagnosticMain() {
  const { user } = useAuth()
  const [selectedOption, setSelectedOption] = useState(null)
  const [recentDiagnostics, setRecentDiagnostics] = useState([])
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false)
  const [diagnosticError, setDiagnosticError] = useState('')
  const supabaseStatus = getSupabaseConfigStatus()

  useEffect(() => {
    if (!user) {
      setRecentDiagnostics([])
      return
    }

    async function fetchRecentDiagnostics() {
      setLoadingDiagnostics(true)
      setDiagnosticError('')

      try {
        const res = await get('/diagnostics?limit=4')
        setRecentDiagnostics(res?.diagnostics || [])
      } catch (error) {
        console.error('Erreur lors du chargement des diagnostics:', error)
        setDiagnosticError('Impossible de charger vos diagnostics pour le moment.')
      } finally {
        setLoadingDiagnostics(false)
      }
    }

    fetchRecentDiagnostics()
  }, [user])

  const options = [
    {
      id: 'photo',
      title: 'Diagnostic par Photo',
      description: 'Prenez une photo de la plante malade et notre IA analysera l\'image pour identifier précisément la maladie.',
      icon: Camera,
      color: 'emerald',
      features: [
        'Analyse visuelle précise',
        'Identification instantanée',
        'Reconnaissance des symptômes visibles',
        'Idéal pour maladies avec signes caractéristiques'
      ],
      link: '/diagnostic/photo',
      buttonText: 'Prendre une photo'
    },
    {
      id: 'texte',
      title: 'Diagnostic par Description',
      description: 'Décrivez les symptômes que vous observez et notre IA vous proposera un diagnostic basé sur votre description.',
      icon: FileText,
      color: 'blue',
      features: [
        'Pas besoin de photo',
        'Description détaillée des symptômes',
        'Fonctionne avec connexion basique',
        'Parfait pour symptômes complexes'
      ],
      link: '/diagnostic/text',
      buttonText: 'Décrire les symptômes'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-emerald-900">Diagnostic IA des Cultures</h1>
        </div>
        <p className="text-emerald-700 max-w-3xl mx-auto text-lg">
          Choisissez votre méthode de diagnostic préférée. Notre intelligence artificielle spécialisée dans l'agriculture togolaise vous aidera à identifier et traiter les maladies de vos cultures.
        </p>
      </div>

      {!supabaseStatus.configured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {supabaseStatus.message}
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-900 mb-2">Comment choisir ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-700">
              <div>
                <strong>📸 Par Photo :</strong> Idéal quand vous voyez clairement les symptômes (taches, déformations, couleurs).
              </div>
              <div>
                <strong>📝 Par Texte :</strong> Parfait pour décrire des symptômes complexes, l'évolution dans le temps, ou si vous n'avez pas de photo.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = selectedOption === option.id

          return (
            <div
              key={option.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer hover:shadow-xl ${isSelected
                ? 'border-emerald-500 ring-4 ring-emerald-100'
                : 'border-slate-200 hover:border-slate-300'
                }`}
              onClick={() => setSelectedOption(option.id)}
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{option.title}</h3>
                    <p className="text-slate-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-semibold text-slate-900 mb-3">Avantages</h4>
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={option.link}
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${isSelected
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{option.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">Vos derniers diagnostics</h2>
        </div>

        {loadingDiagnostics ? (
          <p className="text-sm text-slate-500">Chargement de vos diagnostics...</p>
        ) : diagnosticError ? (
          <p className="text-sm text-red-600">{diagnosticError}</p>
        ) : recentDiagnostics.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun diagnostic enregistré pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {recentDiagnostics.map((diagnostic) => (
              <Link
                key={diagnostic.id}
                to={`/diagnostic/${diagnostic.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <div>
                  <p className="font-semibold text-slate-900">{diagnostic.diseaseName || diagnostic.disease_name || 'Diagnostic enregistré'}</p>
                  <p className="text-slate-500">{new Date(diagnostic.createdAt || diagnostic.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {diagnostic.severity || '—'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-sm text-slate-500 bg-white rounded-xl p-6 border border-slate-200">
        <div className="mb-3">
          <strong>🤖 Notre IA spécialisée</strong>
        </div>
        <p className="mb-2">
          Entraînée sur les maladies courantes au Togo et en Afrique de l'Ouest : manioc, maïs, igname, etc.
        </p>
        <p>
          Fournit des solutions adaptées : traitements chimiques disponibles localement + alternatives écologiques (neem, purin d'ortie, etc.).
        </p>
      </div>
    </div>
  )
}
