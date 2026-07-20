import { useEffect, useState } from 'react'
import { MapPin, Target, Wrench, Cloud, Home, Plus, Edit2, Save, X, Droplets, Thermometer, Wind, Sun, AlertTriangle, AlertCircle, Info, BarChart3, Calendar, TrendingUp, Umbrella, Grid3x3, Sprout, Trash2 } from 'lucide-react'
import { get, post, put, del } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'
import { FarmMap } from '../components/FarmMap.jsx'

export function Farm() {
  const { user } = useAuth()
  const [farm, setFarm] = useState(null)
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showParcelForm, setShowParcelForm] = useState(false)
  const [editingParcel, setEditingParcel] = useState(null)

  // Form states
  const [farmName, setFarmName] = useState('')
  const [region, setRegion] = useState('')
  const [department, setDepartment] = useState('')
  const [commune, setCommune] = useState('')
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: '', lng: '' })
  const [farmSize, setFarmSize] = useState('')
  const [mainCrops, setMainCrops] = useState('')
  const [productionGoal, setProductionGoal] = useState('')
  const [equipment, setEquipment] = useState('')
  const [weatherStation, setWeatherStation] = useState('')
  const [notes, setNotes] = useState('')
  const [weatherMenu, setWeatherMenu] = useState('current')

  // Parcel form state
  const [parcelForm, setParcelForm] = useState({
    name: '',
    surface_area: '',
    soil_type: '',
    irrigation_type: '',
    planting_date: '',
    expected_harvest_date: '',
    status: 'active',
    notes: '',
    gps_lat: '',
    gps_lng: ''
  })

  useEffect(() => {
    fetchFarm()
  }, [user])

  useEffect(() => {
    if (farm) {
      fetchParcels(farm.id)
    }
  }, [farm])

  async function fetchFarm() {
    if (!user) return

    setLoading(true)
    try {
      const res = await get(`/farms?userId=${user.id}`)
      const data = res?.farm || (res?.farms && res.farms[0])
      if (data) {
        setFarm(data)
        setFarmName(data.farm_name || '')
        setRegion(data.region || '')
        setDepartment(data.department || '')
        setCommune(data.commune || '')
        setGpsCoordinates({
          lat: data.gps_lat || '',
          lng: data.gps_lng || ''
        })
        setFarmSize(data.farm_size || '')
        setMainCrops(data.main_crops || '')
        setProductionGoal(data.production_goal || '')
        setEquipment(data.equipment || '')
        setWeatherStation(data.weather_station || '')
        setNotes(data.notes || '')
      }
    } catch (err) {
      console.error('Erreur fetch farm:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchParcels = async (farmId) => {
    try {
      const res = await get(`/parcels?farmId=${farmId}`)
      setParcels(res?.parcels || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des parcelles:', error)
    }
  }

  const handleSaveParcel = async () => {
    if (!farm) return

    try {
      const parcelData = {
        ...parcelForm,
        farm_id: farm.id,
        surface_area: parseFloat(parcelForm.surface_area) || null,
        gps_coordinates: {
          lat: parseFloat(parcelForm.gps_lat) || null,
          lng: parseFloat(parcelForm.gps_lng) || null
        }
      }

      if (editingParcel) {
        try {
          await put(`/parcels/${editingParcel.id}`, parcelData)
        } catch (error) {
          console.error('Erreur update parcel:', error)
        }
      } else {
        try {
          await post('/parcels', parcelData)
        } catch (error) {
          console.error('Erreur insert parcel:', error)
        }
      }

      resetParcelForm()
      fetchParcels(farm.id)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la parcelle:', error)
    }
  }

  const handleDeleteParcel = async (parcelId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      return
    }

    try {
      await del(`/parcels/${parcelId}`)
      fetchParcels(farm.id)
    } catch (error) {
      console.error('Erreur lors de la suppression de la parcelle:', error)
    }
  }

  const resetParcelForm = () => {
    setParcelForm({
      name: '',
      surface_area: '',
      soil_type: '',
      irrigation_type: '',
      planting_date: '',
      expected_harvest_date: '',
      status: 'active',
      notes: '',
      gps_lat: '',
      gps_lng: ''
    })
    setEditingParcel(null)
    setShowParcelForm(false)
  }

  const handleEditParcel = (parcel) => {
    setParcelForm({
      name: parcel.name || '',
      surface_area: parcel.surface_area?.toString() || '',
      soil_type: parcel.soil_type || '',
      irrigation_type: parcel.irrigation_type || '',
      planting_date: parcel.planting_date || '',
      expected_harvest_date: parcel.expected_harvest_date || '',
      status: parcel.status || 'active',
      notes: parcel.notes || '',
      gps_lat: parcel.gps_coordinates?.lat?.toString() || '',
      gps_lng: parcel.gps_coordinates?.lng?.toString() || ''
    })
    setEditingParcel(parcel)
    setShowParcelForm(true)
  }

  async function saveFarm(e) {
    e.preventDefault()
    setSaving(true)

    const farmData = {
      user_id: user.id,
      farm_name: farmName,
      region,
      department,
      commune,
      gps_lat: parseFloat(gpsCoordinates.lat) || null,
      gps_lng: parseFloat(gpsCoordinates.lng) || null,
      farm_size: parseFloat(farmSize) || null,
      main_crops: mainCrops,
      production_goal: productionGoal,
      equipment,
      weather_station: weatherStation,
      notes
    }

    try {
      await post('/farms/upsert', farmData)
      setFarm(farmData)
      setEditing(false)
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
    }

    setSaving(false)
  }

  function startEditing() {
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    if (farm) {
      setFarmName(farm.farm_name || '')
      setRegion(farm.region || '')
      setDepartment(farm.department || '')
      setCommune(farm.commune || '')
      setGpsCoordinates({
        lat: farm.gps_lat?.toString() || '',
        lng: farm.gps_lng?.toString() || ''
      })
      setFarmSize(farm.farm_size?.toString() || '')
      setMainCrops(farm.main_crops || '')
      setProductionGoal(farm.production_goal || '')
      setEquipment(farm.equipment || '')
      setWeatherStation(farm.weather_station || '')
      setNotes(farm.notes || '')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Home className="w-8 h-8 text-emerald-600" />
            Ma Ferme
          </h1>
          <p className="text-slate-600 mt-2">
            Gérez les informations de votre exploitation agricole et délimitez vos parcelles
          </p>
        </div>
        <button
          onClick={startEditing}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Edit2 className="w-5 h-5" />
          Modifier
        </button>
      </div>

      {/* Farm Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Localisation</h3>
              <p className="text-sm text-slate-600">Informations géographiques</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-600">Région:</span>
              <p className="font-medium text-slate-800">
                {farm?.region || 'Non renseignée'}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Département:</span>
              <p className="font-medium text-slate-800">
                {farm?.department || 'Non renseigné'}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Commune:</span>
              <p className="font-medium text-slate-800">
                {farm?.commune || 'Non renseignée'}
              </p>
            </div>
            {(farm?.gps_lat && farm?.gps_lng) && (
              <div>
                <span className="text-sm text-slate-600">Coordonnées GPS:</span>
                <p className="font-medium text-slate-800">
                  {farm.gps_lat.toFixed(6)}, {farm.gps_lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Production</h3>
              <p className="text-sm text-slate-600">Objectifs et cultures</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-600">Superficie:</span>
              <p className="font-medium text-slate-800">
                {farm?.farm_size ? `${farm.farm_size} hectares` : 'Non renseignée'}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Cultures principales:</span>
              <p className="font-medium text-slate-800">
                {farm?.main_crops || 'Non renseignées'}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Objectif de production:</span>
              <p className="font-medium text-slate-800">
                {farm?.production_goal || 'Non renseigné'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Équipements</h3>
              <p className="text-sm text-slate-600">Matériel et installations</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-600">Équipements:</span>
              <p className="font-medium text-slate-800">
                {farm?.equipment || 'Non renseignés'}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Station météo:</span>
              <p className="font-medium text-slate-800">
                {farm?.weather_station || 'Non renseignée'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Statistiques</h3>
              <p className="text-sm text-slate-600">Vue d'ensemble</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-600">Nombre de parcelles:</span>
              <p className="font-medium text-slate-800">{parcels.length}</p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Parcelles actives:</span>
              <p className="font-medium text-slate-800">
                {parcels.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-600">Superficie totale:</span>
              <p className="font-medium text-slate-800">
                {parcels.reduce((total, parcel) => total + (parcel.surface_area || 0), 0).toFixed(1)} ha
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Modifier les informations</h2>
            <button
              onClick={cancelEditing}
              className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={saveFarm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom de la ferme
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nom de votre ferme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Superficie (hectares)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Superficie en hectares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Région
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Région"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Département
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Département"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Commune
                </label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Commune"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Latitude GPS
                </label>
                <input
                  type="number"
                  step="any"
                  value={gpsCoordinates.lat}
                  onChange={(e) => setGpsCoordinates({ ...gpsCoordinates, lat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Latitude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Longitude GPS
                </label>
                <input
                  type="number"
                  step="any"
                  value={gpsCoordinates.lng}
                  onChange={(e) => setGpsCoordinates({ ...gpsCoordinates, lng: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Longitude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cultures principales
                </label>
                <input
                  type="text"
                  value={mainCrops}
                  onChange={(e) => setMainCrops(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Cultures principales"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Objectif de production
                </label>
                <input
                  type="text"
                  value={productionGoal}
                  onChange={(e) => setProductionGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Objectif de production"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Équipements
                </label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Équipements disponibles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Station météo
                </label>
                <input
                  type="text"
                  value={weatherStation}
                  onChange={(e) => setWeatherStation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Station météo"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Notes supplémentaires..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Parcelles Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-emerald-600" />
            Parcelles de culture
          </h2>
          <button
            onClick={() => setShowParcelForm(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle parcelle
          </button>
        </div>

        {parcels.length === 0 ? (
          <div className="text-center py-8">
            <Grid3x3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucune parcelle enregistrée</p>
            <p className="text-sm text-slate-400 mt-1">Commencez par ajouter votre première parcelle</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parcels.map(parcel => (
              <div key={parcel.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 mb-1">{parcel.name}</h4>
                    <p className="text-sm text-slate-600">
                      {parcel.surface_area} ha
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditParcel(parcel)}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteParcel(parcel.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    <span className="text-slate-600">
                      Type de sol: {parcel.soil_type || 'Non spécifié'}
                    </span>
                  </div>

                  {parcel.irrigation_type && (
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">{parcel.irrigation_type}</span>
                    </div>
                  )}

                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${parcel.status === 'active' ? 'bg-green-100 text-green-700' :
                      parcel.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                        parcel.status === 'harvested' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                    }`}>
                    {parcel.status === 'active' ? 'Active' :
                      parcel.status === 'preparing' ? 'Préparation' :
                        parcel.status === 'harvested' ? 'Récoltée' : 'Inactive'}
                  </div>

                  {parcel.planting_date && (
                    <p className="text-slate-600">
                      Plantation: {new Date(parcel.planting_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}

                  {parcel.expected_harvest_date && (
                    <p className="text-slate-600">
                      Récolte prévue: {new Date(parcel.expected_harvest_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parcel Form Modal */}
      {showParcelForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {editingParcel ? 'Modifier la parcelle' : 'Nouvelle parcelle'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la parcelle</label>
                <input
                  type="text"
                  value={parcelForm.name}
                  onChange={(e) => setParcelForm({ ...parcelForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Superficie (ha)</label>
                <input
                  type="number"
                  value={parcelForm.surface_area}
                  onChange={(e) => setParcelForm({ ...parcelForm, surface_area: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de sol</label>
                <input
                  type="text"
                  value={parcelForm.soil_type}
                  onChange={(e) => setParcelForm({ ...parcelForm, soil_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type d'irrigation</label>
                <input
                  type="text"
                  value={parcelForm.irrigation_type}
                  onChange={(e) => setParcelForm({ ...parcelForm, irrigation_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date de plantation</label>
                <input
                  type="date"
                  value={parcelForm.planting_date}
                  onChange={(e) => setParcelForm({ ...parcelForm, planting_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date de récolte prévue</label>
                <input
                  type="date"
                  value={parcelForm.expected_harvest_date}
                  onChange={(e) => setParcelForm({ ...parcelForm, expected_harvest_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                <select
                  value={parcelForm.status}
                  onChange={(e) => setParcelForm({ ...parcelForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="preparing">Préparation</option>
                  <option value="inactive">Inactive</option>
                  <option value="harvested">Récoltée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={parcelForm.gps_lat}
                  onChange={(e) => setParcelForm({ ...parcelForm, gps_lat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={parcelForm.gps_lng}
                  onChange={(e) => setParcelForm({ ...parcelForm, gps_lng: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={parcelForm.notes}
                  onChange={(e) => setParcelForm({ ...parcelForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveParcel}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {editingParcel ? 'Mettre à jour' : 'Enregistrer'}
              </button>
              <button
                onClick={resetParcelForm}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Section */}
      {(farm?.gps_lat && farm?.gps_lng) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Carte de la ferme
          </h2>
          <FarmMap
            farmName={farm.farm_name}
            lat={farm.gps_lat}
            lng={farm.gps_lng}
            parcels={parcels}
          />
        </div>
      )}
    </div>
  )
}
