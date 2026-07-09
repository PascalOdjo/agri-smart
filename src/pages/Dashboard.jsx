import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Camera, 
  Package, 
  FileText, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  ChevronRight,
  Plus,
  Sprout,
  Leaf,
  ShoppingBag,
  Truck,
  Star,
  Clock,
  MapPin,
  Store,
  Users
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { getDiagnosticsByUser } from '../services/diagnostics.js'
import { supabase } from '../lib/supabase.js'
import { WeatherWidget } from '../components/WeatherWidget.jsx'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [diagnostics, setDiagnostics] = useState([])
  const [crops, setCrops] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Déterminer le rôle de l'utilisateur
  const userRole = user?.user_metadata?.role || 'farmer' // 'farmer' ou 'client'
  const isClient = userRole === 'client'

  useEffect(() => {
    if (!user) return

    if (isClient) {
      // Charger les données du client
      Promise.all([
        supabase.from('orders').select('*').eq('client_id', user.id).order('created_at', { ascending: false }),
      ])
        .then(([ordersRes]) => {
          setOrders(ordersRes.data || [])
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      // Charger les données de l'agriculteur
      Promise.all([
        getDiagnosticsByUser(user.id),
        supabase.from('crops').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
        .then(([diagRes, cropsRes]) => {
          setDiagnostics(diagRes || [])
          setCrops(cropsRes.data || [])
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user, isClient])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-emerald-800 font-medium animate-pulse">Chargement de votre espace...</p>
      </div>
    )
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'élevée':
        return 'bg-red-50 text-red-700 border-red-100'
      case 'medium':
      case 'moyenne':
        return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'low':
      case 'faible':
        return 'bg-green-50 text-green-700 border-green-100'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100'
    }
  }

  const getSeverityLabel = (severity) => {
    if (!severity) return 'Inconnu'
    const lower = severity.toLowerCase()
    if (lower === 'high') return 'Élevée'
    if (lower === 'medium') return 'Moyenne'
    if (lower === 'low') return 'Faible'
    return severity
  }

  // Calculate some stats
  const totalDiags = diagnostics.length
  const issuesFound = diagnostics.filter(d => d.disease_name && d.disease_name.toLowerCase() !== 'healthy').length
  const totalCrops = crops.length

  // Stats pour le client
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'delivered').length

  // Afficher le dashboard client si c'est un client
  if (isClient) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600">
              Bonjour, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Client'} ! 🛒
            </h1>
            <p className="text-slate-500 mt-1">Bienvenue sur votre espace client.</p>
          </div>
          <Link
            to="/market"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium hover:from-blue-700 hover:to-indigo-600 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all focus:ring-2 focus:ring-blue-500"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Parcourir le marché</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center gap-4 text-blue-600 mb-4">
              <div className="p-3 bg-blue-100/50 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-700">Commandes Totales</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{totalOrders}</span>
              <span className="text-sm font-medium text-blue-600 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> total</span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center gap-4 text-amber-600 mb-4">
              <div className="p-3 bg-amber-100/50 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-700">En Attente</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{pendingOrders}</span>
              <span className="text-sm font-medium text-slate-400">commandes</span>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center gap-4 text-green-600 mb-4">
              <div className="p-3 bg-green-100/50 rounded-xl">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-700">Livré</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{completedOrders}</span>
              <span className="text-sm font-medium text-slate-400">commandes</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column (Orders List) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" /> 
                Commandes Récentes
              </h2>
              <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-800 font-medium mb-2">Aucune commande trouvée</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                    Vous n'avez pas encore passé de commande. Découvrez nos produits sur le marché.
                  </p>
                  <Link to="/market" className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> Parcourir le marché
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {orders.slice(0, 5).map((order) => (
                    <li key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <Link
                        to={`/orders/${order.id}`}
                        className="flex items-center p-4 sm:p-5 gap-4 sm:gap-6"
                      >
                        <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-800 truncate">
                              Commande #{order.id?.slice(0, 8) || 'Nouvelle commande'}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                              order.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                              order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                              'bg-slate-50 text-slate-700'
                            }`}>
                              {order.status === 'delivered' ? 'Livré' :
                               order.status === 'pending' ? 'En attente' :
                               order.status === 'processing' ? 'En cours' : order.status}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-slate-500 gap-3">
                            <span>{new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {order.total_amount && (
                              <span className="font-medium text-slate-700">
                                {order.total_amount.toFixed(2)} €
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="shrink-0 text-slate-400">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column (Quick Actions & Info) */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" /> 
                  Actions Rapides
                </h2>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                <Link to="/market" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Marché</p>
                    <p className="text-sm text-slate-500">Découvrir les produits</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link to="/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Mes Commandes</p>
                    <p className="text-sm text-slate-500">Suivre mes achats</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Profil</p>
                    <p className="text-sm text-slate-500">Gérer mes informations</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-2xl p-6 shadow-md text-white overflow-hidden relative group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3 relative z-10">
                <Star className="w-5 h-5 opacity-90" /> 
                Produits Recommandés
              </h2>
              <p className="text-blue-100/90 text-sm leading-relaxed mb-5 relative z-10">
                Découvrez nos produits sélectionnés spécialement pour vous selon vos préférences et achats précédents.
              </p>
              <Link
                to="/market?featured=true"
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-800 rounded-xl font-medium hover:bg-blue-50 transition-colors shadow-sm relative z-10"
              >
                Voir les recommandations
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-600">
            Bonjour, {user?.email?.split('@')[0] || 'Agriculteur'} ! 🌾
          </h1>
          <p className="text-slate-500 mt-1">Voici un aperçu de vos activités récentes.</p>
        </div>
        <Link
          to="/diagnostic"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium hover:from-emerald-700 hover:to-teal-600 shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all focus:ring-2 focus:ring-emerald-500"
        >
          <Camera className="w-5 h-5" />
          <span>Scanner une plante</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 text-emerald-600 mb-4">
            <div className="p-3 bg-emerald-100/50 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700">Total Diagnostics</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalDiags}</span>
            <span className="text-sm font-medium text-emerald-600 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> stable</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 text-amber-600 mb-4">
            <div className="p-3 bg-amber-100/50 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700">Problèmes Détectés</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{issuesFound}</span>
            <span className="text-sm font-medium text-slate-400">sur {totalDiags} scans</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 text-blue-600 mb-4">
            <div className="p-3 bg-blue-100/50 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-700">Cultures Suivies</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalCrops}</span>
            <span className="text-sm font-medium text-slate-400">parcelles</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column (Diagnostics List) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" /> 
              Diagnostics Récents
            </h2>
            <Link to="/diagnostic" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            {diagnostics.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-slate-800 font-medium mb-2">Aucun diagnostic trouvé</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  Vous n'avez pas encore analysé de plantes. Scannez une feuille malade pour recevoir des recommandations instantanées.
                </p>
                <Link to="/diagnostic" className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" /> Démarrer un diagnostic
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {diagnostics.slice(0, 5).map((d) => (
                  <li key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <Link
                      to={`/diagnostic/${d.id}`}
                      className="flex items-center p-4 sm:p-5 gap-4 sm:gap-6"
                    >
                      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        {d.image_url ? (
                          <img
                            src={d.image_url}
                            alt="Plante analysée"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Leaf className="w-6 h-6 opacity-30" />
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800 truncate">
                            {d.disease_name || 'Analyse en cours...'}
                          </p>
                          {d.disease_name?.toLowerCase() === 'healthy' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                              Sain
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-slate-500 gap-3">
                          <span>{new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {d.severity && d.disease_name?.toLowerCase() !== 'healthy' && (
                            <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${getSeverityColor(d.severity)}`}>
                              Gravité: {getSeverityLabel(d.severity)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="shrink-0 text-slate-400">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column (Crops & Quick Actions) */}
        <div className="space-y-6">
          {/* Météo Locale */}
          <WeatherWidget />

          {/* Cultures */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" /> 
                Mes Cultures
              </h2>
            </div>
            
            {crops.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center">
                <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">Vous n'avez enregistré aucune culture pour le moment.</p>
                <button className="text-emerald-600 font-medium text-sm hover:text-emerald-700 w-full py-2 border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-colors">
                  + Ajouter une culture
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <ul className="flex flex-wrap gap-2">
                  {crops.map((c) => (
                    <li
                      key={c.id}
                      className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {c.name}
                    </li>
                  ))}
                  <li className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-sm border hover:border-emerald-200 cursor-pointer transition-colors border-dashed border-emerald-300">
                    + Ajouter
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Recommandations */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-6 shadow-md text-white overflow-hidden relative group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3 relative z-10">
              <FileText className="w-5 h-5 opacity-90" /> 
              Formations & Conseils
            </h2>
            <p className="text-emerald-100/90 text-sm leading-relaxed mb-5 relative z-10">
              Améliorez vos rendements grâce à nos guides sur les alternatives écologiques et les bonnes pratiques agricoles.
            </p>
            <Link
              to="/formations"
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-800 rounded-xl font-medium hover:bg-emerald-50 transition-colors shadow-sm relative z-10"
            >
              Découvrir les formations
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
