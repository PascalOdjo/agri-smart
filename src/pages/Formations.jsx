import { useEffect, useState } from 'react'
import { BookOpen, Video, FileText, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

export function Formations() {
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('formations')
      .select('*')
      .order('order_index')
      .then(({ data, error: e }) => {
        if (e) setError(e.message)
        else setFormations(data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-emerald-800">Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-red-600 bg-red-50 p-4 rounded-xl">
        {error}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
        <BookOpen className="w-6 h-6" /> Formations
      </h1>
      <p className="text-emerald-800 text-sm">
        Vidéos courtes et fiches conseils pour de bonnes pratiques agricoles.
      </p>

      {formations.length === 0 ? (
        <p className="text-emerald-700 bg-emerald-50 p-4 rounded-xl">
          Aucune formation pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {formations.map((f) => (
            <li
              key={f.id}
              className="bg-white rounded-2xl border border-emerald-100 p-4 hover:border-emerald-200"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  {f.type === 'video' ? (
                    <Video className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <FileText className="w-5 h-5 text-emerald-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-emerald-900">{f.title}</h2>
                  {f.description && (
                    <p className="text-sm text-emerald-700 mt-1">{f.description}</p>
                  )}
                  {f.url && (
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-emerald-600 font-medium text-sm hover:underline"
                    >
                      Voir <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
