import { useState } from 'react'
import { Package, Droplets, Calendar, TrendingUp, BarChart3, Settings, Database, Beaker } from 'lucide-react'
import { IrrigationTracker } from '../components/IrrigationTracker.jsx'
import { ProductManagement } from '../components/ProductManagement.jsx'
import { InterventionPlanning } from '../components/InterventionPlanning.jsx'
import { TreatmentTracking } from '../components/TreatmentTracking.jsx'

export function Resources() {
  const [activeTab, setActiveTab] = useState('irrigation')

  const tabs = [
    {
      id: 'irrigation',
      name: 'Irrigation',
      icon: Droplets,
      component: IrrigationTracker,
      description: 'Suivi de la consommation d\'eau'
    },
    {
      id: 'products',
      name: 'Produits',
      icon: Package,
      component: ProductManagement,
      description: 'Gestion des engrais et produits phytosanitaires'
    },
    {
      id: 'planning',
      name: 'Planning',
      icon: Calendar,
      component: InterventionPlanning,
      description: 'Planification des interventions culturales'
    },
    {
      id: 'tracking',
      name: 'Traçabilité',
      icon: Beaker,
      component: TreatmentTracking,
      description: 'Suivi des traitements appliqués'
    }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
          <Settings className="w-8 h-8 text-emerald-600" />
          Gestion des Ressources
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Optimisez l'utilisation de vos ressources : eau, engrais, produits phytosanitaires et planifiez vos interventions culturales
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center gap-2 ${activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md transform scale-105'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Description de l'onglet actif */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            {(() => {
              const Icon = tabs.find(tab => tab.id === activeTab)?.icon
              return Icon ? <Icon className="w-6 h-6 text-emerald-600" /> : null
            })()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className="text-sm text-slate-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Eau économisée</p>
              <p className="text-2xl font-bold text-blue-600">-15%</p>
              <p className="text-xs text-green-600">vs mois dernier</p>
            </div>
            <Droplets className="w-8 h-8 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Produits en stock</p>
              <p className="text-2xl font-bold text-emerald-600">24</p>
              <p className="text-xs text-orange-600">3 stock faible</p>
            </div>
            <Package className="w-8 h-8 text-emerald-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Interventions ce mois</p>
              <p className="text-2xl font-bold text-orange-600">18</p>
              <p className="text-xs text-slate-600">12 terminées</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Efficacité moyenne</p>
              <p className="text-2xl font-bold text-purple-600">4.2/5</p>
              <p className="text-xs text-green-600">+0.3 vs moyenne</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab('irrigation')}
            className="p-6 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <Droplets className="w-6 h-6 text-blue-600 mb-3" />
            <h4 className="font-medium text-slate-800 mb-2">Enregistrer une irrigation</h4>
            <p className="text-sm text-slate-600">Ajoutez rapidement un nouvel enregistrement d'irrigation</p>
          </button>

          <button
            onClick={() => setActiveTab('planning')}
            className="p-6 border border-slate-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-left"
          >
            <Calendar className="w-6 h-6 text-orange-600 mb-3" />
            <h4 className="font-medium text-slate-800 mb-2">Planifier une intervention</h4>
            <p className="text-sm text-slate-600">Créez une nouvelle intervention culturale</p>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className="p-6 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
          >
            <Beaker className="w-6 h-6 text-purple-600 mb-3" />
            <h4 className="font-medium text-slate-800 mb-2">Traiter un produit</h4>
            <p className="text-sm text-slate-600">Enregistrez l'application d'un traitement</p>
          </button>
        </div>
      </div>

      {/* Tips et recommandations */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Recommandations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Optimisation irrigation
            </h4>
            <p className="text-sm text-slate-600">
              Basé sur vos données, nous recommandons d'irriguer tôt le matin pour réduire l'évaporation de 15-20%.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Gestion des stocks
            </h4>
            <p className="text-sm text-slate-600">
              3 produits ont un stock faible. Pensez à réapprovisionner avant la saison de traitements.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Planning optimal
            </h4>
            <p className="text-sm text-slate-600">
              Les conditions météo des 3 prochains jours sont idéales pour les traitements phytosanitaires.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Efficacité traitements
            </h4>
            <p className="text-sm text-slate-600">
              Vos traitements foliaires sont 20% plus efficaces appliqués entre 6h-9h.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
