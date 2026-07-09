import { useState, useEffect } from 'react'
import { Cloud, Droplets, Wind, Sun, CloudRain, CloudLightning, Loader2, MapPin } from 'lucide-react'

// Map WMO Weather codes to UI text and icons
function getWeatherInfo(code) {
  if (code === 0) return { label: 'Ciel dégagé', icon: Sun, color: 'text-amber-500' }
  if (code === 1 || code === 2 || code === 3) return { label: 'Partiellement nuageux', icon: Cloud, color: 'text-slate-400' }
  if (code === 45 || code === 48) return { label: 'Brouillard', icon: Cloud, color: 'text-slate-300' }
  if (code >= 51 && code <= 67) return { label: 'Pluie légère', icon: CloudRain, color: 'text-blue-400' }
  if (code >= 71 && code <= 77) return { label: 'Neige', icon: Cloud, color: 'text-slate-200' } // Unlikely in Togo but mapped
  if (code >= 80 && code <= 82) return { label: 'Averses', icon: CloudRain, color: 'text-blue-500' }
  if (code >= 95 && code <= 99) return { label: 'Orage', icon: CloudLightning, color: 'text-amber-600' }
  return { label: 'Inconnu', icon: Cloud, color: 'text-slate-400' }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locationName, setLocationName] = useState('Lomé (Togo)')

  useEffect(() => {
    // Default coords for Lomé, Togo
    let lat = 6.1375
    let lon = 1.2125

    const fetchWeather = async (latitude, longitude) => {
      try {
        setLoading(true)
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=GMT`
        )
        if (!res.ok) throw new Error('Erreur réseau')
        const data = await res.json()
        setWeather(data.current)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Impossible de charger la météo')
      } finally {
        setLoading(false)
      }
    }

    // Unobtrusive geolocation fallback to default if denied
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationName('Votre position')
          fetchWeather(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          // Fallback to Lomé
          fetchWeather(lat, lon)
        },
        { timeout: 5000 }
      )
    } else {
      fetchWeather(lat, lon)
    }
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-center min-h-[160px]">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[160px] flex items-center justify-center text-slate-500 text-sm">
        <MapPin className="w-4 h-4 mr-2" /> Météo indisponible
      </div>
    )
  }

  const { label, icon: WeatherIcon, color } = getWeatherInfo(weather.weather_code)

  return (
    <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-6 shadow-sm border border-sky-100 relative overflow-hidden group">
       <div className="absolute -right-8 -top-8 w-32 h-32 bg-sky-100 rounded-full blur-2xl group-hover:bg-sky-200 transition-colors opacity-50"></div>
       
       <div className="flex items-center justify-between mb-4 relative z-10">
         <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
           Météo locale
         </h2>
         <span className="text-xs font-medium text-sky-600 bg-sky-100 px-2.5 py-1 rounded-full flex items-center gap-1">
           <MapPin className="w-3 h-3" /> {locationName}
         </span>
       </div>

       <div className="flex items-center gap-6 relative z-10">
         <div className="flex-shrink-0">
           <WeatherIcon className={`w-14 h-14 ${color} drop-shadow-sm`} />
         </div>
         
         <div className="flex-1">
           <div className="flex items-baseline gap-2">
             <span className="text-4xl font-bold text-slate-900 leading-none">
               {Math.round(weather.temperature_2m)}°
             </span>
             <span className="text-slate-500 font-medium">{label}</span>
           </div>
           
           <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
             <div className="flex items-center gap-1.5" title="Humidité">
               <Droplets className="w-4 h-4 text-sky-500" />
               <span className="font-medium">{weather.relative_humidity_2m}%</span>
             </div>
             <div className="flex items-center gap-1.5" title="Vent">
               <Wind className="w-4 h-4 text-slate-400" />
               <span className="font-medium">{weather.wind_speed_10m} km/h</span>
             </div>
           </div>
         </div>
       </div>
    </div>
  )
}
