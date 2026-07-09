import { useState, useEffect } from 'react'
import { Droplets, Plus, Calendar, Clock, MapPin, Edit2, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.js'

export function IrrigationTracker() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [reservoirs, setReservoirs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({
    parcel_name: '',
    water_volume_m3: '',
    irrigation_duration_minutes: '',
    irrigation_method: '',
    weather_conditions: '',
    notes: ''
  })

  const irrigationMethods = [
    'Goutte-à-goutte',
    'Aspersion',
    'Pivot central',
    'Fertiligation',
    'Inondation',
    'Micro-aspersion',
    'Autre'
  ]

  const weatherConditions = [
    'Ensoleillé',
    'Nuageux',
    'Pluvieux',
    'Vent léger',
    'Vent fort',
    'Brouillard',
    'Humidité élevée'
  ]

  useEffect(() => {
    fetchIrrigationRecords()
    fetchReservoirs()
  }, [user])

  const fetchIrrigationRecords = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data: farm } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (farm) {
        const { data, error } = await supabase
          .from('irrigation_records')
          .select('*')
          .eq('farm_id', farm.id)
          .order('irrigation_date', { ascending: false })

        if (error) throw error
        setRecords(data || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des enregistrements d\'irrigation:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReservoirs = async () => {
    if (!user) return

    try {
      const { data: farm } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (farm) {
        const { data, error } = await supabase
          .from('water_reservoirs')
          .select('*')
          .eq('farm_id', farm.id)

        if (error) throw error
        setReservoirs(data || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservoirs:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      console.error('Utilisateur non connecté')
      return
    }

    try {
      const { data: farm } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!farm) throw new Error('Ferme non trouvée')

      const recordData = {
        farm_id: farm.id,
        ...formData,
        water_volume_m3: parseFloat(formData.water_volume_m3),
        irrigation_duration_minutes: formData.irrigation_duration_minutes ? parseInt(formData.irrigation_duration_minutes) : null
      }

      if (editingRecord) {
        const { error } = await supabase
          .from('irrigation_records')
          .update(recordData)
          .eq('id', editingRecord.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('irrigation_records')
          .insert(recordData)

        if (error) throw error
      }

      resetForm()
      fetchIrrigationRecords()
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      parcel_name: '',
      water_volume_m3: '',
      irrigation_duration_minutes: '',
      irrigation_method: '',
      weather_conditions: '',
      notes: ''
    })
    setShowForm(false)
    setEditingRecord(null)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setFormData({
      parcel_name: record.parcel_name,
      water_volume_m3: record.water_volume_m3.toString(),
      irrigation_duration_minutes: record.irrigation_duration_minutes?.toString() || '',
      irrigation_method: record.irrigation_method || '',
      weather_conditions: record.weather_conditions || '',
      notes: record.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      try {
        const { error } = await supabase
          .from('irrigation_records')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchIrrigationRecords()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const calculateWaterConsumption = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    return records
      .filter(record => {
        const recordDate = new Date(record.irrigation_date)
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
      })
      .reduce((total, record) => total + record.water_volume_m3, 0)
  }

  const getReservoirStatus = (reservoir) => {
    if (!reservoir.current_volume_m3 || !reservoir.capacity_m3) return null
    const percentage = (reservoir.current_volume_m3 / reservoir.capacity_m3) * 100

    if (percentage < 20) return { status: 'critical', color: 'red', icon: AlertTriangle }
    if (percentage < 50) return { status: 'warning', color: 'orange', icon: TrendingUp }
    return { status: 'good', color: 'green', icon: Droplets }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className=" p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            Suivi d'Irrigation
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Gérez votre consommation d'eau et optimisez votre irrigation
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvel enregistrement
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Consommation ce mois</p>
              <p className="text-2xl font-bold text-blue-600">{calculateWaterConsumption().toFixed(1)} m³</p>
            </div>
            <Droplets className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Nombre de réservoirs</p>
              <p className="text-2xl font-bold text-slate-800">{reservoirs.length}</p>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Enregistrements récents</p>
              <p className="text-2xl font-bold text-slate-800">{records.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-slate-100" />
          </div>
        </div>
      </div>

      {/* État des réservoirs */}
      {reservoirs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">État des réservoirs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservoirs.map(reservoir => {
              const status = getReservoirStatus(reservoir)
              const StatusIcon = status?.icon || Droplets

              return (
                <div key={reservoir.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{reservoir.reservoir_name}</h4>
                    <StatusIcon className={`w-5 h-5 text-${status?.color || 'grey'}-600`} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Volume actuel</span>
                      <span className="font-medium">{reservoir.current_volume_m3 || 0} m³</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Capacité</span>
                      <span className="font-medium">{reservoir.capacity_m3} m³</span>
                    </div>

                    {reservoir.current_volume_m3 && reservoir.capacity_m3 && (
                      <div className="mt-3">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`bg-${status?.color || 'grey'}-500 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min((reservoir.current_volume_m3 / reservoir.capacity_m3) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs text-${status?.color || 'grey'}-600 mt-1`}>
                          {((reservoir.current_volume_m3 / reservoir.capacity_m3) * 100).toFixed(1)}% rempli
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingRecord ? 'Modifier l\'enregistrement' : 'Nouvel enregistrement d\'irrigation'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom de la parcelle
                </label>
                <input
                  type="text"
                  required
                  value={formData.parcel_name}
                  onChange={(e) => setFormData({ ...formData, parcel_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Champ Nord, Parcelle A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Volume d'eau (m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.water_volume_m3}
                  onChange={(e) => setFormData({ ...formData, water_volume_m3: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 15.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={formData.irrigation_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, irrigation_duration_minutes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Méthode d'irrigation
                </label>
                <select
                  value={formData.irrigation_method}
                  onChange={(e) => setFormData({ ...formData, irrigation_method: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {irrigationMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Conditions météo
                </label>
                <select
                  value={formData.weather_conditions}
                  onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {weatherConditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Observations supplémentaires..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editingRecord ? 'Mettre à jour' : 'Enregistrer'}
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

      {/* Liste des enregistrements */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Historique d'irrigation</h3>

          {records.length === 0 ? (
            <div className="text-center py-8">
              <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucun enregistrement d'irrigation trouvé</p>
              <p className="text-sm text-slate-400 mt-1">Commencez par ajouter votre premier enregistrement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map(record => (
                <div key={record.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <h4 className="font-medium text-slate-800">{record.parcel_name}</h4>
                        <span className="text-sm text-slate-500">
                          {new Date(record.irrigation_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-600">{record.water_volume_m3} m³</span>
                        </div>

                        {record.irrigation_duration_minutes && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{record.irrigation_duration_minutes} min</span>
                          </div>
                        )}

                        {record.irrigation_method && (
                          <div>
                            <span className="text-slate-600">{record.irrigation_method}</span>
                          </div>
                        )}

                        {record.weather_conditions && (
                          <div>
                            <span className="text-slate-600">{record.weather_conditions}</span>
                          </div>
                        )}
                      </div>

                      {record.notes && (
                        <p className="text-sm text-slate-600 mt-2">{record.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
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
