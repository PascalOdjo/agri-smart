import { useState, useEffect } from 'react'
import { Calendar, Plus, CheckCircle, Clock, Droplets, Sprout, Scissors, Package, AlertCircle, Filter, Search } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { supabase } from '../lib/supabase.js'

export function ProductionTracking() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('calendar')
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [journalEntries, setJournalEntries] = useState([])
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'intervention',
    title: '',
    description: '',
    crop_type: 'maize'
  })

  // Calendrier cultural pour Maïs et Manioc au Togo
  const cropCalendar = {
    maize: {
      name: 'Maïs',
      icon: Sprout,
      color: 'yellow',
      phases: [
        { month: 3, name: 'Préparation du sol', icon: Package, description: 'Défrichage, labour, amendement' },
        { month: 4, name: 'Semis', icon: Sprout, description: 'Semis direct en lignes espacées de 75cm' },
        { month: 5, name: 'Premier sarclage', icon: Scissors, description: 'Désherbage mécanique ou manuel' },
        { month: 6, name: 'Première fertilisation', icon: Droplets, description: 'Engrais NPK 15-15-15: 200kg/ha' },
        { month: 7, name: 'Deuxième sarclage', icon: Scissors, description: 'Contrôle des mauvaises herbes' },
        { month: 8, name: 'Deuxième fertilisation', icon: Droplets, description: 'Engrais urée: 50kg/ha' },
        { month: 9, name: 'Récolte', icon: Package, description: 'Récolte des épis mûrs' },
        { month: 10, name: 'Post-récolte', icon: CheckCircle, description: 'Séchage, stockage, commercialisation' }
      ]
    },
    cassava: {
      name: 'Manioc',
      icon: Sprout,
      color: 'green',
      phases: [
        { month: 4, name: 'Préparation du sol', icon: Package, description: 'Défrichage, labour sur buttes' },
        { month: 5, name: 'Plantation', icon: Sprout, description: 'Plantation des boutures sur buttes' },
        { month: 6, name: 'Premier sarclage', icon: Scissors, description: 'Désherbage et buttage' },
        { month: 7, name: 'Deuxième sarclage', icon: Scissors, description: 'Entretien des buttes' },
        { month: 8, name: 'Fertilisation', icon: Droplets, description: 'Fumier bien décomposé: 20t/ha' },
        { month: 9, name: 'Troisième sarclage', icon: Scissors, description: 'Nettoyage avant récolte' },
        { month: 12, name: 'Récolte (6-8 mois)', icon: Package, description: 'Arrachage des racines' },
        { month: 1, name: 'Transformation', icon: CheckCircle, description: 'Séchage, transformation en gari, attiéké' }
      ]
    }
  }

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

  useEffect(() => {
    if (user) {
      loadJournalEntries()
    }
  }, [user])

  const loadJournalEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('production_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setJournalEntries(data || [])
    } catch (error) {
      console.error('Erreur chargement journal:', error)
    }
  }

  const saveJournalEntry = async () => {
    try {
      const { error } = await supabase
        .from('production_journal')
        .insert({
          user_id: user.id,
          ...newEntry,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        type: 'intervention',
        title: '',
        description: '',
        crop_type: 'maize'
      })
      setShowAddEntry(false)
      loadJournalEntries()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  const getMonthPhases = () => {
    if (selectedCrop === 'all') {
      const allPhases = []
      Object.values(cropCalendar).forEach(crop => {
        crop.phases.forEach(phase => {
          if (phase.month === selectedMonth) {
            allPhases.push({ ...phase, cropName: crop.name, cropColor: crop.color })
          }
        })
      })
      return allPhases
    }
    
    const crop = cropCalendar[selectedCrop]
    return crop ? crop.phases.filter(phase => phase.month === selectedMonth) : []
  }

  const getEntryIcon = (type) => {
    switch (type) {
      case 'intervention': return Droplets
      case 'observation': return AlertCircle
      case 'harvest': return Package
      default: return CheckCircle
    }
  }

  const getEntryColor = (type) => {
    switch (type) {
      case 'intervention': return 'blue'
      case 'observation': return 'yellow'
      case 'harvest': return 'green'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">Suivi Dynamique de Production</h1>
        <p className="text-emerald-700 max-w-3xl mx-auto text-lg">
          Planifiez vos activités culturales et suivez vos interventions en temps réel.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'calendar'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Calendrier Cultural</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'journal'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            <span>Journal de Bord</span>
          </div>
        </button>
      </div>

      {/* Calendrier Cultural */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Culture</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Toutes les cultures</option>
                  <option value="maize">Maïs</option>
                  <option value="cassava">Manioc</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mois</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vue Calendrier */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(cropCalendar).map(([cropKey, crop]) => {
              if (selectedCrop !== 'all' && selectedCrop !== cropKey) return null
              
              const Icon = crop.icon
              return (
                <div key={cropKey} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`bg-${crop.color}-100 p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 text-${crop.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{crop.name}</h3>
                      <p className="text-slate-600">Cycle annuel</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {crop.phases.map((phase, index) => {
                      const PhaseIcon = phase.icon
                      const isCurrentMonth = phase.month === selectedMonth
                      
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border transition-all ${
                            isCurrentMonth
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              isCurrentMonth ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}>
                              <PhaseIcon className={`w-4 h-4 ${
                                isCurrentMonth ? 'text-emerald-600' : 'text-slate-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900">{phase.name}</h4>
                                {isCurrentMonth && (
                                  <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                                    Ce mois
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{phase.description}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {months[phase.month]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Journal de Bord */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          {/* Ajouter une entrée */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Nouvelle entrée</h3>
              <button
                onClick={() => setShowAddEntry(!showAddEntry)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            {showAddEntry && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                    <select
                      value={newEntry.type}
                      onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="intervention">Intervention</option>
                      <option value="observation">Observation</option>
                      <option value="harvest">Récolte</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Culture concernée</label>
                  <select
                    value={newEntry.crop_type}
                    onChange={(e) => setNewEntry({ ...newEntry, crop_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="maize">Maïs</option>
                    <option value="cassava">Manioc</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Titre</label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Ex: Traitement fongique appliqué"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Décrivez l'intervention réalisée, les produits utilisés, les quantités, etc."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={saveJournalEntry}
                    disabled={!newEntry.title || !newEntry.description}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setShowAddEntry(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Liste des entrées */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Historique des interventions</h3>
            
            {journalEntries.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p>Aucune entrée dans le journal pour le moment.</p>
                <p className="text-sm">Commencez par ajouter votre première intervention.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry, index) => {
                  const EntryIcon = getEntryIcon(entry.type)
                  const entryColor = getEntryColor(entry.type)
                  
                  return (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-start gap-3">
                        <div className={`bg-${entryColor}-100 p-2 rounded-lg`}>
                          <EntryIcon className={`w-4 h-4 text-${entryColor}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{entry.title}</h4>
                            <span className={`bg-${entryColor}-100 text-${entryColor}-800 text-xs px-2 py-1 rounded-full`}>
                              {entry.type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{entry.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>📅 {new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                            <span>🌾 {entry.crop_type === 'maize' ? 'Maïs' : entry.crop_type === 'cassava' ? 'Manioc' : 'Autre'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
