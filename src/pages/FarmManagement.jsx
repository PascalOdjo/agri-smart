import { useState, useEffect } from 'react'
import { MapPin, Plus, Edit2, Save, X, Trash2, Home, Droplets, Calendar, AlertTriangle, Sprout, Grid3x3 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.js'

export function FarmManagement() {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [parcels, setParcels] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFarmForm, setShowFarmForm] = useState(false)
  const [showParcelForm, setShowParcelForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [editingParcel, setEditingParcel] = useState(null)
  const [selectedFarm, setSelectedFarm] = useState(null)

  // Form states
  const [farmForm, setFarmForm] = useState({
    farm_name: '',
    region: '',
    department: '',
    commune: '',
    gps_lat: '',
    gps_lng: '',
    farm_size: '',
    main_crops: '',
    production_goal: '',
    equipment: '',
    weather_station: '',
    notes: ''
  })

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
    fetchFarms()
    fetchCrops()
  }, [user])

  useEffect(() => {
    if (selectedFarm) {
      fetchParcels(selectedFarm.id)
    }
  }, [selectedFarm])

  const fetchFarms = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setFarms(data || [])
      if (data && data.length > 0) {
        setSelectedFarm(data[0])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des fermes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParcels = async (farmId) => {
    try {
      const { data, error } = await supabase
        .from('parcels')
        .select('*, crops(*)')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setParcels(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des parcelles:', error)
    }
  }

  const fetchCrops = async () => {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setCrops(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des cultures:', error)
    }
  }

  const handleSaveFarm = async () => {
    try {
      const farmData = {
        ...farmForm,
        user_id: user.id,
        gps_lat: parseFloat(farmForm.gps_lat) || null,
        gps_lng: parseFloat(farmForm.gps_lng) || null,
        farm_size: parseFloat(farmForm.farm_size) || null
      }

      if (editingFarm) {
        const { error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', editingFarm.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('farms')
          .insert(farmData)

        if (error) throw error
      }

      resetFarmForm()
      fetchFarms()
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la ferme:', error)
    }
  }

  const handleSaveParcel = async () => {
    if (!selectedFarm) return

    try {
      const parcelData = {
        ...parcelForm,
        farm_id: selectedFarm.id,
        surface_area: parseFloat(parcelForm.surface_area) || null,
        gps_coordinates: {
          lat: parseFloat(parcelForm.gps_lat) || null,
          lng: parseFloat(parcelForm.gps_lng) || null
        }
      }

      if (editingParcel) {
        const { error } = await supabase
          .from('parcels')
          .update(parcelData)
          .eq('id', editingParcel.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('parcels')
          .insert(parcelData)

        if (error) throw error
      }

      resetParcelForm()
      fetchParcels(selectedFarm.id)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la parcelle:', error)
    }
  }

  const handleDeleteFarm = async (farmId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ferme ? Toutes les parcelles associées seront également supprimées.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId)

      if (error) throw error

      if (selectedFarm?.id === farmId) {
        setSelectedFarm(null)
        setParcels([])
      }

      fetchFarms()
    } catch (error) {
      console.error('Erreur lors de la suppression de la ferme:', error)
    }
  }

  const handleDeleteParcel = async (parcelId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette parcelle ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('parcels')
        .delete()
        .eq('id', parcelId)

      if (error) throw error
      fetchParcels(selectedFarm.id)
    } catch (error) {
      console.error('Erreur lors de la suppression de la parcelle:', error)
    }
  }

  const resetFarmForm = () => {
    setFarmForm({
      farm_name: '',
      region: '',
      department: '',
      commune: '',
      gps_lat: '',
      gps_lng: '',
      farm_size: '',
      main_crops: '',
      production_goal: '',
      equipment: '',
      weather_station: '',
      notes: ''
    })
    setEditingFarm(null)
    setShowFarmForm(false)
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

  const handleEditFarm = (farm) => {
    setFarmForm({
      farm_name: farm.farm_name || '',
      region: farm.region || '',
      department: farm.department || '',
      commune: farm.commune || '',
      gps_lat: farm.gps_lat?.toString() || '',
      gps_lng: farm.gps_lng?.toString() || '',
      farm_size: farm.farm_size?.toString() || '',
      main_crops: farm.main_crops || '',
      production_goal: farm.production_goal || '',
      equipment: farm.equipment || '',
      weather_station: farm.weather_station || '',
      notes: farm.notes || ''
    })
    setEditingFarm(farm)
    setShowFarmForm(true)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Home className="w-6 h-6 text-emerald-600" />
            Gestion des Fermes et Parcelles
          </h1>
          <p className="text-slate-600 mt-1">
            Gérez vos fermes et délimitez vos parcelles de culture
          </p>
        </div>
        <button
          onClick={() => setShowFarmForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle ferme
        </button>
      </div>

      {/* Liste des fermes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map(farm => (
          <div
            key={farm.id}
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${selectedFarm?.id === farm.id
              ? 'border-emerald-500 shadow-lg'
              : 'border-slate-200 hover:border-emerald-300'
              }`}
            onClick={() => setSelectedFarm(farm)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1">{farm.farm_name}</h3>
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {farm.commune}, {farm.department}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditFarm(farm)
                  }}
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFarm(farm.id)
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-slate-600">
                <span className="font-medium">Superficie:</span> {farm.farm_size} ha
              </p>
              <p className="text-slate-600">
                <span className="font-medium">Cultures principales:</span> {farm.main_crops}
              </p>
            </div>
          </div>
        ))}

        {farms.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-8">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucune ferme enregistrée</p>
            <p className="text-sm text-slate-400 mt-1">Commencez par ajouter votre première ferme</p>
          </div>
        )}
      </div>

      {/* Informations détaillées de la ferme sélectionnée */}
      {selectedFarm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            Détails - {selectedFarm.farm_name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-800 mb-3">Informations générales</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600">Nom de la ferme:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.farm_name || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Superficie totale:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.farm_size || '0'} hectares</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Cultures principales:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.main_crops || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Objectif de production:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.production_goal || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-800 mb-3">Localisation</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600">Région:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.region || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Département:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.department || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Commune:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.commune || 'Non renseigné'}</p>
                </div>
                {(selectedFarm.gps_lat && selectedFarm.gps_lng) && (
                  <div>
                    <span className="text-sm text-slate-600">Coordonnées GPS:</span>
                    <p className="font-medium text-slate-800">
                      {selectedFarm.gps_lat.toFixed(6)}, {selectedFarm.gps_lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Équipements et notes */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-800 mb-3">Équipements</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600">Équipements:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.equipment || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Station météo:</span>
                  <p className="font-medium text-slate-800">{selectedFarm.weather_station || 'Non renseigné'}</p>
                </div>
                {selectedFarm.notes && (
                  <div>
                    <span className="text-sm text-slate-600">Notes:</span>
                    <p className="font-medium text-slate-800">{selectedFarm.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques de la ferme */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-medium text-slate-800 mb-4">Statistiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{parcels.length}</p>
                    <p className="text-sm text-slate-600">Parcelles</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {parcels.filter(p => p.status === 'active').length}
                    </p>
                    <p className="text-sm text-slate-600">Parcelles actives</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {parcels.filter(p => p.irrigation_type).length}
                    </p>
                    <p className="text-sm text-slate-600">Avec irrigation</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {parcels.reduce((total, parcel) =>
                        total + (parcel.surface_area || 0), 0
                      ).toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-600">Superficie totale (ha)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Parcelles de la ferme sélectionnée */}
      {selectedFarm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-emerald-600" />
              Parcelles - {selectedFarm.farm_name}
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
              <p className="text-slate-500">Aucune parcelle pour cette ferme</p>
              <p className="text-sm text-slate-400 mt-1">Ajoutez votre première parcelle pour commencer</p>
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
                        {parcel.crops?.name || 'Aucune culture assignée'}
                      </span>
                    </div>

                    {parcel.soil_type && (
                      <p className="text-slate-600">
                        <span className="font-medium">Sol:</span> {parcel.soil_type}
                      </p>
                    )}

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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Formulaire ferme */}
      {showFarmForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {editingFarm ? 'Modifier la ferme' : 'Nouvelle ferme'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la ferme</label>
                <input
                  type="text"
                  value={farmForm.farm_name}
                  onChange={(e) => setFarmForm({ ...farmForm, farm_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Superficie (ha)</label>
                <input
                  type="number"
                  value={farmForm.farm_size}
                  onChange={(e) => setFarmForm({ ...farmForm, farm_size: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Région</label>
                <input
                  type="text"
                  value={farmForm.region}
                  onChange={(e) => setFarmForm({ ...farmForm, region: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                <input
                  type="text"
                  value={farmForm.department}
                  onChange={(e) => setFarmForm({ ...farmForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Commune</label>
                <input
                  type="text"
                  value={farmForm.commune}
                  onChange={(e) => setFarmForm({ ...farmForm, commune: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={farmForm.gps_lat}
                  onChange={(e) => setFarmForm({ ...farmForm, gps_lat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={farmForm.gps_lng}
                  onChange={(e) => setFarmForm({ ...farmForm, gps_lng: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cultures principales</label>
                <input
                  type="text"
                  value={farmForm.main_crops}
                  onChange={(e) => setFarmForm({ ...farmForm, main_crops: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={farmForm.notes}
                  onChange={(e) => setFarmForm({ ...farmForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveFarm}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {editingFarm ? 'Mettre à jour' : 'Enregistrer'}
              </button>
              <button
                onClick={resetFarmForm}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire parcelle */}
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
    </div>
  )
}
