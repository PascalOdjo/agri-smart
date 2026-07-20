import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSupabaseConfigStatus } from '../utils/appConfig.js'
import {
  Leaf,
  Camera,
  ShoppingBag,
  BookOpen,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

export function Home() {
  const { user } = useAuth()
  const { hash } = useLocation()
  const supabaseStatus = getSupabaseConfigStatus()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])

  return (
    <article className="landing">
      {/* Hero */}
      <section className="hero relative overflow-hidden">
        <div className="hero-bg" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/95 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Pour les agriculteurs du Togo
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Votre récolte mérite le meilleur
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Diagnostic des maladies par photo, prix du marché en temps réel et formations pratiques.
            Simple, rapide, sur votre téléphone.
          </p>
          {!supabaseStatus.configured && (
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/95 backdrop-blur-sm">
              {supabaseStatus.message}
            </div>
          )}
          {user && user?.role !== 'client' ? (
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/diagnostic"
                className="landing-cta-primary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
              >
                <Camera className="w-5 h-5" />
                Démarrer un diagnostic
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg border-2 border-white/30 text-white backdrop-blur-sm hover:bg-white/10 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                Mon tableau de bord
              </Link>
            </div>
          ) : user?.role === 'client' ? (
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/market"
                className="landing-cta-primary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Parcourir le marché
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg border-2 border-white/30 text-white backdrop-blur-sm hover:bg-white/10 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                Mon tableau de bord
              </Link>
            </div>
          ) : (
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="landing-cta-primary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
              >
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="landing-cta-secondary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
              >
                J'ai déjà un compte
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Bénéfices */}
      <section id="avantages" className="py-16 sm:py-24 bg-white scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
            Pourquoi AgriSmart ?
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-emerald-950 text-center max-w-2xl mx-auto">
            Tout ce dont vous avez besoin, en un seul endroit
          </h2>
          <div className="mt-14 grid sm:grid-cols-2 gap-8">
            <div className="benefit-card p-8 rounded-3xl border border-emerald-100 bg-emerald-50/50 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-emerald-950">
                Diagnostic intelligent
              </h3>
              <p className="mt-3 text-emerald-800/90 leading-relaxed">
                Prenez une photo de votre plante malade. En quelques secondes, obtenez le nom de la
                maladie, le niveau de gravité et des solutions pratiques, avec des alternatives
                écologiques.
              </p>
              {!user && (
                <Link
                  to="/signup"
                  className="mt-5 inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  Essayer gratuitement <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="benefit-card p-8 rounded-3xl border border-amber-100 bg-amber-50/50 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-emerald-950">
                Prix du marché par région
              </h3>
              <p className="mt-3 text-emerald-800/90 leading-relaxed">
                Consultez les prix moyens des produits agricoles (maïs, tomate, igname…) par région
                au Togo. Mise à jour régulière pour vendre au bon moment.
              </p>
              <Link
                to="/market"
                className="mt-5 inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-800"
              >
                Voir les prix <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="benefit-card p-8 rounded-3xl border border-sky-100 bg-sky-50/50 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 sm:col-span-2">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-emerald-950">
                Formations et bonnes pratiques
              </h3>
              <p className="mt-3 text-emerald-800/90 leading-relaxed max-w-2xl">
                Vidéos courtes et fiches conseils pour améliorer vos rendements : préparation du sol,
                irrigation, lutte biologique contre les ravageurs, rotation des cultures.
              </p>
              <Link
                to="/formations"
                className="mt-5 inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700"
              >
                Accéder aux formations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="py-16 sm:py-24 bg-gradient-to-b from-emerald-50 to-white scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center">
            Simple et rapide
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-emerald-950 text-center">
            Comment ça marche ?
          </h2>
          <div className="mt-14 grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="mt-5 text-lg font-bold text-emerald-950">Créez votre compte</h3>
              <p className="mt-2 text-emerald-800/90 text-sm">
                Inscription gratuite en une minute avec votre email.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="mt-5 text-lg font-bold text-emerald-950">Prenez une photo</h3>
              <p className="mt-2 text-emerald-800/90 text-sm">
                Photographiez la plante ou la feuille malade avec votre téléphone.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="mt-5 text-lg font-bold text-emerald-950">Recevez les conseils</h3>
              <p className="mt-2 text-emerald-800/90 text-sm">
                Maladie, gravité, solution et alternative écologique immédiatement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Points forts */}
      <section id="atouts" className="py-16 sm:py-24 bg-white scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <Smartphone className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="mt-4 font-bold text-emerald-950">Mobile first</p>
              <p className="mt-1 text-sm text-emerald-800/80">
                Conçu pour être utilisé sur téléphone, même avec peu de données.
              </p>
            </div>
            <div>
              <Shield className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="mt-4 font-bold text-emerald-950">Conseils fiables</p>
              <p className="mt-1 text-sm text-emerald-800/80">
                Diagnostic assisté par IA et alternatives écologiques recommandées.
              </p>
            </div>
            <div>
              <Users className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="mt-4 font-bold text-emerald-950">Pour tous</p>
              <p className="mt-1 text-sm text-emerald-800/80">
                Interface simple, boutons larges, utilisable par tous les agriculteurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="rejoindre" className="py-16 sm:py-24 cta-final scroll-mt-16">
        <div className="hero-bg cta-final-bg" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Prêt à protéger vos cultures ?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Rejoignez les agriculteurs qui utilisent AgriSmart pour de meilleures récoltes.
          </p>
          {!user && (
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="landing-cta-primary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
              >
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="landing-cta-secondary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
              >
                Se connecter
              </Link>
            </div>
          )}
          {user && user?.role !== 'client' && (
            <Link
              to="/diagnostic"
              className="mt-10 landing-cta-primary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
            >
              <Camera className="w-5 h-5" />
              Nouveau diagnostic
            </Link>
          )}
          {user && user?.role === 'client' && (
            <Link
              to="/market"
              className="mt-10 landing-cta-primary inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-3 rounded-2xl font-semibold text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Parcourir le marché
            </Link>
          )}
        </div>
      </section>
    </article>
  )
}
