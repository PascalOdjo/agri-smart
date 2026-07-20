import { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, MapPin, Users, Wrench, AlertCircle, CheckCircle, XCircle, Edit2, Trash2, Filter, Search } from 'lucide-react'
import { get, post, put, del } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'

export function InterventionPlanning() {
  const { user } = useAuth()
  const [interventions, setInterventions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingIntervention, setEditingIntervention] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [viewMode, setViewMode] = useState('list') // list, calendar

  const [formData, setFormData] = useState({
    intervention_type: '',
    title: '',
    description: '',
    target_parcel: '',
    target_crop: '',
    planned_date: '',
    status: 'planned',
    priority: 'medium',
    estimated_duration_hours: '',
    required_equipment: [],
    required_labor: '',
    estimated_cost: '',
    actual_cost: '',
    completion_date: '',
    notes: ''
  })

  const interventionTypes = [
    'Plantation',
    'Récolte',
    'Irrigation',
    'Fertilisation',
    'Traitement phytosanitaire',
    'Taille',
    'Désherbage',
    'Labour/Préparation du sol',
    'Semis',
    'Entretien',
    'Réparation équipement',
    'Autre'
  ]

  const priorities = ['low', 'medium', 'high', 'urgent']
  const statusOptions = ['planned', 'in_progress', 'completed', 'cancelled']
  const equipmentOptions = [
    'Tracteur', 'Charrue', 'Semoir', 'Pulvérisateur', 'Moissonneuse',
    'Irrigation', 'Outils à main', 'Équipement de protection', 'Autre'
  ]

  useEffect(() => {
    fetchInterventions()
  }, [user])

  const fetchInterventions = async () => {
    try {
      const farmRes = await get(`/farms?userId=${user.id}`)
      const farm = farmRes?.farm || (farmRes?.farms && farmRes.farms[0])
      if (farm) {
        const res = await get(`/cultural_interventions?farmId=${farm.id}`)
        setInterventions(res?.cultural_interventions || res?.interventions || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des interventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const farmRes = await get(`/farms?userId=${user.id}`)
      const farm = farmRes?.farm || (farmRes?.farms && farmRes.farms[0])
      if (!farm) throw new Error('Ferme non trouvée')

      const interventionData = {
        farmId: farm.id,
        ...formData,
        estimated_duration_hours: formData.estimated_duration_hours ? parseFloat(formData.estimated_duration_hours) : null,
        required_labor: formData.required_labor ? parseInt(formData.required_labor) : null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
        required_equipment: formData.required_equipment.length > 0 ? formData.required_equipment : null
      }

      if (editingIntervention) {
        await put(`/cultural_interventions/${editingIntervention.id}`, interventionData)
      } else {
        await post('/cultural_interventions', interventionData)
      }

      resetForm()
      fetchInterventions()
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      intervention_type: '',
      title: '',
      description: '',
      target_parcel: '',
      target_crop: '',
      planned_date: '',
      status: 'planned',
      priority: 'medium',
      estimated_duration_hours: '',
      required_equipment: [],
      required_labor: '',
      estimated_cost: '',
      actual_cost: '',
      completion_date: '',
      notes: ''
    })
    setShowForm(false)
    setEditingIntervention(null)
  }

  const handleEdit = (intervention) => {
    setEditingIntervention(intervention)
    setFormData({
      intervention_type: intervention.intervention_type,
      title: intervention.title,
      description: intervention.description || '',
      target_parcel: intervention.target_parcel || '',
      target_crop: intervention.target_crop || '',
      planned_date: intervention.planned_date,
      status: intervention.status,
      priority: intervention.priority,
      estimated_duration_hours: intervention.estimated_duration_hours?.toString() || '',
      required_equipment: intervention.required_equipment || [],
      required_labor: intervention.required_labor?.toString() || '',
      estimated_cost: intervention.estimated_cost?.toString() || '',
      actual_cost: intervention.actual_cost?.toString() || '',
      completion_date: intervention.completion_date || '',
      notes: intervention.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      try {
        await del(`/cultural_interventions/${id}`)
        fetchInterventions()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updateData = { status: newStatus }
      if (newStatus === 'completed') {
        updateData.completion_date = new Date().toISOString().split('T')[0]
      }

      await put(`/cultural_interventions/${id}`, updateData)
      fetchInterventions()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const getFilteredInterventions = () => {
    let filtered = interventions

    if (searchTerm) {
      filtered = filtered.filter(intervention =>
        intervention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.target_parcel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.target_crop?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(intervention => intervention.status === filterStatus)
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(intervention => intervention.priority === filterPriority)
    }

    return filtered
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in_progress': return <AlertCircle className="w-5 h-5 text-blue-600" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'grey'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent'
      case 'high': return 'Élevée'
      case 'medium': return 'Moyenne'
      case 'low': return 'Basse'
      default: return priority
    }
  }

  const getUpcomingInterventions = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    return interventions
      .filter(intervention => {
        const plannedDate = new Date(intervention.planned_date)
        return plannedDate >= today && plannedDate <= nextWeek && intervention.status === 'planned'
      })
      .sort((a, b) => new Date(a.planned_date) - new Date(b.planned_date))
  }

  const getInterventionStats = () => {
    const total = interventions.length
    const completed = interventions.filter(i => i.status === 'completed').length
    const inProgress = interventions.filter(i => i.status === 'in_progress').length
    const planned = interventions.filter(i => i.status === 'planned').length
    const overdue = interventions.filter(i => {
      const plannedDate = new Date(i.planned_date)
      return plannedDate < new Date() && i.status === 'planned'
    }).length

    return { total, completed, inProgress, planned, overdue }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const stats = getInterventionStats()
  const upcomingInterventions = getUpcomingInterventions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Planning des Interventions
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Planifiez et suivez toutes vos interventions culturales
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle intervention
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-slate-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Planifiées</p>
              <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">En cours</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">En retard</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-100" />
          </div>
        </div>
      </div>

      {/* Alertes interventions à venir */}
      {upcomingInterventions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Interventions à venir (7 prochains jours)
          </h3>
          <div className="space-y-2">
            {upcomingInterventions.slice(0, 3).map(intervention => (
              <div key={intervention.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-3">
                  {getStatusIcon(intervention.status)}
                  <div>
                    <h4 className="font-medium text-slate-800">{intervention.title}</h4>
                    <p className="text-sm text-slate-600">
                      {new Date(intervention.planned_date).toLocaleDateString('fr-FR')} • {intervention.target_parcel || 'Non spécifié'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getPriorityColor(intervention.priority)}-100 text-${getPriorityColor(intervention.priority)}-800`}>
                    {getPriorityLabel(intervention.priority)}
                  </span>
                </div>
              </div>
            ))}
            {upcomingInterventions.length > 3 && (
              <p className="text-sm text-blue-700 text-center">
                +{upcomingInterventions.length - 3} autres interventions à venir
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une intervention..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Tous les statuts</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'planned' ? 'Planifiées' :
                  status === 'in_progress' ? 'En cours' :
                    status === 'completed' ? 'Terminées' : 'Annulées'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Toutes les priorités</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingIntervention ? 'Modifier l\'intervention' : 'Nouvelle intervention culturale'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type d'intervention *
                </label>
                <select
                  required
                  value={formData.intervention_type}
                  onChange={(e) => setFormData({ ...formData, intervention_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {interventionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Plantation de tomates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date prévue *
                </label>
                <input
                  type="date"
                  required
                  value={formData.planned_date}
                  onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'planned' ? 'Planifiée' :
                        status === 'in_progress' ? 'En cours' :
                          status === 'completed' ? 'Terminée' : 'Annulée'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Parcelle cible
                </label>
                <input
                  type="text"
                  value={formData.target_parcel}
                  onChange={(e) => setFormData({ ...formData, target_parcel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Champ Nord"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Culture concernée
                </label>
                <input
                  type="text"
                  value={formData.target_crop}
                  onChange={(e) => setFormData({ ...formData, target_crop: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Tomates, Maïs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Durée estimée (heures)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.estimated_duration_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_hours: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Personnel requis
                </label>
                <input
                  type="number"
                  value={formData.required_labor}
                  onChange={(e) => setFormData({ ...formData, required_labor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Coût estimé (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 150"
                />
              </div>

              {formData.status === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Coût réel (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.actual_cost}
                    onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ex: 145"
                  />
                </div>
              )}

              {formData.status === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date de réalisation
                  </label>
                  <input
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Équipements requis
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {equipmentOptions.map(equipment => (
                    <label key={equipment} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.required_equipment.includes(equipment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, required_equipment: [...formData.required_equipment, equipment] })
                          } else {
                            setFormData({ ...formData, required_equipment: formData.required_equipment.filter(eq => eq !== equipment) })
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      {equipment}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Description détaillée de l'intervention..."
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {editingIntervention ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des interventions */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Interventions ({getFilteredInterventions().length})
            </h3>
          </div>

          {getFilteredInterventions().length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucune intervention trouvée</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez par planifier votre première intervention'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredInterventions().map(intervention => {
                const isOverdue = new Date(intervention.planned_date) < new Date() && intervention.status === 'planned'

                return (
                  <div key={intervention.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(intervention.status)}
                          <div>
                            <h4 className="font-medium text-slate-800">{intervention.title}</h4>
                            <p className="text-sm text-slate-600">{intervention.intervention_type}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {new Date(intervention.planned_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>

                          {intervention.target_parcel && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{intervention.target_parcel}</span>
                            </div>
                          )}

                          {intervention.estimated_duration_hours && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{intervention.estimated_duration_hours}h</span>
                            </div>
                          )}

                          {intervention.required_labor && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{intervention.required_labor} personne(s)</span>
                            </div>
                          )}
                        </div>

                        {intervention.description && (
                          <p className="text-sm text-slate-600 mb-2">{intervention.description}</p>
                        )}

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getPriorityColor(intervention.priority)}-100 text-${getPriorityColor(intervention.priority)}-800`}>
                            {getPriorityLabel(intervention.priority)}
                          </span>

                          {intervention.required_equipment && intervention.required_equipment.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-600">
                              <Wrench className="w-3 h-3" />
                              {intervention.required_equipment.length} équipement(s)
                            </span>
                          )}

                          {isOverdue && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              En retard
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <select
                          value={intervention.status}
                          onChange={(e) => handleStatusChange(intervention.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status === 'planned' ? 'Planifiée' :
                                status === 'in_progress' ? 'En cours' :
                                  status === 'completed' ? 'Terminée' : 'Annulée'}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleEdit(intervention)}
                          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(intervention.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
