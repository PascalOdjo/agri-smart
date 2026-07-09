const apiKey = import.meta.env.VITE_OPENAI_API_KEY

export async function getDiagnosis(imageUrl) {
  if (!apiKey) return getDiagnosisMock()
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [{
        role: 'system',
        content: `Tu es un expert agricole spécialisé dans les maladies des cultures au Togo et en Afrique de l'Ouest. 
        Analyse les images de plantes et fournis un diagnostic précis avec des solutions pratiques adaptées au contexte local.
        Sois spécifique sur les symptômes observés et donne des traitements accessibles aux petits agriculteurs.
        
        Réponds UNIQUEMENT en JSON avec ce format exact:
        {
          "disease_name": "nom précis de la maladie",
          "symptoms": "symptômes observés sur la plante",
          "cause": "cause probable (fongique, bactérienne, virale, carence, etc)",
          "severity": "faible|moderee|elevee",
          "treatment": "traitement chimique avec produits et dosages spécifiques",
          "eco_treatment": "traitement biologique/ecologique avec recettes locales",
          "prevention": "mesures préventives pour éviter la récidive",
          "cultural_practices": "pratiques culturales recommandées"
        }`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyse cette plante agricole et donne un diagnostic complet. Identifie la maladie, les symptômes visibles, la cause, et propose des solutions de traitement adaptées aux conditions locales au Togo. Inclut des traitements chimiques et écologiques accessibles.'
          },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }]
    })
  })
  if (!res.ok) throw new Error('API error')
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  const m = text.match(/\{[\s\S]*\}/)
  const p = JSON.parse(m ? m[0] : '{}')
  return {
    disease_name: p.disease_name || 'Maladie non identifiée',
    symptoms: p.symptoms || 'Symptômes non spécifiés',
    cause: p.cause || 'Cause inconnue',
    severity: p.severity || 'moderee',
    treatment: p.treatment || 'Consulter un agent agricole pour diagnostic approfondi.',
    eco_treatment: p.eco_treatment || 'Appliquer des traitements biologiques locaux.',
    prevention: p.prevention || 'Maintenir de bonnes pratiques culturales.',
    cultural_practices: p.cultural_practices || 'Surveiller régulièrement les cultures.'
  }
}

export async function getTextDiagnosis(description) {
  if (!apiKey) return getTextDiagnosisMock(description)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1500,
        messages: [{
          role: 'system',
          content: `Tu es un expert agricole spécialisé dans les maladies des cultures au Togo et en Afrique de l'Ouest. 
          Analyse les descriptions de symptômes et fournis un diagnostic précis avec des solutions pratiques adaptées au contexte local.
          Sois spécifique sur les symptômes décrits et donne des traitements accessibles aux petits agriculteurs.
          
          Réponds UNIQUEMENT en JSON avec ce format exact:
          {
            "disease_name": "nom précis de la maladie",
            "symptoms": "symptômes correspondants à la description",
            "cause": "cause probable (fongique, bactérienne, virale, carence, etc)",
            "severity": "faible|moderee|elevee",
            "treatment": "traitement chimique avec produits et dosages spécifiques",
            "eco_treatment": "traitement biologique/ecologique avec recettes locales",
            "prevention": "mesures préventives pour éviter la récidive",
            "cultural_practices": "pratiques culturales recommandées"
          }`
        },
        {
          role: 'user',
          content: `Analyse cette description de symptômes de culture et donne un diagnostic complet. Description: "${description}". Identifie la maladie probable, les symptômes correspondants, la cause, et propose des solutions de traitement adaptées aux conditions locales au Togo. Inclut des traitements chimiques et écologiques accessibles.`
        }]
      })
    })

    if (!res.ok) {
      console.warn('API OpenAI non disponible, utilisation du mode démo')
      return getTextDiagnosisMock(description)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const m = text.match(/\{[\s\S]*\}/)
    const p = JSON.parse(m ? m[0] : '{}')

    return {
      disease_name: p.disease_name || 'Maladie non identifiée',
      symptoms: p.symptoms || 'Symptômes non spécifiés',
      cause: p.cause || 'Cause inconnue',
      severity: p.severity || 'moderee',
      treatment: p.treatment || 'Consulter un agent agricole pour diagnostic approfondi.',
      eco_treatment: p.eco_treatment || 'Appliquer des traitements biologiques locaux.',
      prevention: p.prevention || 'Maintenir de bonnes pratiques culturales.',
      cultural_practices: p.cultural_practices || 'Surveiller régulièrement les cultures.'
    }

  } catch (error) {
    console.warn('Erreur API OpenAI, utilisation du mode démo:', error.message)
    return getTextDiagnosisMock(description)
  }
}

function getTextDiagnosisMock(description) {
  // Analyser la description pour choisir le diagnostic approprié
  const desc = description.toLowerCase()

  if (desc.includes('manioc') || desc.includes('cassava')) {
    if (desc.includes('tache') || desc.includes('jaune') || desc.includes('brun')) {
      return Promise.resolve({
        disease_name: 'Mildiou du manioc',
        symptoms: 'Taches jaunâtres sur les feuilles, puis brunissement et séchage progressif du feuillage. Les tiges peuvent présenter des lésions allongées.',
        cause: 'Fongique - Phytophthora spp.',
        severity: 'moderee',
        treatment: 'Appliquer du Mancozèbe 2g/L ou du Chlorothalonil 1.5g/L toutes les 2 semaines. Pulvériser au début des symptômes.',
        eco_treatment: 'Décoction de feuilles de neem (500g de feuilles pour 5L d\'eau, bouillir 15min, filtrer et pulvériser). Ou purin d\'ortie (1kg d\'ortie pour 10L d\'eau, macérer 48h).',
        prevention: 'Éviter l\'excès d\'humidité, espacer les plants, utiliser des variétés résistantes, détruire les plants malades.',
        cultural_practices: 'Rotation des cultures avec des céréales, drainage adéquat du sol, fertilisation équilibrée.'
      })
    } else if (desc.includes('mosaïque') || desc.includes('déform')) {
      return Promise.resolve({
        disease_name: 'Mosaïque africaine du manioc',
        symptoms: 'Taches claires et vertes en mosaïque sur les feuilles, déformation des feuilles, réduction du rendement.',
        cause: 'Virale - Transmise par les mouches blanches',
        severity: 'elevee',
        treatment: 'Aucun traitement curatif efficace. Arracher et brûler les plants malades pour éviter la propagation.',
        eco_treatment: 'Application d\'extraits de piment fort pour repousser les mouches blanches. Utiliser de l\'huile de neem comme répulsif.',
        prevention: 'Utiliser des variétés résistantes (TMS 30572, TMS 4(2)1425), contrôler les mouches blances, espacer les plants.',
        cultural_practices: 'Isoler les nouvelles plantations, éliminer les plants volontaires, rotation avec des cultures non-hôtes.'
      })
    }
  }

  if (desc.includes('maïs') || desc.includes('maize') || desc.includes('corn')) {
    if (desc.includes('tache') || desc.includes('brun') || desc.includes('ellipse')) {
      return Promise.resolve({
        disease_name: 'Anthracnose du maïs',
        symptoms: 'Lésions elliptiques sur les feuilles avec centre clair et bordures brunes. Les grains peuvent présenter des taches noires.',
        cause: 'Fongique - Colletotrichum graminicola',
        severity: 'elevee',
        treatment: 'Pulvériser du Benomyl 1g/L ou du Carbendazim 0.5g/L dès l\'apparition des premiers symptômes. Renouveler après 10 jours.',
        eco_treatment: 'Extraits de ail (200g d\'ail broyé pour 1L d\'eau, laisser reposer 24h) ou solution de cuivre (Bordeaux dilué à 1/20).',
        prevention: 'Utiliser des semences certifiées, éviter la monoculture, pratiquer la rotation avec des légumineuses.',
        cultural_practices: 'Espacement adéquat des plants (75cm x 50cm), élimination des résidus de culture, fertilisation azotée modérée.'
      })
    } else if (desc.includes('jaune') || desc.includes('pâle') || desc.includes('croissance')) {
      return Promise.resolve({
        disease_name: 'Carence en azote du maïs',
        symptoms: 'Feuilles inférieures jaunâtres, croissance ralentie, tiges fines. Les feuilles plus anciennes sont les plus affectées.',
        cause: 'Nutritionnelle - Déficit en azote',
        severity: 'faible',
        treatment: 'Appliquer 50kg/ha d\'urée ou 100kg/ha de sulfate d\'ammonium. Fractionner l\'apport en 2-3 fois pendant la croissance.',
        eco_treatment: 'Incorporer du compost mûr (20-30 tonnes/ha) ou du fumier bien décomposé. Planter des légumineuses comme engrais vert.',
        prevention: 'Analyser le sol avant plantation, maintenir un bon taux de matière organique, pratiquer la rotation des cultures.',
        cultural_practices: 'Culture de couverture pendant l\'intersaison, utilisation de variétés efficaces dans l\'absorption de l\'azote.'
      })
    }
  }

  // Diagnostic par défaut
  return Promise.resolve({
    disease_name: 'Symptôme général de stress végétatif',
    symptoms: 'Symptômes variés pouvant indiquer plusieurs problèmes : carences nutritives, stress hydrique ou maladies.',
    cause: 'Multiple - Nécessite observation complémentaire',
    severity: 'moderee',
    treatment: 'Appliquer un engrais équilibré NPK 15-15-15 à 200kg/ha. Assurer un arrosage régulier si période sèche.',
    eco_treatment: 'Appliquer du compost bien mûr (20 tonnes/ha) et du purin d\'ortie (1L/10L d\'eau) en pulvérisation foliaire.',
    prevention: 'Analyser le sol, maintenir l\'humidité du sol avec paillage, observer régulièrement les cultures.',
    cultural_practices: 'Rotation des cultures, association culturale (maïs + haricot), maintien de la matière organique du sol.'
  })
}

function getDiagnosisMock() {
  // Simuler différents diagnostics selon le contexte
  const mockDiagnoses = [
    {
      disease_name: 'Mildiou du manioc',
      symptoms: 'Taches jaunâtres sur les feuilles, puis brunissement et séchage progressif du feuillage. Les tiges peuvent présenter des lésions allongées.',
      cause: 'Fongique - Phytophthora spp.',
      severity: 'moderee',
      treatment: 'Appliquer du Mancozèbe 2g/L ou du Chlorothalonil 1.5g/L toutes les 2 semaines. Pulvériser au début des symptômes.',
      eco_treatment: 'Décoction de feuilles de neem (500g de feuilles pour 5L d\'eau, bouillir 15min, filtrer et pulvériser). Ou purin d\'ortie (1kg d\'ortie pour 10L d\'eau, macérer 48h).',
      prevention: 'Éviter l\'excès d\'humidité, espacer les plants, utiliser des variétés résistantes, détruire les plants malades.',
      cultural_practices: 'Rotation des cultures avec des céréales, drainage adéquat du sol, fertilisation équilibrée.'
    },
    {
      disease_name: 'Anthracnose du maïs',
      symptoms: 'Lésions elliptiques sur les feuilles avec centre clair et bordures brunes. Les grains peuvent présenter des taches noires.',
      cause: 'Fongique - Colletotrichum graminicola',
      severity: 'elevee',
      treatment: 'Pulvériser du Benomyl 1g/L ou du Carbendazim 0.5g/L dès l\'apparition des premiers symptômes. Renouveler après 10 jours.',
      eco_treatment: 'Extraits de ail (200g d\'ail broyé pour 1L d\'eau, laisser reposer 24h) ou solution de cuivre (Bordeaux dilué à 1/20).',
      prevention: 'Utiliser des semences certifiées, éviter la monoculture, pratiquer la rotation avec des légumineuses.',
      cultural_practices: 'Espacement adéquat des plants (75cm x 50cm), élimination des résidus de culture, fertilisation azotée modérée.'
    },
    {
      disease_name: 'Carence en azote du maïs',
      symptoms: 'Feuilles inférieures jaunâtres, croissance ralentie, tiges fines. Les feuilles plus anciennes sont les plus affectées.',
      cause: 'Nutritionnelle - Déficit en azote',
      severity: 'faible',
      treatment: 'Appliquer 50kg/ha d\'urée ou 100kg/ha de sulfate d\'ammonium. Fractionner l\'apport en 2-3 fois pendant la croissance.',
      eco_treatment: 'Incorporer du compost mûr (20-30 tonnes/ha) ou du fumier bien décomposé. Planter des légumineuses comme engrais vert.',
      prevention: 'Analyser le sol avant plantation, maintenir un bon taux de matière organique, pratiquer la rotation des cultures.',
      cultural_practices: 'Culture de couverture pendant l\'intersaison, utilisation de variétés efficaces dans l\'absorption de l\'azote.'
    },
    {
      disease_name: 'Mosaïque africaine du manioc',
      symptoms: 'Taches claires et vertes en mosaïque sur les feuilles, déformation des feuilles, réduction du rendement.',
      cause: 'Virale - Transmise par les mouches blanches',
      severity: 'elevee',
      treatment: 'Aucun traitement curatif efficace. Arracher et brûler les plants malades pour éviter la propagation.',
      eco_treatment: 'Application d\'extraits de piment fort pour repousser les mouches blanches. Utiliser de l\'huile de neem comme répulsif.',
      prevention: 'Utiliser des variétés résistantes (TMS 30572, TMS 4(2)1425), contrôler les mouches blances, espacer les plants.',
      cultural_practices: 'Isoler les nouvelles plantations, éliminer les plants volontaires, rotation avec des cultures non-hôtes.'
    }
  ]

  // Retourner un diagnostic aléatoire pour simuler l'IA
  const randomDiagnosis = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)]
  return Promise.resolve(randomDiagnosis)
}
