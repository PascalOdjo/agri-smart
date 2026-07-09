import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, FileText, ArrowRight, Info, Sparkles } from 'lucide-react'

export function DiagnosticMain() {
  const [selectedOption, setSelectedOption] = useState(null)

  const options = [
    {
      id: 'photo',
      title: 'Diagnostic par Photo',
      description: 'Prenez une photo de la plante malade et notre IA analysera l\'image pour identifier précisément la maladie.',
      icon: Camera,
      color: 'emerald',
      features: [
        'Analyse visuelle précise',
        'Identification instantanée',
        'Reconnaissance des symptômes visibles',
        'Idéal pour maladies avec signes caractéristiques'
      ],
      link: '/diagnostic/photo',
      buttonText: 'Prendre une photo'
    },
    {
      id: 'texte',
      title: 'Diagnostic par Description',
      description: 'Décrivez les symptômes que vous observez et notre IA vous proposera un diagnostic basé sur votre description.',
      icon: FileText,
      color: 'blue',
      features: [
        'Pas besoin de photo',
        'Description détaillée des symptômes',
        'Fonctionne avec connexion basique',
        'Parfait pour symptômes complexes'
      ],
      link: '/diagnostic/text',
      buttonText: 'Décrire les symptômes'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-emerald-900">Diagnostic IA des Cultures</h1>
        </div>
        <p className="text-emerald-700 max-w-3xl mx-auto text-lg">
          Choisissez votre méthode de diagnostic préférée. Notre intelligence artificielle spécialisée dans l'agriculture togolaise vous aidera à identifier et traiter les maladies de vos cultures.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-900 mb-2">Comment choisir ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-700">
              <div>
                <strong>📸 Par Photo :</strong> Idéal quand vous voyez clairement les symptômes (taches, déformations, couleurs).
              </div>
              <div>
                <strong>📝 Par Texte :</strong> Parfait pour décrire des symptômes complexes, l'évolution dans le temps, ou si vous n'avez pas de photo.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = selectedOption === option.id

          return (
            <div
              key={option.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer hover:shadow-xl ${isSelected
                ? `border-${option.color}-500 ring-4 ring-${option.color}-100`
                : 'border-slate-200 hover:border-slate-300'
                }`}
              onClick={() => setSelectedOption(option.id)}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`bg-${option.color}-100 p-3 rounded-xl`}>
                    <Icon className={`w-8 h-8 text-${option.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{option.title}</h3>
                    <p className="text-slate-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <h4 className="font-semibold text-slate-900 mb-3">Avantages</h4>
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className={`w-2 h-2 bg-${option.color}-500 rounded-full flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <Link
                  to={option.link}
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${isSelected
                    ? `bg-${option.color}-600 text-white hover:bg-${option.color}-700`
                    : `bg-${option.color}-50 text-${option.color}-700 hover:bg-${option.color}-100`
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{option.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className={`bg-${option.color}-500 text-white px-3 py-1 rounded-full text-xs font-medium`}>
                    Sélectionné
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-slate-500 bg-white rounded-xl p-6 border border-slate-200">
        <div className="mb-3">
          <strong>🤖 Notre IA spécialisée</strong>
        </div>
        <p className="mb-2">
          Entraînée sur les maladies courantes au Togo et en Afrique de l'Ouest : manioc, maïs, igname, etc.
        </p>
        <p>
          Fournit des solutions adaptées : traitements chimiques disponibles localement + alternatives écologiques (neem, purin d'ortie, etc.).
        </p>
      </div>
    </div>
  )
}
