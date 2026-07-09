import { useState } from 'react'
import { Droplets, Sprout, TestTube, MapPin, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

// Mocked analysis logic (Could be replaced by true API/Supabase calls later)
const analyzeSoilType = (type, ph, moisture) => {
  // Simple heuristic data based on user input for demonstration
  let suitableCrops = []
  let recommendations = []
  
  if (type === 'argileux') {
    suitableCrops = ['Riz', 'Haricot', 'Tomate (avec bon drainage)', 'Chou']
    recommendations = [
      'Ajouter de la matière organique (compost) pour améliorer le drainage.',
      'Éviter le travail du sol quand il est trop humide pour ne pas le compacter.',
    ]
  } else if (type === 'sableux') {
    suitableCrops = ['Arachide', 'Ananas', 'Manioc', 'Pastèque']
    recommendations = [
      'Faire des arrosages fréquents mais en petite quantité.',
      'Apporter du fumier pour améliorer la rétention d\'eau.',
    ]
  } else if (type === 'limoneux') {
    suitableCrops = ['Maïs', 'Ignames', 'Légumes verts', 'Tomates']
    recommendations = [
      'Sol très fertile, pratiquer la rotation des cultures.',
      'Pailler la surface pour éviter la formation de croûte battante avec la pluie.',
    ]
  } else {
    // mixte / autre
    suitableCrops = ['Maïs', 'Sorgho', 'Haricot', 'Oignon']
    recommendations = [
      'Faire une analyse de sol complète en laboratoire si possible.',
      'Maintenir une bonne couverture végétale.',
    ]
  }

  // Adjust for pH
  if (ph < 5.5) {
    recommendations.push("Votre sol est très acide. Envisagez un apport d'amendement calcique (chaux agricole) pour relever le pH.")
    // Filter crops that don't tolerate high acidity
    suitableCrops = suitableCrops.filter(c => c !== 'Maïs' && c !== 'Chou')
    suitableCrops.push('Ananas (tolère bien l\'acidité)')
  } else if (ph > 7.5) {
    recommendations.push("Votre sol est alcalin. Privilégiez l'apport de fumier organique ou de soufre pour l'adoucir.")
  } else if (ph >= 5.5 && ph <= 7.5) {
    recommendations.push("Le pH de votre sol est optimal (neutre/légèrement acide) pour la majorité des cultures togolaises.")
  }

  // Adjust for moisture
  if (moisture === 'sec') {
    recommendations.push("Le terrain a tendance à être sec. Privilégiez des cultures résistantes à la sécheresse (Manioc, Sorgho) ou installez un système d'irrigation goutte-à-goutte.")
    suitableCrops.push('Sorgho')
  } else if (moisture === 'inonde') {
    recommendations.push("Risque d'inondation. Créez des buttes surélevées ou des billons pour protéger les racines de la pourriture.")
    suitableCrops = suitableCrops.filter(c => c !== 'Tomate (avec bon drainage)' && c !== 'Oignon')
    suitableCrops.push('Riz de bas-fond')
  }

  // Deduplicate array
  suitableCrops = [...new Set(suitableCrops)]

  return { crops: suitableCrops, rules: recommendations }
}

export function SoilAnalysis() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    region: 'Maritime',
    soilType: 'sableux',
    ph: 6.5,
    moisture: 'moyen' // sec, moyen, inonde
  })

  const handleAnalyze = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API Call / AI Processing delay
    setTimeout(() => {
      const analysisResult = analyzeSoilType(formData.soilType, formData.ph, formData.moisture)
      setResult(analysisResult)
      setLoading(false)
      setStep(3)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-emerald-600" /> 
          Analyse de Sol & Cultures Adaptées
        </h1>
        <p className="text-slate-500 mt-1">
          Renseignez les caractéristiques de votre parcelle pour découvrir les semences les plus adaptées et obtenir des recommandations ciblées.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="flex bg-slate-50 border-b border-slate-100 px-4 sm:px-8">
          <div className={`flex items-center gap-2 py-4 ${step >= 1 ? 'text-emerald-700 font-medium border-b-2 border-emerald-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-emerald-100 text-emerald-700">1</span>
            Caractéristiques
          </div>
          <div className="flex-1 max-w-[40px] flex items-center justify-center text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className={`flex items-center gap-2 py-4 ${step >= 2 ? 'text-emerald-700 font-medium border-b-2 border-emerald-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>2</span>
            Analyse IA
          </div>
          <div className="flex-1 max-w-[40px] flex items-center justify-center text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className={`flex items-center gap-2 py-4 ${step >= 3 ? 'text-emerald-700 font-medium border-b-2 border-emerald-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>3</span>
            Résultats
          </div>
        </div>

        {/* Form Content */}
        {step === 1 && (
          <form onSubmit={handleAnalyze} className="p-4 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Region */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Région
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                >
                  <option value="Maritime">Région Maritime</option>
                  <option value="Plateaux">Région des Plateaux</option>
                  <option value="Centrale">Région Centrale</option>
                  <option value="Kara">Région de la Kara</option>
                  <option value="Savanes">Région des Savanes</option>
                </select>
              </div>

              {/* Soil Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-500" /> Type de sol dominant
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  value={formData.soilType}
                  onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                >
                  <option value="sableux">Sol Sableux (Léger, sec vite)</option>
                  <option value="argileux">Sol Argileux (Lourd, retient l'eau)</option>
                  <option value="limoneux">Sol Limoneux (Riche, poudreux)</option>
                  <option value="mixte">Sol Mixte / Franc</option>
                </select>
              </div>

              {/* Moisture */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Comportement en saison des pluies</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  value={formData.moisture}
                  onChange={(e) => setFormData({...formData, moisture: e.target.value})}
                >
                  <option value="sec">Drainage très rapide (Souvent sec)</option>
                  <option value="moyen">Bon drainage (Humidité moyenne)</option>
                  <option value="inonde">Mauvais drainage (Reste inondé)</option>
                </select>
              </div>

              {/* pH Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-2"><TestTube className="w-4 h-4 text-purple-500" /> Niveau de pH estimé</span>
                  <span className="text-emerald-600 font-bold">{formData.ph}</span>
                </label>
                <input 
                  type="range" 
                  min="4" 
                  max="9" 
                  step="0.5"
                  value={formData.ph}
                  onChange={(e) => setFormData({...formData, ph: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-400 px-1">
                  <span>Acide (4)</span>
                  <span>Neutre (7)</span>
                  <span>Alcalin (9)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                Passer à l'analyse <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Processing Step */}
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center relative">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin absolute" />
              <Sprout className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Croisement des données en cours...</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                L'IA analyse les propriétés du sol, le pH et l'humidité pour trouver les cultures parfaites pour vous.
              </p>
            </div>
          </div>
        )}

        {/* Results Step */}
        {!loading && step === 3 && result && (
          <div className="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl p-6 mb-8 text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Analyse terminée !</h2>
              <p className="text-emerald-700/80">Basé sur un sol {formData.soilType} avec un pH de {formData.ph}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Recommended Crops */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Sprout className="w-5 h-5 text-emerald-600" /> Cultures à haut potentiel
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.crops.map((crop, i) => (
                    <div key={i} className="bg-white border border-slate-200 px-4 py-3 rounded-xl font-medium text-slate-800 shadow-sm flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
                       {crop}
                    </div>
                  ))}
                  {result.crops.length === 0 && (
                    <p className="text-slate-500 italic">Aucune culture parfaitement idéale trouvée pour ces données exactes, essayez les recommandations ci-contre.</p>
                  )}
                </div>
              </div>

              {/* Right: Recommendations */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <TestTube className="w-5 h-5 text-purple-600" /> Conseils de préparation
                </h3>
                <ul className="space-y-4">
                  {result.rules.map((rule, i) => (
                    <li key={i} className="bg-white border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-sm text-slate-700 text-sm leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
              <Link to="/formations" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-2">
                 Voir les formations liées <ArrowRight className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => setStep(1)}
                className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
              >
                Nouvelle analyse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
