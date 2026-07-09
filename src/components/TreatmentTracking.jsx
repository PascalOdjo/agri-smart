import { useState, useEffect } from 'react'
import { Beaker, Plus, Search, Filter, Calendar, MapPin, Droplets, Leaf, AlertTriangle, Edit2, Trash2, TrendingUp, BarChart3, Star } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.js'

export function TreatmentTracking() {
  const { user } = useAuth()
  const [treatments, setTreatments] = useState([])
  const [interventions, setInterventions] = useState([])
  const [fertilizers, setFertilizers] = useState([])
  const [phytoProducts, setPhytoProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')

  const [formData, setFormData] = useState({
    intervention_id: '',
    treatment_date: new Date().toISOString().split('T')[0],
    treatment_type: '',
    product_id: '',
    product_name: '',
    application_method: '',
    dose_applied: '',
    dose_unit: '',
    treated_area: '',
    weather_conditions: '',
    operator_name: '',
    equipment_used: '',
    observations: '',
    efficacy_rating: '',
    phytotoxicity_observed: false
  })

  const treatmentTypes = ['Fertilisation', 'Phytosanitaire', 'Biostimulant', 'Amendement', 'Autre']
  const applicationMethods = [
    'Pulvérisation terrestre', 'Pulvérisation aérienne', 'Épandage', 'Irrigation ferti',
    'Injection sol', 'Traitement semence', 'Localisé', 'Autre'
  ]
  const doseUnits = ['L/ha', 'kg/ha', 'g/ha', 'mL/ha', 't/ha', 'unité/ha']
  const weatherConditions = ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Vent léger', 'Vent fort', 'Brouillard', 'Humidité élevée']

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const { data: farm } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (farm) {
        const [
          treatmentsResult,
          interventionsResult,
          fertilizersResult,
          phytoResult
        ] = await Promise.all([
          supabase
            .from('treatment_applications')
            .select('*, cultural_interventions(intervention_type, title, target_parcel)')
            .eq('farm_id', farm.id)
            .order('treatment_date', { ascending: false }),

          supabase
            .from('cultural_interventions')
            .select('id, title, intervention_type, target_parcel')
            .eq('farm_id', farm.id)
            .eq('status', 'completed'),

          supabase
            .from('fertilizers')
            .select('id, product_name, product_type, npk_ratio')
            .eq('farm_id', farm.id),

          supabase
            .from('phyto_products')
            .select('id, product_name, product_type, active_ingredient')
            .eq('farm_id', farm.id)
        ])

        if (treatmentsResult.error) throw treatmentsResult.error
        if (interventionsResult.error) throw interventionsResult.error
        if (fertilizersResult.error) throw fertilizersResult.error
        if (phytoResult.error) throw phytoResult.error

        setTreatments(treatmentsResult.data || [])
        setInterventions(interventionsResult.data || [])
        setFertilizers(fertilizersResult.data || [])
        setPhytoProducts(phytoResult.data || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data: farm } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!farm) throw new Error('Ferme non trouvée')

      const treatmentData = {
        farm_id: farm.id,
        ...formData,
        dose_applied: parseFloat(formData.dose_applied),
        treated_area: parseFloat(formData.treated_area),
        efficacy_rating: formData.efficacy_rating ? parseInt(formData.efficacy_rating) : null,
        intervention_id: formData.intervention_id || null
      }

      if (editingTreatment) {
        const { error } = await supabase
          .from('treatment_applications')
          .update(treatmentData)
          .eq('id', editingTreatment.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('treatment_applications')
          .insert(treatmentData)

        if (error) throw error
      }

      resetForm()
      fetchData()
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      intervention_id: '',
      treatment_date: new Date().toISOString().split('T')[0],
      treatment_type: '',
      product_id: '',
      product_name: '',
      application_method: '',
      dose_applied: '',
      dose_unit: '',
      treated_area: '',
      weather_conditions: '',
      operator_name: '',
      equipment_used: '',
      observations: '',
      efficacy_rating: '',
      phytotoxicity_observed: false
    })
    setShowForm(false)
    setEditingTreatment(null)
  }

  const handleEdit = (treatment) => {
    setEditingTreatment(treatment)
    setFormData({
      intervention_id: treatment.intervention_id || '',
      treatment_date: treatment.treatment_date.split('T')[0],
      treatment_type: treatment.treatment_type,
      product_id: treatment.product_id || '',
      product_name: treatment.product_name,
      application_method: treatment.application_method || '',
      dose_applied: treatment.dose_applied.toString(),
      dose_unit: treatment.dose_unit,
      treated_area: treatment.treated_area.toString(),
      weather_conditions: treatment.weather_conditions || '',
      operator_name: treatment.operator_name || '',
      equipment_used: treatment.equipment_used || '',
      observations: treatment.observations || '',
      efficacy_rating: treatment.efficacy_rating?.toString() || '',
      phytotoxicity_observed: treatment.phytotoxicity_observed || false
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce traitement ?')) {
      try {
        const { error } = await supabase
          .from('treatment_applications')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchData()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const getFilteredTreatments = () => {
    let filtered = treatments

    if (searchTerm) {
      filtered = filtered.filter(treatment =>
        treatment.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.observations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.operator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.cultural_interventions?.target_parcel?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(treatment => treatment.treatment_type === filterType)
    }

    if (filterDateRange !== 'all') {
      const today = new Date()
      const filterDate = new Date()

      switch (filterDateRange) {
        case '7days':
          filterDate.setDate(today.getDate() - 7)
          break
        case '30days':
          filterDate.setDate(today.getDate() - 30)
          break
        case '3months':
          filterDate.setMonth(today.getMonth() - 3)
          break
        case 'year':
          filterDate.setFullYear(today.getFullYear() - 1)
          break
      }

      filtered = filtered.filter(treatment =>
        new Date(treatment.treatment_date) >= filterDate
      )
    }

    return filtered
  }

  const getTreatmentStats = () => {
    const filtered = getFilteredTreatments()
    const total = filtered.length
    const fertilization = filtered.filter(t => t.treatment_type === 'Fertilisation').length
    const phyto = filtered.filter(t => t.treatment_type === 'Phytosanitaire').length
    const avgEfficacy = filtered
      .filter(t => t.efficacy_rating)
      .reduce((sum, t) => sum + t.efficacy_rating, 0) / filtered.filter(t => t.efficacy_rating).length || 0
    const phytotoxicityCases = filtered.filter(t => t.phytotoxicity_observed).length

    return { total, fertilization, phyto, avgEfficacy, phytotoxicityCases }
  }

  const getMostUsedProducts = () => {
    const productUsage = {}
    treatments.forEach(treatment => {
      productUsage[treatment.product_name] = (productUsage[treatment.product_name] || 0) + 1
    })

    return Object.entries(productUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }

  const getAvailableProducts = () => {
    if (formData.treatment_type === 'Fertilisation') {
      return fertilizers
    } else if (formData.treatment_type === 'Phytosanitaire') {
      return phytoProducts
    }
    return []
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const stats = getTreatmentStats()
  const mostUsedProducts = getMostUsedProducts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Beaker className="w-5 h-5 text-emerald-600" />
            Traçabilité des Traitements
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Suivez et analysez tous vos traitements appliqués
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau traitement
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total traitements</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <Beaker className="w-8 h-8 text-slate-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Fertilisations</p>
              <p className="text-2xl font-bold text-green-600">{stats.fertilization}</p>
            </div>
            <Droplets className="w-8 h-8 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Phytosanitaires</p>
              <p className="text-2xl font-bold text-orange-600">{stats.phyto}</p>
            </div>
            <Leaf className="w-8 h-8 text-orange-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Efficacité moyenne</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.avgEfficacy.toFixed(1)}/5
              </p>
            </div>
            <Star className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Phytotoxicité</p>
              <p className="text-2xl font-bold text-red-600">{stats.phytotoxicityCases}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-100" />
          </div>
        </div>
      </div>

      {/* Produits les plus utilisés */}
      {mostUsedProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Produits les plus utilisés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {mostUsedProducts.map((product, index) => (
              <div key={product.name} className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-emerald-600 font-bold">#{index + 1}</span>
                </div>
                <p className="text-sm font-medium text-slate-800">{product.name}</p>
                <p className="text-xs text-slate-600">{product.count} applications</p>
              </div>
            ))}
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
              placeholder="Rechercher un traitement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Tous les types</option>
            {treatmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="3months">3 derniers mois</option>
            <option value="year">Dernière année</option>
          </select>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingTreatment ? 'Modifier le traitement' : 'Nouveau traitement'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type de traitement *
                </label>
                <select
                  required
                  value={formData.treatment_type}
                  onChange={(e) => setFormData({ ...formData, treatment_type: e.target.value, product_id: '', product_name: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {treatmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de traitement *
                </label>
                <input
                  type="date"
                  required
                  value={formData.treatment_date}
                  onChange={(e) => setFormData({ ...formData, treatment_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Intervention associée
                </label>
                <select
                  value={formData.intervention_id}
                  onChange={(e) => setFormData({ ...formData, intervention_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {interventions.map(intervention => (
                    <option key={intervention.id} value={intervention.id}>
                      {intervention.title} - {intervention.target_parcel || 'Non spécifié'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Produit *
                </label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => {
                    const selectedProduct = getAvailableProducts().find(p => p.id === e.target.value)
                    setFormData({
                      ...formData,
                      product_id: e.target.value,
                      product_name: selectedProduct?.product_name || ''
                    })
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {getAvailableProducts().map(product => (
                    <option key={product.id} value={product.id}>
                      {product.product_name} {product.npk_ratio && `(${product.npk_ratio})`} {product.active_ingredient && `- ${product.active_ingredient}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du produit (manuel)
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Si non trouvé dans la liste"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Méthode d'application *
                </label>
                <select
                  required
                  value={formData.application_method}
                  onChange={(e) => setFormData({ ...formData, application_method: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {applicationMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dose appliquée *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.dose_applied}
                  onChange={(e) => setFormData({ ...formData, dose_applied: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unité de dose *
                </label>
                <select
                  required
                  value={formData.dose_unit}
                  onChange={(e) => setFormData({ ...formData, dose_unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {doseUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Surface traitée (ha) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.treated_area}
                  onChange={(e) => setFormData({ ...formData, treated_area: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Conditions météo
                </label>
                <select
                  value={formData.weather_conditions}
                  onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {weatherConditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Opérateur
                </label>
                <input
                  type="text"
                  value={formData.operator_name}
                  onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nom de l'opérateur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Équipement utilisé
                </label>
                <input
                  type="text"
                  value={formData.equipment_used}
                  onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Pulvérisateur John Deere"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Efficacité (1-5)
                </label>
                <select
                  value={formData.efficacy_rating}
                  onChange={(e) => setFormData({ ...formData, efficacy_rating: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Non évalué</option>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>{rating} - {rating <= 2 ? 'Faible' : rating <= 3 ? 'Moyenne' : rating <= 4 ? 'Bonne' : 'Excellente'}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.phytotoxicity_observed}
                    onChange={(e) => setFormData({ ...formData, phytotoxicity_observed: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Phytotoxicité observée
                </label>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observations
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Observations sur l'efficacité, les conditions, etc."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {editingTreatment ? 'Mettre à jour' : 'Enregistrer'}
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

      {/* Liste des traitements */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Traitements ({getFilteredTreatments().length})
            </h3>
          </div>

          {getFilteredTreatments().length === 0 ? (
            <div className="text-center py-8">
              <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucun traitement trouvé</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm || filterType !== 'all' || filterDateRange !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez par enregistrer votre premier traitement'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredTreatments().map(treatment => (
                <div key={treatment.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${treatment.treatment_type === 'Fertilisation' ? 'bg-green-100' :
                          treatment.treatment_type === 'Phytosanitaire' ? 'bg-orange-100' : 'bg-blue-100'
                          }`}>
                          {treatment.treatment_type === 'Fertilisation' ? (
                            <Droplets className="w-5 h-5 text-green-600" />
                          ) : treatment.treatment_type === 'Phytosanitaire' ? (
                            <Leaf className="w-5 h-5 text-orange-600" />
                          ) : (
                            <Beaker className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">{treatment.product_name}</h4>
                          <p className="text-sm text-slate-600">{treatment.treatment_type}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {new Date(treatment.treatment_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Beaker className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {treatment.dose_applied} {treatment.dose_unit}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {treatment.treated_area} ha
                          </span>
                        </div>

                        {treatment.operator_name && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">👤</span>
                            <span className="text-slate-600">{treatment.operator_name}</span>
                          </div>
                        )}
                      </div>

                      {treatment.observations && (
                        <p className="text-sm text-slate-600 mb-2">{treatment.observations}</p>
                      )}

                      <div className="flex items-center gap-2">
                        {treatment.efficacy_rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-slate-600">Efficacité:</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= treatment.efficacy_rating ? 'text-yellow-500 fill-current' : 'text-slate-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {treatment.phytotoxicity_observed && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Phytotoxicité
                          </span>
                        )}

                        {treatment.application_method && (
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {treatment.application_method}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(treatment)}
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(treatment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
