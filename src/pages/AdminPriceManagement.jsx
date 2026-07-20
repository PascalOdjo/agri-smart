import { useEffect, useState } from 'react'
import {
  Package,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  BarChart3,
  Users,
  Search,
  Filter
} from 'lucide-react'
import { get, post, put, del } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'

export function AdminPriceManagement() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) return

    fetchProducts()
  }, [isAdmin])

  const fetchProducts = async () => {
    try {
      const res = await get('/national_prices?status=active')
      const nationalPrices = res?.national_prices || []
      if (nationalPrices.length > 0) {
        const formattedProducts = nationalPrices.map(price => ({
          id: price.id,
          title: price.product_name,
          description: `Prix de référence national - ${price.product_category}`,
          category: price.product_category,
          price: price.reference_price,
          unit: price.unit,
          stock: 999999,
          farmer_id: null,
          created_at: price.created_at,
          image: null,
          is_national_price: true
        }))
        setProducts(formattedProducts)
        return
      }

      const productsRes = await get('/products')
      setProducts(productsRes?.products || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      setProducts(getTestProducts())
    } finally {
      setLoading(false)
    }
  }

  const getTestProducts = () => {
    return [
      {
        id: 'prod-1',
        title: 'Tomates',
        description: 'Tomates bio cultivées localement - Prix de référence national',
        category: 'légumes',
        price: 2500, // 2500 FCFA/kg
        unit: 'kg',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-10T10:30:00Z',
        image: null,
        is_national_price: true
      },
      {
        id: 'prod-2',
        title: 'Oignons',
        description: 'Oignons frais - Prix de référence national',
        category: 'légumes',
        price: 1800, // 1800 FCFA/kg
        unit: 'kg',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-11T09:15:00Z',
        image: null,
        is_national_price: true
      },
      {
        id: 'prod-3',
        title: 'Riz',
        description: 'Riz local de haute qualité - Prix de référence national',
        category: 'céréales',
        price: 600, // 600 FCFA/kg
        unit: 'kg',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-12T14:20:00Z',
        image: null,
        is_national_price: true
      },
      {
        id: 'prod-4',
        title: 'Maïs',
        description: 'Maïs local - Prix de référence national',
        category: 'céréales',
        price: 400, // 400 FCFA/kg
        unit: 'kg',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-13T11:45:00Z',
        image: null,
        is_national_price: true
      },
      {
        id: 'prod-5',
        title: 'Lait',
        description: 'Lait frais - Prix de référence national',
        category: 'produits laitiers',
        price: 1500, // 1500 FCFA/L
        unit: 'L',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-14T08:30:00Z',
        image: null,
        is_national_price: true
      },
      {
        id: 'prod-6',
        title: 'Miel Artisanal',
        description: 'Miel récolté dans les forêts du Togo - Prix de référence national',
        category: 'miel',
        price: 8000, // 8000 FCFA/pot
        unit: 'pot',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-15T16:00:00Z',
        image: null,
        is_national_price: true
      },
      {
        id: 'prod-7',
        title: 'Viande de bœuf',
        description: 'Viande de bœuf locale - Prix de référence national',
        category: 'viande',
        price: 3500, // 3500 FCFA/kg
        unit: 'kg',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-16T10:00:00Z',
        image: null,
        is_national_price: true
      },
      {
        id: 'prod-8',
        title: 'Bananes',
        description: 'Bananes locales - Prix de référence national',
        category: 'fruits',
        price: 800, // 800 FCFA/kg
        unit: 'kg',
        stock: 999999,
        farmer_id: null,
        created_at: '2024-03-17T12:00:00Z',
        image: null,
        is_national_price: true
      }
    ]
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Mise à jour
        await put(`/products/${editingProduct.id}`, {
          title: productData.title,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          unit: productData.unit,
          stock: productData.stock
        })
      } else {
        // Création
        await post('/products', {
          title: productData.title,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          unit: productData.unit,
          stock: productData.stock,
          farmer_id: 'farmer-1'
        })
      }

      await fetchProducts()
      setEditingProduct(null)
      setShowAddForm(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      await del(`/products/${productId}`)
      await fetchProducts()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès Refusé</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">Chargement des produits...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-600">
            Gestion des Prix
          </h1>
          <p className="text-slate-500 mt-1">Gérez les prix des produits sur le marché</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:from-purple-700 hover:to-pink-600 shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              <p className="text-sm text-slate-600">Total Produits</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(products.reduce((sum, p) => sum + (p.price || 0), 0))}
              </p>
              <p className="text-sm text-slate-600">Valeur Totale</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(products.length > 0 ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length : 0)}
              </p>
              <p className="text-sm text-slate-600">Prix Moyen</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(products.map(p => p.farmer_id)).size}
              </p>
              <p className="text-sm text-slate-600">Agriculteurs Actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100/70 text-sm rounded-xl border border-transparent focus:border-purple-200 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all outline-none w-64 md:w-80"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
            >
              <option value="all">Toutes les catégories</option>
              <option value="légumes">Légumes</option>
              <option value="produits laitiers">Produits laitiers</option>
              <option value="boulangerie">Boulangerie</option>
              <option value="œufs">Œufs</option>
              <option value="miel">Miel</option>
              <option value="céréales">Céréales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucun produit trouvé</h3>
            <p className="text-slate-500">
              {searchTerm || categoryFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Commencez par ajouter des produits au marché.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Produit</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Catégorie</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Prix</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Unité</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Stock</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{product.title}</p>
                          <p className="text-sm text-slate-500">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-purple-600">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700">{product.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock > 20 ? 'text-green-600' :
                        product.stock > 10 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddForm || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingProduct(null)
                }}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveProduct({
                  id: editingProduct?.id,
                  title: e.target.title.value,
                  description: e.target.description.value,
                  category: e.target.category.value,
                  price: parseFloat(e.target.price.value),
                  unit: e.target.unit.value,
                  stock: parseInt(e.target.stock.value)
                })
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom du produit</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingProduct?.title || ''}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Ex: Tomates Fraîches"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="Description détaillée du produit..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catégorie</label>
                <select
                  name="category"
                  defaultValue={editingProduct?.category || 'légumes'}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                  <option value="légumes">Légumes</option>
                  <option value="produits laitiers">Produits laitiers</option>
                  <option value="boulangerie">Boulangerie</option>
                  <option value="œufs">Œufs</option>
                  <option value="miel">Miel</option>
                  <option value="céréales">Céréales</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prix (FCFA)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct?.price || ''}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unité</label>
                  <select
                    name="unit"
                    defaultValue={editingProduct?.unit || 'kg'}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="L">Litre</option>
                    <option value="pièce">pièce</option>
                    <option value="douzaine">douzaine</option>
                    <option value="pot">pot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Stock</label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={editingProduct?.stock || ''}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="100"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
