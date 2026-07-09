import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Camera, Loader2, AlertCircle, CheckCircle, Info, Smartphone } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { uploadPlantImage } from '../services/storage.js'
import { getDiagnosis } from '../services/ai.js'
import { saveDiagnostic } from '../services/diagnostics.js'

export function DiagnosticUpload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleFileChange(e) {
    const chosen = e.target.files?.[0]
    setError('')
    if (!chosen) {
      setFile(null)
      setPreview(null)
      return
    }
    if (!chosen.type.startsWith('image/')) {
      setError('Veuillez choisir une image (JPG, PNG).')
      return
    }
    setFile(chosen)
    setPreview(URL.createObjectURL(chosen))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !user) return
    setError('')
    setLoading(true)
    try {
      const imageUrl = await uploadPlantImage(file, user.id)
      const result = await getDiagnosis(imageUrl)
      const { id } = await saveDiagnostic({
        userId: user.id,
        imageUrl,
        ...result,
      })
      navigate(`/diagnostic/${id}`)
    } catch (err) {
      setError(err.message || 'Erreur lors du diagnostic')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4">
          <Link to={user?.user_metadata?.role === 'client' ? "/dashboard" : "/diagnostic"} className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium">
            ← Retour {user?.user_metadata?.role === 'client' ? "au tableau de bord" : "au diagnostic"}
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 mb-2">Diagnostic par Photo</h1>
        <p className="text-emerald-700 max-w-2xl mx-auto">
          Prenez une photo de la plante malade et notre IA analysera l'image pour identifier précisément la maladie.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-semibold text-emerald-900">Comment prendre une bonne photo ?</h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Prenez la photo en pleine lumière naturelle</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Montrez les parties affectées (feuilles, tiges, fruits)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Évitez les ombres et les flous</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Prochez-vous suffisamment pour voir les détails</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Zone d'upload */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="plant-photo"
            className="block w-full min-h-[300px] rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          >
            {preview ? (
              <div className="relative w-full">
                <img
                  src={preview}
                  alt="Aperçu de la plante"
                  className="max-h-64 w-full object-contain rounded-xl"
                />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  ✅ Photo sélectionnée
                </div>
              </div>
            ) : (
              <>
                <div className="bg-emerald-100 p-4 rounded-full">
                  <Camera className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <span className="text-emerald-700 font-semibold text-lg">Prendre une photo</span>
                  <p className="text-emerald-600 text-sm mt-1">ou cliquez pour choisir un fichier</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>Utilisez l'appareil photo de votre téléphone</span>
                </div>
              </>
            )}
            <input
              id="plant-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
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

        {/* Informations sur le diagnostic */}
        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium">Diagnostic complet</p>
                <p className="text-blue-700 text-sm">
                  Notre IA analysera votre photo pour identifier : la maladie, les symptômes, les causes, et vous proposera des traitements chimiques et écologiques adaptés.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bouton d'action */}
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-3 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <div className="text-left">
                <div>Analyse en cours...</div>
                <div className="text-sm opacity-90">Notre IA examine votre culture</div>
              </div>
            </>
          ) : (
            <>
              <Camera className="w-6 h-6" />
              <span>Lancer le diagnostic IA</span>
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
