import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer-site bg-emerald-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-inherit hover:opacity-90">
            <Leaf className="w-6 h-6" />
            <span>AgriSmart Togo</span>
          </Link>
          <nav className="flex flex-wrap gap-6" aria-label="Liens du pied de page">
            <Link to="/#avantages" className="footer-link">
              Avantages
            </Link>
            <Link to="/#comment" className="footer-link">
              Comment ça marche
            </Link>
            <Link to="/market" className="footer-link">
              Marché
            </Link>
            <Link to="/formations" className="footer-link">
              Formations
            </Link>
          </nav>
        </div>
        <p className="footer-copy mt-6 text-sm text-center">
          &copy; {currentYear} AgriSmart Togo. Diagnostic, prix du marché et formations pour les agriculteurs.
        </p>
      </div>
    </footer>
  )
}
