import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Shield, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { signOut } from '../services/auth.js'
import { supabase } from '../lib/supabase.js'

export function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    farm_name: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Synchroniser formData avec les données utilisateur lorsque user change
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user?.user_metadata?.full_name || '',
        phone: user?.user_metadata?.phone || '',
        address: user?.user_metadata?.address || '',
        farm_name: user?.user_metadata?.farm_name || '',
        bio: user?.user_metadata?.bio || ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          farm_name: formData.farm_name,
          bio: formData.bio
        }
      })

      if (error) throw error

      setMessage('Profil mis à jour avec succès!')
      setIsEditing(false)

      // Recharger les données utilisateur
      window.location.reload()
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Réinitialiser formData avec les données utilisateur actuelles
    if (user) {
      setFormData({
        full_name: user?.user_metadata?.full_name || '',
        phone: user?.user_metadata?.phone || '',
        address: user?.user_metadata?.address || '',
        farm_name: user?.user_metadata?.farm_name || '',
        bio: user?.user_metadata?.bio || ''
      })
    }
    setIsEditing(false)
    setMessage('')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <User className="w-6 h-6 text-emerald-600" />
            Mon Profil
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {message}
          </div>
        )}

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {formData.full_name || 'Utilisateur'}
                </h2>
                <p className="text-slate-600">{user?.email}</p>
                <p className="text-sm text-emerald-600 font-medium capitalize">
                  {user?.user_metadata?.role || 'Agriculteur'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              Inscrit le {new Date(user?.created_at).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4" />
              Compte vérifié
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de modification */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : ''
                }`}
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              placeholder="Votre email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : ''
                }`}
              placeholder="Votre numéro de téléphone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nom de la ferme
            </label>
            <input
              type="text"
              name="farm_name"
              value={formData.farm_name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : ''
                }`}
              placeholder="Nom de votre ferme"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : ''
                }`}
              placeholder="Votre adresse"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Biographie
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : ''
                }`}
              placeholder="Parlez-nous de vous et de votre ferme..."
            />
          </div>
        </div>
      </div>

      {/* Actions du compte */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Actions du compte
        </h3>

        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
