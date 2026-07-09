import { useEffect, useState } from 'react'
import { Sprout, Plus, Calendar, Ruler, ClipboardList, PenLine, Trash2, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.js'
import { getProductImage } from '../utils/productImages.js'

export function Crops() {
  const { user } = useAuth()
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('')
  const [surfaceArea, setSurfaceArea] = useState('')
  const [status, setStatus] = useState('planifié')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user) {
      fetchCrops()
    }
  }, [user])

  async function fetchCrops() {
    if (!user) {
      setCrops([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.from('crops').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) {
        console.error('Erreur lors du chargement des cultures:', error)
        setCrops([])
      } else {
        setCrops(data || [])
      }
    } catch (error) {
      console.error('Erreur inattendue:', error)
      setCrops([])
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setPlantingDate('')
    setExpectedHarvestDate('')
    setSurfaceArea('')
    setStatus('planifié')
    setNotes('')
    setEditingId(null)
    setShowAddForm(false)
  }

  function handleEdit(crop) {
    setName(crop.name)
    setPlantingDate(crop.planting_date || '')
    setExpectedHarvestDate(crop.expected_harvest_date || '')
    setSurfaceArea(crop.surface_area || '')
    setStatus(crop.status || 'planifié')
    setNotes(crop.notes || '')
    setEditingId(crop.id)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette culture ?')) return
    const { error } = await supabase.from('crops').delete().eq('id', id)
    if (!error) {
      setCrops(crops.filter(c => c.id !== id))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      user_id: user.id,
      name,
      planting_date: plantingDate || null,
      expected_harvest_date: expectedHarvestDate || null,
      surface_area: surfaceArea ? parseFloat(surfaceArea) : null,
      status,
      notes
    }

    if (editingId) {
      const { data, error } = await supabase.from('crops').update(payload).eq('id', editingId).select()
      if (error) {
        console.error("Erreur de modification :", error)
        alert("Erreur lors de la modification: " + error.message)
      } else if (data) {
        setCrops(crops.map(c => c.id === editingId ? data[0] : c))
        resetForm()
      }
    } else {
      const { data, error } = await supabase.from('crops').insert([payload]).select()
      if (error) {
        console.error("Erreur d'ajout :", error)
        alert("Erreur lors de l'ajout (la base de données n'est peut-être pas à jour) : " + error.message)
      } else if (data) {
        setCrops([data[0], ...crops])
        resetForm()
        // Forcer le rafraîchissement pour s'assurer que les données sont à jour
        setTimeout(() => fetchCrops(), 100)
      }
    }
    setSubmitting(false)
  }

  const StatusBadge = ({ currentStatus }) => {
    const styles = {
      'planifié': 'bg-slate-100 text-slate-700 border-slate-200',
      'planté': 'bg-amber-100 text-amber-700 border-amber-200',
      'en croissance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'récolté': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${styles[currentStatus] || styles['planifié']}`}>
        {currentStatus}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          <Sprout className="w-8 h-8 text-emerald-600" />
          Suivi des Cultures
        </h1>
        <button
          onClick={() => { resetForm(); setShowAddForm(!showAddForm) }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Fermer' : 'Nouvelle Culture'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 space-y-4">
          <h2 className="text-lg font-semibold text-emerald-900 mb-4">{editingId ? 'Modifier la culture' : 'Ajouter une culture'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la culture *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="ex: Maïs, Manioc..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut *</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="planifié">Planifié</option>
                <option value="planté">Planté</option>
                <option value="en croissance">En croissance</option>
                <option value="récolté">Récolté</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de semis</label>
              <input type="date" value={plantingDate} onChange={e => setPlantingDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de récolte estimée</label>
              <input type="date" value={expectedHarvestDate} onChange={e => setExpectedHarvestDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Surface (Hectares)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" step="0.01" value={surfaceArea} onChange={e => setSurfaceArea(e.target.value)} placeholder="0.5" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes ou observations</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Variété utilisée, engrais, état du sol..." rows="3" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={resetForm} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Check className="w-4 h-4" /> {submitting ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Enregistrer')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center py-12 text-slate-500">Chargement de vos cultures...</p>
      ) : crops.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
          <Sprout className="w-16 h-16 text-emerald-100 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune culture enregistrée</h3>
          <p className="text-slate-500 mb-6 max-w-sm">Commencez à suivre vos plantations en ajoutant votre première culture.</p>
          <button onClick={() => setShowAddForm(true)} className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-xl font-medium hover:bg-emerald-100 transition-colors">Ajouter une culture</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {crops.map(crop => (
            <div key={crop.id} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-32 bg-emerald-50 overflow-hidden">
                <img
                  src={getProductImage(crop.name)}
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31d?w=400&h=300&fit=crop&crop=center&auto=format'
                  }}
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{crop.name}</h3>
                    <div className="mt-1">
                      <StatusBadge currentStatus={crop.status} />
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(crop)} className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors" title="Modifier">
                      <PenLine className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(crop.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span><span className="text-xs text-slate-400 block">Semis</span>
                      {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : 'Non défini'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span><span className="text-xs text-slate-400 block">Récolte est.</span>
                      {crop.expected_harvest_date ? new Date(crop.expected_harvest_date).toLocaleDateString() : 'Non définie'}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Ruler className="w-4 h-4 text-slate-400" />
                    <span><span className="text-xs text-slate-400 block">Surface</span>
                      {crop.surface_area ? `${crop.surface_area} Hectares` : 'Non précisée'}</span>
                  </div>
                </div>
              </div>

              {crop.notes && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 flex items-start gap-2">
                  <ClipboardList className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="line-clamp-2">{crop.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
