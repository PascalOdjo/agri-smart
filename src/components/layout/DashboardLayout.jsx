import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Camera,
  ShoppingBag,
  BookOpen,
  Home,
  Sprout,
  Cloud,
  Calendar,
  Droplets,
  Package,
  Settings,
  Leaf,
  X,
  Shield,
  Search,
  Bell,
  Menu,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useUserProfile } from '../../hooks/useUserProfile.js'
import { signOut } from '../../services/auth.js'

export function DashboardLayout() {
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const location = useLocation()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      // Forcer la redirection vers la page de connexion
      window.location.href = '/login'
    } catch (err) {
      console.error(err)
    }
  }

  // Utiliser les données du profil synchronisé pour le rôle
  const userRole = profile?.role || user?.role || 'farmer'

  const allNavLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['farmer', 'client'] },
    { to: '/farm', label: 'Ma Ferme', icon: Home, roles: ['farmer'] },
    { to: '/crops', label: 'Mes Cultures', icon: Sprout, roles: ['farmer'] },
    { to: '/weather-station', label: 'Station Météo', icon: Cloud, roles: ['farmer'] },
    { to: '/resources', label: 'Gestion Ressources', icon: Settings, roles: ['farmer'] },
    { to: '/diagnostic', label: 'Diagnostic IA', icon: Camera, roles: ['farmer'] },
    { to: '/production-tracking', label: 'Suivi Production', icon: Calendar, roles: ['farmer'] },
    { to: '/soil-analysis', label: 'Analyse de sol', icon: Droplets, roles: ['farmer'] },
    { to: '/market', label: 'Marché agricole', icon: ShoppingBag, roles: ['farmer', 'client'] },
    { to: '/orders', label: 'Mes Commandes', icon: Package, roles: ['client'] },
    { to: '/order-management', label: 'Gestion Commandes', icon: Package, roles: ['farmer'] },
    { to: '/admin-price-management', label: 'Gestion des Prix', icon: Settings, roles: ['admin'] },
    { to: '/super-admin', label: 'Panneau Admin', icon: Shield, roles: ['admin'] },
    { to: '/formations', label: 'Formations', icon: BookOpen, roles: ['farmer'] },
  ]

  const navLinks = allNavLinks.filter(link => link.roles.includes(userRole))

  return (
    <div className="flex bg-slate-50 h-screen overflow-hidden text-slate-800 font-Outfit">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <span>AgriSmart</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-4 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>
          <nav className="space-y-1 px-3">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {profile?.full_name || user?.fullName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <p className="text-xs text-emerald-600 font-medium capitalize mt-0.5">
                {userRole === 'admin' ? 'Admin' : userRole === 'farmer' ? 'Agriculteur' : 'Client'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5 mr-3 opacity-70 cursor-pointer" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {/* Header */}
        <header className="flex-none z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 lg:hidden text-slate-500 hover:text-emerald-600 transition-colors bg-white shadow-sm border border-slate-200 p-2 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center relative text-slate-400 focus-within:text-emerald-600 transition-colors">
              <Search className="w-4 h-4 absolute left-3.5" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-slate-100/70 text-sm rounded-xl border border-transparent focus:border-emerald-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none w-64 md:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>

        {/* Dashboard Footer */}
        <footer className="flex-none py-4 bg-white border-t border-slate-200 text-center text-sm text-slate-500 z-10">
          &copy; {new Date().getFullYear()} AgriSmart Togo. Tous droits réservés.
        </footer>
      </main>
    </div>
  )
}
