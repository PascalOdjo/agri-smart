import { useEffect, useState } from 'react'
import { User, Calendar, Edit2, Save, X, Shield, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { signOut, updateProfile } from '../services/auth.js'
import { get } from '../lib/api.js'

export function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    region: '',
  })
  const [profileMeta, setProfileMeta] = useState({
    role: '',
    createdAt: null,
  })
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setProfileLoading(false)
      return
    }

    async function loadProfile() {
      setProfileLoading(true)
      try {
        const data = await get('/users/me')
        const userData = data?.user

        setFormData({
          full_name: userData?.fullName || user?.fullName || '',
          region: userData?.region || user?.region || '',
        })
        setProfileMeta({
          role: userData?.role || user?.role || '',
          createdAt: userData?.createdAt || user?.createdAt || null,
        })
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        setFormData({
          full_name: user?.fullName || '',
          region: user?.region || '',
        })
        setProfileMeta({
          role: user?.role || '',
          createdAt: user?.createdAt || null,
        })
        setMessage('Impossible de charger vos informations pour le moment.')
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const data = await updateProfile({
        fullName: formData.full_name,
        region: formData.region,
      })
      const updated = data?.user
      if (updated) {
        setFormData({
          full_name: updated.fullName || '',
          region: updated.region || '',
        })
        setProfileMeta((prev) => ({
          ...prev,
          role: updated.role || prev.role,
        }))
      }
      setMessage('Profil mis à jour avec succès.')
      setIsEditing(false)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      setMessage(error.message || 'Erreur lors de la mise à jour du profil.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: user?.fullName || formData.full_name,
      region: user?.region || formData.region,
    })
    setIsEditing(false)
    setMessage('')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error(err)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const roleLabel = {
    farmer: 'Agriculteur',
    client: 'Client',
    admin: 'Administrateur',
  }[profileMeta.role] || profileMeta.role || 'Utilisateur'

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            <User className="h-6 w-6 text-emerald-600" />
            Mon Profil
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Edit2 className="h-4 w-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className={`mb-6 rounded-lg border p-4 ${message.includes('succès') ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {profileLoading ? (
          <p className="text-sm text-slate-500">Chargement du profil...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{formData.full_name || 'Utilisateur'}</h2>
                  <p className="text-slate-600">{user?.email}</p>
                  <p className="text-sm font-medium capitalize text-emerald-600">
                    {roleLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                {profileMeta.createdAt
                  ? `Inscrit le ${new Date(profileMeta.createdAt).toLocaleDateString('fr-FR')}`
                  : 'Date d\'inscription indisponible'}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Shield className="h-4 w-4" />
                Compte actif
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Settings className="h-5 w-5" />
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nom complet</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : ''}`}
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-600"
              placeholder="Votre email"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Région</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : ''}`}
              placeholder="Ex. Maritime, Plateaux, Kara..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Settings className="h-5 w-5" />
          Actions du compte
        </h3>

        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 md:w-auto"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
