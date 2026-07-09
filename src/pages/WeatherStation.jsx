import { useState } from 'react'
import { Cloud, Droplets, Thermometer, Wind, Sun, AlertTriangle, AlertCircle, Info, BarChart3, Calendar, TrendingUp, Umbrella, Eye, MapPin } from 'lucide-react'

export function WeatherStation() {
  const [weatherMenu, setWeatherMenu] = useState('current')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
            <Cloud className="w-8 h-8 text-emerald-600" />
            Station Météo
          </h1>
          <p className="text-slate-600 mt-1">Surveillez les conditions météorologiques pour optimiser vos activités agricoles</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4" />
          <span>Région: Maritime</span>
        </div>
      </div>

      {/* Menu Météo */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setWeatherMenu('current')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${weatherMenu === 'current'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Thermometer className="w-4 h-4 inline mr-2" />
            Actuel
          </button>
          <button
            onClick={() => setWeatherMenu('forecast')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${weatherMenu === 'forecast'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Prévisions
          </button>
          <button
            onClick={() => setWeatherMenu('alerts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${weatherMenu === 'alerts'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Alertes
          </button>
          <button
            onClick={() => setWeatherMenu('trends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${weatherMenu === 'trends'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Tendances
          </button>
          <button
            onClick={() => setWeatherMenu('analysis')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${weatherMenu === 'analysis'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Analyse
          </button>
        </div>

        {/* Contenu du menu */}
        {weatherMenu === 'current' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
                <Thermometer className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-800">28°C</div>
                <div className="text-sm text-orange-600 mt-1">Température</div>
                <div className="text-xs text-orange-500 mt-2">Ressenti: 30°C</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-800">75%</div>
                <div className="text-sm text-blue-600 mt-1">Humidité</div>
                <div className="text-xs text-blue-500 mt-2">Point de rosée: 23°C</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                <Wind className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-800">12</div>
                <div className="text-sm text-green-600 mt-1">Vent (km/h)</div>
                <div className="text-xs text-green-500 mt-2">Direction: NE</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center">
                <Sun className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-yellow-800">6</div>
                <div className="text-sm text-yellow-600 mt-1">Indice UV</div>
                <div className="text-xs text-yellow-500 mt-2">Élevé</div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Pression atmosphérique</h4>
                <div className="text-2xl font-bold text-slate-900">1013 hPa</div>
                <div className="text-sm text-slate-600">Stable</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Visibilité</h4>
                <div className="text-2xl font-bold text-slate-900">10 km</div>
                <div className="text-sm text-slate-600">Bonne</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Nuages</h4>
                <div className="text-2xl font-bold text-slate-900">40%</div>
                <div className="text-sm text-slate-600">Partiellement nuageux</div>
              </div>
            </div>
          </div>
        )}

        {weatherMenu === 'forecast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                <div className="font-semibold text-blue-800 mb-2">Aujourd'hui</div>
                <Cloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-blue-700 mb-1">Nuageux</div>
                <div className="text-lg font-bold text-blue-800">24°C / 31°C</div>
                <div className="text-xs text-blue-600">20% de pluie</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <div className="font-semibold text-slate-800 mb-2">Demain</div>
                <Cloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-sm text-slate-700 mb-1">Nuageux</div>
                <div className="text-lg font-bold text-slate-800">22°C / 30°C</div>
                <div className="text-xs text-slate-600">40% de pluie</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                <div className="font-semibold text-blue-800 mb-2">Après-demain</div>
                <Umbrella className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-blue-700 mb-1">Pluvieux</div>
                <div className="text-lg font-bold text-blue-800">20°C / 25°C</div>
                <div className="text-xs text-blue-600">80% de pluie</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
                <div className="font-semibold text-yellow-800 mb-2">Dans 3 jours</div>
                <Sun className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-sm text-yellow-700 mb-1">Ensoleillé</div>
                <div className="text-lg font-bold text-yellow-800">24°C / 32°C</div>
                <div className="text-xs text-yellow-600">10% de pluie</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <div className="font-semibold text-slate-800 mb-2">Dans 4 jours</div>
                <Cloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-sm text-slate-700 mb-1">Variable</div>
                <div className="text-lg font-bold text-slate-800">23°C / 29°C</div>
                <div className="text-xs text-slate-600">30% de pluie</div>
              </div>
            </div>

            {/* Prévisions détaillées */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="font-semibold text-slate-800 mb-4">Prévisions agricoles - 7 jours</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">🌱 Périodes optimales</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Semis: Jours 1-2 (température idéale)</li>
                    <li>• Irrigation: Jour 3 (après pluie)</li>
                    <li>• Traitement: Jours 4-5 (temps sec)</li>
                    <li>• Récolte: Jour 7 (conditions stables)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">⚠️ Risques météo</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Jour 3: Fortes pluies (80%)</li>
                    <li>• Jour 5: Vent modéré (25 km/h)</li>
                    <li>• Jour 6: Humidité élevée (&gt;80%)</li>
                    <li>• Semaine: Température stable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {weatherMenu === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 text-lg mb-2">Alerte Critique - Pluies diluviennes</h4>
                <p className="text-red-700 mb-3">Risque de fortes pluies demain - Reportez tout traitement phytosanitaire</p>
                <div className="bg-red-100 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-red-800">Intensité:</span>
                      <span className="text-red-700 ml-2">15-25 mm/h</span>
                    </div>
                    <div>
                      <span className="font-medium text-red-800">Durée:</span>
                      <span className="text-red-700 ml-2">4-6 heures</span>
                    </div>
                    <div>
                      <span className="font-medium text-red-800">Vent:</span>
                      <span className="text-red-700 ml-2">25-35 km/h</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-red-600">
                  <strong>Recommandations:</strong> Protéger les cultures sensibles, vérifier le drainage, reporter les traitements
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-800 text-lg mb-2">Attention - Canicule</h4>
                <p className="text-orange-700 mb-3">Température élevée prévue - Assurez l'irrigation des cultures sensibles</p>
                <div className="bg-orange-100 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-orange-800">Température max:</span>
                      <span className="text-orange-700 ml-2">35°C</span>
                    </div>
                    <div>
                      <span className="font-medium text-orange-800">Moment:</span>
                      <span className="text-orange-700 ml-2">14h-17h</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-orange-600">
                  <strong>Recommandations:</strong> Irrigation tôt le matin, ombrage si possible, surveillance du stress hydrique
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
              <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 text-lg mb-2">Information - Humidité élevée</h4>
                <p className="text-blue-700 mb-3">Conditions favorables aux maladies fongiques - Surveillez vos cultures</p>
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium text-blue-800">Taux d'humidité:</span>
                    <span className="text-blue-700 ml-2">85% ce matin</span>
                  </div>
                </div>
                <div className="mt-3 text-sm text-blue-600">
                  <strong>Recommandations:</strong> Inspection régulière, aération si possible, traitement préventif si nécessaire
                </div>
              </div>
            </div>
          </div>
        )}

        {weatherMenu === 'trends' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="font-semibold text-slate-800 mb-4 text-lg">Tendances météorologiques - 30 jours</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Température</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">+2.5°C</div>
                  <div className="text-xs text-slate-500">vs moyenne mensuelle</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Précipitations</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">+15mm</div>
                  <div className="text-xs text-slate-500">vs moyenne mensuelle</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Humidité</span>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">+8%</div>
                  <div className="text-xs text-slate-500">vs moyenne mensuelle</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Jours ensoleillés</span>
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">+3</div>
                  <div className="text-xs text-slate-500">vs moyenne mensuelle</div>
                </div>
              </div>
            </div>

            {/* Graphique des tendances */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-4">Évolution des paramètres</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Température moyenne</span>
                    <span className="text-slate-800 font-medium">26°C → 28.5°C</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Précipitations totales</span>
                    <span className="text-slate-800 font-medium">120mm → 135mm</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Humidité relative</span>
                    <span className="text-slate-800 font-medium">70% → 78%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {weatherMenu === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-4 text-lg">Analyse agricole - Impact sur vos cultures</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    Conditions optimales pour:
                  </h5>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="font-medium text-green-800">🌾 Riz</div>
                      <div className="text-sm text-slate-600">Irrigation: Demain matin | Récolte: Dans 10 jours</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="font-medium text-green-800">🌽 Maïs</div>
                      <div className="text-sm text-slate-600">Semis: Jour 4-5 | Traitement: Jour 7</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="font-medium text-green-800">🍅 Tomates</div>
                      <div className="text-sm text-slate-600">Plantation: Jour 3 | Taille: Jour 8</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Risques identifiés:
                  </h5>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="font-medium text-orange-800">🍄 Maladies fongiques</div>
                      <div className="text-sm text-slate-600">Risque: Élevé | Surveillance: Quotidienne</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="font-medium text-orange-800">💧 Stress hydrique</div>
                      <div className="text-sm text-slate-600">Risque: Modéré | Action: Irrigation renforcée</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="font-medium text-orange-800">🌪️ Érosion</div>
                      <div className="text-sm text-slate-600">Risque: Faible | Prévention: Couverture végétale</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations personnalisées */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="font-semibold text-slate-800 mb-4">📋 Plan d'action recommandé - 7 jours</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <div>
                    <div className="font-medium text-slate-800">Aujourd'hui</div>
                    <div className="text-sm text-slate-600">Inspection des cultures, préparation des outils pour demain</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <div>
                    <div className="font-medium text-slate-800">Demain</div>
                    <div className="text-sm text-slate-600">Irrigation matinale, report des traitements phytosanitaires</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <div>
                    <div className="font-medium text-slate-800">Après-demain</div>
                    <div className="text-sm text-slate-600">Surveillance post-pluie, drainage si nécessaire</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                  <div>
                    <div className="font-medium text-slate-800">Jours 4-7</div>
                    <div className="text-sm text-slate-600">Reprise des traitements, fertilisation, surveillance continue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
