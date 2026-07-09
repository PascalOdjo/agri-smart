// Mapping des produits agricoles vers leurs images correspondantes
export const getProductImage = (productName) => {
  if (!productName) return '/src/assets/products/default.jpg'

  const name = productName.toLowerCase().trim()

  // Mapping des produits vers leurs images locales
  const productImageMap = {
    // Céréales
    'maïs': '/src/assets/products/Maïs.jpg',
    'mais': '/src/assets/products/Maïs.jpg',
    'maize': '/src/assets/products/Maïs.jpg',
    'mil': '/src/assets/products/Maïs.jpg',
    'sorgho': '/src/assets/products/Maïs.jpg',
    'riz': '/src/assets/products/riz.jpg',

    // Tubercules
    'manioc': '/src/assets/products/Manioc.jpg',
    'cassava': '/src/assets/products/Manioc.jpg',
    'igname': '/src/assets/products/igname.jpg',
    'yam': '/src/assets/products/igname.jpg',
    'patate douce': '/src/assets/products/Patate.jpg',
    'sweet potato': '/src/assets/products/Patate.jpg',

    // Légumes
    'tomate': '/src/assets/products/Tomate.jpg',
    'tomates': '/src/assets/products/Tomates.jpg',
    'tomato': '/src/assets/products/Tomates.jpg',
    'oignon': '/src/assets/products/Oignon.jpg',
    'oignons': '/src/assets/products/Oignons.jpg',
    'onion': '/src/assets/products/Oignons.jpg',
    'piment': '/src/assets/products/Piment.jpg',
    'piments': '/src/assets/products/Piments.jpg',
    'pepper': '/src/assets/products/Piment.jpg',
    'aubergine': '/src/assets/products/Aubergine.jpg',
    'carotte': '/src/assets/products/Carotte.jpg',
    'chou': '/src/assets/products/Chou.jpg',

    // Fruits
    'banane': '/src/assets/products/default.jpg',
    'bananes': '/src/assets/products/default.jpg',
    'banana': '/src/assets/products/default.jpg',
    'orange': '/src/assets/products/default.jpg',
    'oranges': '/src/assets/products/default.jpg',
    'mangue': '/src/assets/products/default.jpg',
    'papaye': '/src/assets/products/default.jpg',
    'ananas': '/src/assets/products/default.jpg',

    // Légumineuses
    'haricot': '/src/assets/products/default.jpg',
    'haricots': '/src/assets/products/default.jpg',
    'bean': '/src/assets/products/default.jpg',
    'pois': '/src/assets/products/default.jpg',
    'arachide': '/src/assets/products/default.jpg',
    'soja': '/src/assets/products/default.jpg',

    // Autres
    'coton': '/src/assets/products/default.jpg',
    'café': '/src/assets/products/default.jpg',
    'cacao': '/src/assets/products/default.jpg',
  }

  // Chercher une correspondance exacte
  if (productImageMap[name]) {
    return productImageMap[name]
  }

  // Chercher une correspondance partielle (contient)
  for (const [key, value] of Object.entries(productImageMap)) {
    if (name.includes(key) || key.includes(name)) {
      return value
    }
  }

  // Image par défaut
  return '/src/assets/products/default.jpg'
}

export default getProductImage
