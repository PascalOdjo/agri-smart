import { useEffect, useState } from 'react'
import { MapPin, Target, Wrench, Cloud, Home, Plus, Edit2, Save, X, Droplets, Thermometer, Wind, Sun } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.js'
import { FarmMap } from '../components/FarmMap.jsx'

export function Farm() {
  const { user } = useAuth()
  const [farm, setFarm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

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

  useEffect(() => {
    fetchFarm()
  }, [user])

  async function fetchFarm() {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id)
      .single()

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
    setLoading(false)
  }

  async function handleSave() {
    if (!user) return

    setSaving(true)
    try {
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
        notes,
        updated_at: new Date().toISOString()
      }

      if (farm) {
        // Update existing farm
        const { error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', farm.id)

        if (error) throw error
      } else {
        // Create new farm
        const { error } = await supabase
          .from('farms')
          .insert(farmData)

        if (error) throw error
      }

      await fetchFarm()
      setEditing(false)
    } catch (error) {
      console.error('Error saving farm:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">Ma Ferme</h1>
        <p className="text-emerald-700 max-w-2xl mx-auto">
          Gérez les informations de votre ferme, suivez vos activités et optimisez votre production.
        </p>
      </div>

      {editing ? (
        /* Edit Form */
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {farm ? 'Modifier ma ferme' : 'Enregistrer ma ferme'}
            </h2>
            <button
              onClick={() => setEditing(false)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Informations générales
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la ferme *</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Taille (hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cultures principales</label>
                <input
                  type="text"
                  value={mainCrops}
                  onChange={(e) => setMainCrops(e.target.value)}
                  placeholder="Ex: Maïs, Manioc, Igname"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation géographique
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Région *</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="">Sélectionner une région</option>
                    <option value="Savanes">Savanes</option>
                    <option value="Kara">Kara</option>
                    <option value="Centrale">Centrale</option>
                    <option value="Plateaux">Plateaux</option>
                    <option value="Maritime">Maritime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ex: Lomé, Sokodé"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Commune</label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="Ex: Bè, Kpalimé"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={gpsCoordinates.lat}
                    onChange={(e) => setGpsCoordinates({ ...gpsCoordinates, lat: e.target.value })}
                    placeholder="Ex: 6.123456"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={gpsCoordinates.lng}
                    onChange={(e) => setGpsCoordinates({ ...gpsCoordinates, lng: e.target.value })}
                    placeholder="Ex: 1.123456"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Objectifs et équipements */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Objectifs et équipements
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objectifs de production</label>
                <textarea
                  value={productionGoal}
                  onChange={(e) => setProductionGoal(e.target.value)}
                  placeholder="Décrivez vos objectifs de production..."
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Équipements</label>
                <textarea
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="Listez vos équipements agricoles..."
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Station météorologique</label>
                <input
                  type="text"
                  value={weatherStation}
                  onChange={(e) => setWeatherStation(e.target.value)}
                  placeholder="Ex: Station météo locale, capteurs..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Display Mode */
        <div className="space-y-6">
          {farm ? (
            <>
              {/* Header with actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{farm.farm_name}</h2>
                  <p className="text-slate-600">Gérez votre ferme</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
              </div>

              {/* Carte de la ferme */}
              {(farm.gps_lat && farm.gps_lng) && (
                <FarmMap
                  latitude={farm.gps_lat}
                  longitude={farm.gps_lng}
                  farmName={farm.farm_name}
                  farmSize={farm.farm_size}
                  mainCrops={farm.main_crops}
                />
              )}

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations générales */}
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                  <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Home className="w-4 h-4" />
                    Informations générales
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Nom de la ferme:</span>
                      <span className="text-sm font-medium text-slate-900">{farm.farm_name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Surface:</span>
                      <span className="text-sm font-medium text-slate-900">
                        {farm.farm_size ? `${farm.farm_size} ha` : 'Non spécifiée'}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm text-slate-600">Cultures principales:</span>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {farm.main_crops || 'Non spécifiées'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                  <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4" />
                    Localisation
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Région:</span>
                      <span className="text-sm font-medium text-slate-900">{farm.region || 'Non spécifiée'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Département:</span>
                      <span className="text-sm font-medium text-slate-900">{farm.department || 'Non spécifié'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Commune:</span>
                      <span className="text-sm font-medium text-slate-900">{farm.commune || 'Non spécifiée'}</span>
                    </div>

                    {(farm.gps_lat && farm.gps_lng) && (
                      <div className="text-xs text-slate-500">
                        GPS: {farm.gps_lat.toFixed(6)}, {farm.gps_lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Objectifs et équipements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Objectifs */}
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                  <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4" />
                    Objectifs de production
                  </h3>

                  <p className="text-sm text-slate-700">
                    {farm.production_goal || 'Aucun objectif spécifié'}
                  </p>
                </div>

                {/* Équipements */}
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                  <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Wrench className="w-4 h-4" />
                    Équipements
                  </h3>

                  <p className="text-sm text-slate-700">
                    {farm.equipment || 'Aucun équipement spécifié'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {farm.notes && (
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                  <h3 className="text-md font-semibold text-slate-800 mb-4">Notes additionnelles</h3>
                  <p className="text-sm text-slate-700">{farm.notes}</p>
                </div>
              )}
            </>
          ) : (
            /* No farm yet */
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
              <Home className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune ferme enregistrée</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Enregistrez votre ferme pour suivre vos activités, gérer vos équipements et optimiser votre production.
              </p>
              <button
                onClick={() => setEditing(true)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Enregistrer ma ferme
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
