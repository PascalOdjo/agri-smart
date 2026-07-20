import { useState, useEffect } from 'react'
import { Package, Plus, Leaf, AlertTriangle, Edit2, Trash2, Search, Filter, Beaker } from 'lucide-react'
import { get, post, put, del } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'

export function ProductManagement() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('fertilizers')
  const [fertilizers, setFertilizers] = useState([])
  const [phytoProducts, setPhytoProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    npk_ratio: '',
    manufacturer: '',
    purchase_date: '',
    quantity_available: '',
    unit: '',
    cost_per_unit: '',
    safety_data_sheet: '',
    active_ingredient: '',
    concentration: '',
    approval_number: '',
    reentry_interval_days: '',
    harvest_interval_days: '',
    max_applications_per_year: '',
    notes: ''
  })

  const fertilizerTypes = ['Organique', 'Minéral', 'Liquide', 'Granulé', 'Soluble', 'Autre']
  const phytoTypes = ['Herbicide', 'Fongicide', 'Insecticide', 'Nématicide', 'Rodenticide', 'Biostimulant', 'Autre']
  const units = ['kg', 'L', 'tonne', 'g', 'mL']

  useEffect(() => {
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const farmRes = await get(`/farms?userId=${user.id}`)
      const farm = farmRes?.farm || (farmRes?.farms && farmRes.farms[0])
      if (farm) {
        const [fertRes, phytoRes] = await Promise.all([
          get(`/fertilizers?farmId=${farm.id}`),
          get(`/phyto_products?farmId=${farm.id}`)
        ])
        setFertilizers(fertRes?.fertilizers || [])
        setPhytoProducts(phytoRes?.phyto_products || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const farmRes = await get(`/farms?userId=${user.id}`)
      const farm = farmRes?.farm || (farmRes?.farms && farmRes.farms[0])
      if (!farm) throw new Error('Ferme non trouvée')

      const productData = {
        farm_id: farm.id,
        ...formData,
        quantity_available: parseFloat(formData.quantity_available),
        cost_per_unit: formData.cost_per_unit ? parseFloat(formData.cost_per_unit) : null,
        reentry_interval_days: formData.reentry_interval_days ? parseInt(formData.reentry_interval_days) : null,
        harvest_interval_days: formData.harvest_interval_days ? parseInt(formData.harvest_interval_days) : null,
        max_applications_per_year: formData.max_applications_per_year ? parseInt(formData.max_applications_per_year) : null
      }

      if (activeTab === 'fertilizers') {
        const { fertilizerData, ...phytoData } = productData
        if (editingProduct) {
          await put(`/fertilizers/${editingProduct.id}`, fertilizerData)
        } else {
          await post('/fertilizers', fertilizerData)
        }
      } else {
        const { phytoData, ...fertilizerData } = productData
        if (editingProduct) {
          await put(`/phyto_products/${editingProduct.id}`, phytoData)
        } else {
          await post('/phyto_products', phytoData)
        }
      }

      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_type: '',
      npk_ratio: '',
      manufacturer: '',
      purchase_date: '',
      quantity_available: '',
      unit: '',
      cost_per_unit: '',
      safety_data_sheet: '',
      active_ingredient: '',
      concentration: '',
      approval_number: '',
      reentry_interval_days: '',
      harvest_interval_days: '',
      max_applications_per_year: '',
      notes: ''
    })
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      product_name: product.product_name,
      product_type: product.product_type,
      npk_ratio: product.npk_ratio || '',
      manufacturer: product.manufacturer || '',
      purchase_date: product.purchase_date || '',
      quantity_available: product.quantity_available?.toString() || '',
      unit: product.unit || '',
      cost_per_unit: product.cost_per_unit?.toString() || '',
      safety_data_sheet: product.safety_data_sheet || '',
      active_ingredient: product.active_ingredient || '',
      concentration: product.concentration || '',
      approval_number: product.approval_number || '',
      reentry_interval_days: product.reentry_interval_days?.toString() || '',
      harvest_interval_days: product.harvest_interval_days?.toString() || '',
      max_applications_per_year: product.max_applications_per_year?.toString() || '',
      notes: product.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await del(`/${activeTab === 'fertilizers' ? 'fertilizers' : 'phyto_products'}/${id}`)
        fetchProducts()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const getFilteredProducts = () => {
    const products = activeTab === 'fertilizers' ? fertilizers : phytoProducts
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(product => product.product_type === filterType)
    }

    return filtered
  }

  const getStockStatus = (quantity, unit) => {
    if (!quantity) return { status: 'unknown', color: 'grey', text: 'Non spécifié' }

    // Seuils arbitraires basés sur l'unité
    let threshold
    if (unit === 'kg' || unit === 'L') threshold = 10
    else if (unit === 'tonne') threshold = 0.5
    else threshold = 100

    if (quantity <= threshold) return { status: 'low', color: 'red', text: 'Stock faible' }
    if (quantity <= threshold * 3) return { status: 'medium', color: 'orange', text: 'Stock moyen' }
    return { status: 'good', color: 'green', text: 'Stock suffisant' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Gestion des Produits
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Gérez vos engrais et produits phytosanitaires
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Onglets */}
      <div className="border border-slate-200 rounded-lg p-1 bg-slate-50">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab('fertilizers')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'fertilizers'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            <Beaker className="w-4 h-4 inline mr-2" />
            Engrais
          </button>
          <button
            onClick={() => setActiveTab('phyto')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'phyto'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            <Leaf className="w-4 h-4 inline mr-2" />
            Produits phytosanitaires
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Tous les types</option>
            {(activeTab === 'fertilizers' ? fertilizerTypes : phytoTypes).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingProduct ? 'Modifier le produit' : `Ajouter un ${activeTab === 'fertilizers' ? 'engrais' : 'produit phytosanitaire'}`}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Azote liquide 32%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type de produit *
                </label>
                <select
                  required
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {(activeTab === 'fertilizers' ? fertilizerTypes : phytoTypes).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fabricant
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: Yara, BASF"
                />
              </div>

              {activeTab === 'fertilizers' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ratio N-P-K
                    </label>
                    <input
                      type="text"
                      value={formData.npk_ratio}
                      onChange={(e) => setFormData({ ...formData, npk_ratio: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: 15-15-15"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Substance active
                    </label>
                    <input
                      type="text"
                      value={formData.active_ingredient}
                      onChange={(e) => setFormData({ ...formData, active_ingredient: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: Glyphosate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Concentration
                    </label>
                    <input
                      type="text"
                      value={formData.concentration}
                      onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: 360 g/L"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Numéro d'homologation
                    </label>
                    <input
                      type="text"
                      value={formData.approval_number}
                      onChange={(e) => setFormData({ ...formData, approval_number: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: AM 2100012"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Délai de réentrée (jours)
                    </label>
                    <input
                      type="number"
                      value={formData.reentry_interval_days}
                      onChange={(e) => setFormData({ ...formData, reentry_interval_days: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: 24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Délai avant récolte (jours)
                    </label>
                    <input
                      type="number"
                      value={formData.harvest_interval_days}
                      onChange={(e) => setFormData({ ...formData, harvest_interval_days: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: 7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max applications/an
                    </label>
                    <input
                      type="number"
                      value={formData.max_applications_per_year}
                      onChange={(e) => setFormData({ ...formData, max_applications_per_year: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: 3"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date d'achat
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantité disponible *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.quantity_available}
                  onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unité *
                </label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Coût par unité
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost_per_unit}
                  onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 15.50"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fiche de données de sécurité
                </label>
                <input
                  type="url"
                  value={formData.safety_data_sheet}
                  onChange={(e) => setFormData({ ...formData, safety_data_sheet: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {editingProduct ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des produits */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {activeTab === 'fertilizers' ? 'Engrais' : 'Produits phytosanitaires'}
              <span className="text-sm text-slate-500 ml-2">({getFilteredProducts().length})</span>
            </h3>
          </div>

          {getFilteredProducts().length === 0 ? (
            <div className="text-center py-8">
              {activeTab === 'fertilizers' ? (
                <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              ) : (
                <Leaf className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              )}
              <p className="text-slate-500">Aucun produit trouvé</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm || filterType !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez par ajouter votre premier produit'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredProducts().map(product => {
                const stockStatus = getStockStatus(product.quantity_available, product.unit)

                return (
                  <div key={product.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{product.product_name}</h4>
                        <p className="text-sm text-slate-600">{product.product_type}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full bg-${stockStatus.color}-500`}></div>
                        <span className={`text-xs text-${stockStatus.color}-600`}>{stockStatus.text}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {product.manufacturer && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Fabricant:</span>
                          <span className="text-slate-800">{product.manufacturer}</span>
                        </div>
                      )}

                      {activeTab === 'fertilizers' && product.npk_ratio && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">N-P-K:</span>
                          <span className="text-slate-800">{product.npk_ratio}</span>
                        </div>
                      )}

                      {activeTab === 'phyto' && product.active_ingredient && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Substance active:</span>
                          <span className="text-slate-800">{product.active_ingredient}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-slate-600">Stock:</span>
                        <span className="font-medium text-slate-800">
                          {product.quantity_available} {product.unit}
                        </span>
                      </div>

                      {product.cost_per_unit && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Coût/unité:</span>
                          <span className="text-slate-800">{product.cost_per_unit} €</span>
                        </div>
                      )}

                      {product.purchase_date && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Acheté le:</span>
                          <span className="text-slate-800">
                            {new Date(product.purchase_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}

                      {activeTab === 'phyto' && (product.reentry_interval_days || product.harvest_interval_days) && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                          <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <div className="text-xs text-orange-700">
                            {product.reentry_interval_days && `Réentrée: ${product.reentry_interval_days}j`}
                            {product.reentry_interval_days && product.harvest_interval_days && ' | '}
                            {product.harvest_interval_days && `Avant récolte: ${product.harvest_interval_days}j`}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
