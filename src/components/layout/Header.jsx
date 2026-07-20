import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { signOut } from '../../services/auth.js'

const SECTION_LINKS = [
  { to: '/#avantages', label: 'Avantages' },
  { to: '/#comment', label: 'Comment' },
  { to: '/#atouts', label: 'Atouts' },
  { to: '/#rejoindre', label: 'Rejoindre' },
]

export function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <header className="header-hero sticky top-0 z-10 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold shrink-0">
          <Leaf className="w-7 h-7" />
          <span className="hidden sm:inline">AgriSmart Togo</span>
        </Link>
        {isHome && (
          <nav className="hidden md:flex items-center gap-1 flex-wrap justify-center" aria-label="Sections de la page">
            {SECTION_LINKS.map(({ to, label }) => (
              <a
                key={to}
                href={to}
                className="px-3 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white text-sm font-medium transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
        <nav className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 hover:bg-emerald-600 flex items-center gap-2 text-sm font-medium"
                aria-label="Tableau de bord"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Tableau de bord</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-emerald-600 flex items-center gap-1"
                aria-label="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-medium flex items-center"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
