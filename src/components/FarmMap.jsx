import { useState, useEffect } from 'react'
import { MapPin, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react'

// Composant de carte OpenStreetMap simple sans dépendances externes
export function FarmMap({ latitude, longitude, farmName, farmSize, mainCrops }) {
  const [zoom, setZoom] = useState(15)
  const [mapCenter, setMapCenter] = useState({ lat: latitude || 6.123456, lng: longitude || 1.123454 })
  const [showLayers, setShowLayers] = useState(false)
  const [mapType, setMapType] = useState('standard')

  // Calculer les limites approximatives de la parcelle
  const calculateBounds = () => {
    if (!latitude || !longitude) return null
    
    // Estimation de la taille de la parcelle basée sur la surface (en hectares)
    const sizeInMeters = farmSize ? Math.sqrt(farmSize * 10000) : 100 // 1 hectare = 10000m²
    
    // Conversion approximative en degrés (1° ≈ 111km)
    const sizeInDegrees = sizeInMeters / 111000
    
    return {
      north: latitude + sizeInDegrees / 2,
      south: latitude - sizeInDegrees / 2,
      east: longitude + sizeInDegrees / 2,
      west: longitude - sizeInDegrees / 2
    }
  }

  const bounds = calculateBounds()

  // URL OpenStreetMap
  const getMapUrl = () => {
    const baseUrl = 'https://tile.openstreetmap.org'
    const tileUrl = mapType === 'satellite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}'
      : `${baseUrl}/{z}/{x}/{y}.png`
    
    return tileUrl
  }

  const getAttribution = () => {
    return mapType === 'satellite' 
      ? 'Tiles &copy; Esri'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 18))
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 1))
  const centerMap = () => {
    setMapCenter({ lat: latitude || 6.123456, lng: longitude || 1.123454 })
    setZoom(15)
  }

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard')
  }

  if (!latitude || !longitude) {
    return (
      <div className="bg-slate-100 rounded-xl p-8 text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Coordonnées GPS non définies</h3>
        <p className="text-slate-600">
          Veuillez configurer les coordonnées GPS de votre ferme dans la section "Ma Ferme".
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{farmName || 'Ma Ferme'}</h3>
            <p className="text-sm text-slate-600">
              📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
              {farmSize && ` • ${farmSize} ha`}
            </p>
            {mainCrops && (
              <p className="text-xs text-emerald-600">🌾 {mainCrops}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLayers(!showLayers)}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300"
              title="Options de carte"
            >
              <Layers className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={centerMap}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300"
              title="Centrer la carte"
            >
              <Maximize2 className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Panneau de contrôle */}
      {showLayers && (
        <div className="absolute top-20 right-4 z-10 bg-white rounded-lg shadow-lg border border-slate-200 p-3 m-4">
          <h4 className="font-medium text-slate-900 mb-2">Options de carte</h4>
          <button
            onClick={toggleMapType}
            className="w-full px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 mb-2"
          >
            {mapType === 'standard' ? '🛰️ Vue Satellite' : '🗺️ Vue Standard'}
          </button>
          <div className="text-xs text-slate-500 space-y-1">
            <p>Zoom: {zoom}</p>
            <p>Centre: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</p>
          </div>
        </div>
      )}

      {/* Carte */}
      <div className="relative h-96 bg-slate-100">
        {/* Icônes de contrôle de zoom */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-100 border border-slate-300"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-100 border border-slate-300"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Carte OpenStreetMap intégrée */}
        <div className="w-full h-full relative">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bounds?.west || longitude - 0.01},${bounds?.south || latitude - 0.01},${bounds?.east || longitude + 0.01},${bounds?.north || latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
            style={{ border: 0 }}
            allowFullScreen
            title="Carte de la ferme"
          />
          
          {/* Marqueur personnalisé */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 opacity-30 rounded-full animate-ping" />
              <div className="relative bg-emerald-600 text-white p-2 rounded-full shadow-lg">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Limites de la parcelle (si taille définie) */}
          {bounds && farmSize && (
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none border-2 border-emerald-500 bg-emerald-100 bg-opacity-20"
              style={{
                width: `${Math.min(200, farmSize * 50)}px`,
                height: `${Math.min(200, farmSize * 50)}px`,
                borderRadius: '8px'
              }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {farmSize} ha
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-900 mb-1">📍 Localisation</h4>
            <p className="text-slate-600">
              Lat: {latitude.toFixed(6)}<br />
              Lng: {longitude.toFixed(6)}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-1">📏 Surface</h4>
            <p className="text-slate-600">
              {farmSize ? `${farmSize} hectares` : 'Non spécifiée'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-1">🌾 Cultures</h4>
            <p className="text-slate-600">
              {mainCrops || 'Non spécifiées'}
            </p>
          </div>
        </div>
        
        {bounds && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📊 Limites approximatives</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              <div>Nord: {bounds.north.toFixed(6)}</div>
              <div>Sud: {bounds.south.toFixed(6)}</div>
              <div>Est: {bounds.east.toFixed(6)}</div>
              <div>Ouest: {bounds.west.toFixed(6)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
