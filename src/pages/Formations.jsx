import { useEffect, useState } from 'react'
import { BookOpen, Clock3, ExternalLink, Play, Search, Video, X } from 'lucide-react'
import { get } from '../lib/api.js'

const fallbackThumbnail = 'https://images.unsplash.com/photo-1523742815375-2b36e4f5c4f6?w=900&q=80'

function getVideoEmbedUrl(url) {
  if (!url) return ''

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}`
    }
    if (parsedUrl.hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }
  } catch {
    return ''
  }

  return ''
}

function VideoViewer({ formation, onClose }) {
  const videoUrl = formation.videoUrl || formation.url
  const embedUrl = getVideoEmbedUrl(videoUrl)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 pr-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Formation vidéo</p>
            <h2 className="truncate text-lg font-bold text-slate-900">{formation.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer la vidéo" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {embedUrl ? (
          <div className="aspect-video bg-slate-950">
            <iframe className="h-full w-full" src={embedUrl} title={formation.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          </div>
        ) : videoUrl ? (
          <video className="aspect-video w-full bg-slate-950" src={videoUrl} controls autoPlay />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-slate-100 p-6 text-center text-slate-500">La vidéo de cette formation sera bientôt disponible.</div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm text-slate-600">{formation.description || 'Une démonstration pratique pour améliorer vos cultures.'}</p>
          {videoUrl && !embedUrl && <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900">Ouvrir la vidéo <ExternalLink className="h-4 w-4" /></a>}
        </div>
      </div>
    </div>
  )
}

export function Formations() {
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Toutes')
  const [selectedFormation, setSelectedFormation] = useState(null)

  useEffect(() => {
    get('/formations')
      .then((res) => setFormations(res?.formations || []))
      .catch((e) => setError(e.message || 'Erreur chargement formations'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-12 text-emerald-800">Chargement des formations...</div>
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>

  const categories = ['Toutes', ...new Set(formations.map((formation) => formation.category).filter(Boolean))]
  const visibleFormations = formations.filter((formation) => {
    const searchableText = `${formation.title} ${formation.description || ''} ${formation.category || ''}`.toLowerCase()
    return searchableText.includes(search.toLowerCase()) && (activeCategory === 'Toutes' || formation.category === activeCategory)
  })

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-2xl bg-emerald-900 px-6 py-7 text-white shadow-sm sm:px-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-emerald-200"><BookOpen className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wider">Espace apprentissage</span></div>
          <h1 className="text-2xl font-bold sm:text-3xl">Des gestes simples pour de meilleures récoltes</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100">Regardez des démonstrations courtes et appliquez les bonnes pratiques directement dans votre exploitation.</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Toutes les vidéos</h2>
          <label className="relative block w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Rechercher une formation</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une vidéo" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        </div>
        {categories.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === category ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700'}`}>{category}</button>)}</div>}
      </section>

      {visibleFormations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Video className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 font-semibold text-slate-800">{formations.length === 0 ? 'Les premières vidéos arrivent bientôt' : 'Aucune vidéo trouvée'}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{formations.length === 0 ? 'Les formations vidéo seront publiées ici dès leur ajout par votre équipe.' : 'Essayez une autre recherche ou sélectionnez une autre catégorie.'}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleFormations.map((formation) => <article key={formation.id || formation.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <button type="button" onClick={() => setSelectedFormation(formation)} className="group relative block aspect-video w-full overflow-hidden bg-emerald-900 text-left"><img src={formation.thumbnail || fallbackThumbnail} alt="" className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-65" /><span className="absolute inset-0 flex items-center justify-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-lg transition group-hover:scale-110"><Play className="ml-0.5 h-5 w-5 fill-current" /></span></span>{formation.duration && <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/75 px-2 py-1 text-xs font-medium text-white">{formation.duration}</span>}</button>
            <div className="space-y-3 p-4"><div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-emerald-700"><span>{formation.category || 'Conseils agricoles'}</span>{formation.type === 'video' && <Video className="h-4 w-4" />}</div><h3 className="line-clamp-2 font-bold text-slate-900">{formation.title}</h3>{formation.description && <p className="line-clamp-2 text-sm leading-5 text-slate-500">{formation.description}</p>}<div className="flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{formation.duration || 'Vidéo pratique'}</div></div>
          </article>)}
        </div>
      )}

      {selectedFormation && <VideoViewer formation={selectedFormation} onClose={() => setSelectedFormation(null)} />}
    </div>
  )
}
