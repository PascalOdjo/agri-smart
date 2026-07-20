import { useEffect, useState } from 'react'
import { ShoppingBag, Package, TrendingUp, Store, Plus, Check, X, Clock, AlertCircle } from 'lucide-react'
import { get, post, del, put } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'
import { getProductImage } from '../utils/productImages.js'
import { getOrdersByClient, getOrdersByFarmer } from '../services/orders.js'
import { getSupabaseConfigStatus } from '../utils/appConfig.js'

export function Market() {
  const { user, loading: authLoading } = useAuth()
  const supabaseStatus = getSupabaseConfigStatus()

  // Set default role. If not logged in, they are a 'guest'.
  const role = user?.role || (user ? 'farmer' : 'guest')

  // Initialize tab state. 
  // If we don't know the role yet (or if guest/client), default differently.
  const getDefaultTab = () => {
    if (role === 'farmer') return 'mes-produits'
    if (role === 'client') return 'boutique'
    return 'prix-officiels' // for guests
  }

  const [activeTab, setActiveTab] = useState(getDefaultTab())

  // Ensure tab updates if role is detected late after loading
  useEffect(() => {
    setActiveTab(getDefaultTab())
  }, [role])

  if (authLoading) {
    return <div className="p-8 text-center text-emerald-800">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {supabaseStatus.configured === false && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{supabaseStatus.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          <Store className="w-8 h-8 text-emerald-600" />
          Place de Marché
        </h1>

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-emerald-100 p-1 overflow-x-auto hide-scrollbar">
          {role === 'farmer' ? (
            <>
              <TabButton active={activeTab === 'mes-produits'} onClick={() => setActiveTab('mes-produits')} icon={Package} label="Mes Produits" />
              <TabButton active={activeTab === 'mes-ventes'} onClick={() => setActiveTab('mes-ventes')} icon={ShoppingBag} label="Mes Ventes" />
            </>
          ) : (
            <>
              <TabButton active={activeTab === 'boutique'} onClick={() => setActiveTab('boutique')} icon={Store} label="Boutique" />
              <TabButton active={activeTab === 'mes-achats'} onClick={() => setActiveTab('mes-achats')} icon={ShoppingBag} label="Mes Achats" />
            </>
          )}
          <TabButton active={activeTab === 'prix-officiels'} onClick={() => setActiveTab('prix-officiels')} icon={TrendingUp} label="Prix du Marché" />
        </div>
      </div>

      {activeTab === 'mes-produits' && role === 'farmer' && <FarmerProducts user={user} />}
      {activeTab === 'mes-ventes' && role === 'farmer' && <FarmerSales user={user} />}
      {activeTab === 'boutique' && role === 'client' && <ClientShop user={user} />}
      {activeTab === 'mes-achats' && role === 'client' && <ClientPurchases user={user} />}
      {activeTab === 'prix-officiels' && <OfficialPrices />}
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${active ? 'bg-emerald-600 text-white shadow' : 'text-emerald-700 hover:bg-emerald-50'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

// ================= AGRICULTEUR: MES PRODUITS =================
function FarmerProducts({ user }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newImage, setNewImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    setError('')
    try {
      const res = await get(`/products?farmerId=${user.id}`)
      setProducts(res.products || [])
    } catch (err) {
      console.error('Erreur chargement produits:', err)
      setError('Impossible de charger vos produits depuis le backend.')
    } finally {
      setLoading(false)
    }
  }

  async function uploadImage(file) {
    if (!file) return null
    const form = new FormData()
    form.append('file', file)
    form.append('path', `products/${user.id}`)

    const uploadRes = await post('/upload', form, { headers: {} })
    return uploadRes?.file?.url || null
  }

  async function handleDeleteProduct(productId) {
    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')
    if (!confirmDelete) return

    try {
      await del(`/products/${productId}`)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      alert('Erreur lors de la suppression du produit')
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault()
    if (!newTitle || !newPrice) {
      setError('Indiquez au moins un nom et un prix pour le produit.')
      return
    }

    setUploading(true)
    setError('')

    let imageUrl = null
    if (newImage) {
      // Upload via backend
      const form = new FormData()
      form.append('file', newImage)
      const uploadRes = await post('/upload', form, { headers: {} })
      imageUrl = uploadRes?.file?.url
    }

    try {
      const res = await post('/products', {
        title: newTitle,
        price: parseFloat(newPrice),
        unit: 'FCFA/kg',
        imageUrl: imageUrl || getProductImage(newTitle)
      })
      if (res?.product) {
        setProducts([res.product, ...products])
        setShowAddForm(false)
        setNewTitle('')
        setNewPrice('')
        setNewImage('')
      }
    } catch (err) {
      console.error('Erreur insertion produit:', err)
      setError('Une erreur est survenue pendant l’enregistrement du produit.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-emerald-900">Vos produits en vente</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom du produit (ex: Maïs Bio)" value={newTitle} onChange={e => setNewTitle(e.target.value)} required className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            <input type="number" placeholder="Prix (FCFA/kg)" value={newPrice} onChange={e => setNewPrice(e.target.value)} required className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image du produit (optionnel)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewImage(e.target.files[0])}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {newImage && (
                <span className="text-sm text-emerald-600 font-medium">
                  {newImage.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setShowAddForm(false); setNewImage(''); }} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
            <button type="submit" disabled={uploading} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Upload...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center py-8 text-slate-500">Chargement de vos produits...</p>
      ) : products.length === 0 ? (
        <p className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">Vous n'avez pas encore de produits en vente.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col">
              <div className="h-32 bg-emerald-50 overflow-hidden">
                <img
                  src={p.image_url || getProductImage(p.title)}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31d?w=400&h=300&fit=crop&crop=center&auto=format'
                  }}
                />
              </div>
              <div className="p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{p.title}</h3>
                  <p className="text-emerald-600 font-bold">{p.price} {p.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer le produit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <Package className="w-8 h-8 text-emerald-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ================= AGRICULTEUR: MES VENTES =================
function FarmerSales({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const data = await getOrdersByFarmer(user.id)
      setOrders(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, status) {
    try {
      await put(`/orders/${id}`, { status })
      fetchOrders()
    } catch (err) {
      console.error('Erreur update status:', err)
    }
  }

  if (loading) return <p className="text-center py-8 text-slate-500">Chargement...</p>
  if (orders.length === 0) return <p className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">Aucune commande reçue pour le moment.</p>

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-emerald-50 text-emerald-800 text-sm">
          <tr>
            <th className="p-4 font-semibold">Produit</th>
            <th className="p-4 font-semibold">Quantité</th>
            <th className="p-4 font-semibold">Total</th>
            <th className="p-4 font-semibold">Statut</th>
            <th className="p-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-50">
          {orders.map(o => (
            <tr key={o.id} className="text-slate-700">
              <td className="p-4 font-medium">{o.products?.title || 'Produit inconnu'}</td>
              <td className="p-4">{o.quantity} {o.products?.unit?.replace('FCFA/', '') || 'kg'}</td>
              <td className="p-4 font-bold text-emerald-600">{Number(o.total_price).toLocaleString()} FCFA</td>
              <td className="p-4"><OrderStatusBadge status={o.status} /></td>
              <td className="p-4 text-right flex justify-end gap-2">
                {o.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(o.id, 'accepted')} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100" title="Accepter"><Check className="w-4 h-4" /></button>
                    <button onClick={() => updateStatus(o.id, 'rejected')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Rejeter"><X className="w-4 h-4" /></button>
                  </>
                )}
                {o.status === 'accepted' && (
                  <button onClick={() => updateStatus(o.id, 'completed')} className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Terminer</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ================= CLIENT: BOUTIQUE =================
function ClientShop({ user }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const res = await get('/products')
      setProducts(res?.products || [])
    } catch (err) {
      console.error('Erreur chargement boutique:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleOrder(product) {
    const qty = prompt(`Combien de kg de "${product.title}" voulez-vous commander ?`)
    if (!qty || isNaN(qty) || Number(qty) <= 0) return

    const quantity = Number(qty)
    const total_price = quantity * product.price

    const confirmOrder = confirm(`Vous commandez ${quantity} kg pour un total de ${total_price.toLocaleString()} FCFA. Confirmer ?`)
    if (!confirmOrder) return

    try {
      const res = await post('/orders', {
        clientId: user.id,
        farmerId: product.farmer_id,
        productId: product.id,
        quantity,
        totalPrice: total_price,
        status: 'pending',
      })
      if (res?.order) {
        alert('Commande placée avec succès !')
      }
    } catch (err) {
      console.error('Erreur lors de la commande:', err)
      alert('Erreur lors de la commande. Vérifiez que le backend est accessible.')
    }
  }

  if (loading) return <p className="text-center py-8 text-slate-500">Chargement des produits...</p>
  if (products.length === 0) return <p className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">Aucun produit disponible actuellement.</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(p => (
        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
          <div className="h-40 bg-emerald-50 overflow-hidden">
            <img
              src={p.image_url || getProductImage(p.title)}
              alt={p.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31d?w=400&h=300&fit=crop&crop=center&auto=format'
              }}
            />
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-semibold text-slate-900 text-lg">{p.title}</h3>
            <p className="text-emerald-600 font-bold text-xl mt-1">{p.price} <span className="text-sm font-normal text-slate-500">{p.unit}</span></p>
            <div className="mt-auto pt-4">
              <button onClick={() => handleOrder(p)} className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Commander
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ================= CLIENT: MES ACHATS =================
function ClientPurchases({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const data = await getOrdersByClient(user.id)
      setOrders(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="text-center py-8 text-slate-500">Chargement...</p>
  if (orders.length === 0) return <p className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">Vous n'avez pas encore passé de commande.</p>

  return (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-slate-900">{o.products?.title || 'Produit supprimé'}</h4>
            <p className="text-sm text-slate-500 mt-1">
              Quantité: <span className="font-medium text-slate-700">{o.quantity} kg</span> |
              Total: <span className="font-bold text-emerald-600 ml-1">{Number(o.total_price).toLocaleString()} FCFA</span>
            </p>
          </div>
          <OrderStatusBadge status={o.status} />
        </div>
      ))}
    </div>
  )
}

// ================= COMPONENT: STATUT =================
function OrderStatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  const labels = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
    completed: 'Terminée',
  }

  const icons = {
    pending: <Clock className="w-3 h-3 mr-1" />,
    accepted: <Check className="w-3 h-3 mr-1" />,
    rejected: <X className="w-3 h-3 mr-1" />,
    completed: <Check className="w-3 h-3 mr-1" />,
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {icons[status]} {labels[status]}
    </span>
  )
}

// ================= TENDANCES GLOBALES (Ancien Market.jsx) =================
function OfficialPrices() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true)
      try {
        const res = await get('/national_prices')
        setPrices(res?.prices || [])
      } catch (err) {
        console.error('Erreur chargement prix marché:', err)
        setPrices([])
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  if (loading) return <p className="text-center py-8 text-slate-500">Chargement des prix du marché...</p>

  return (
    <div className="space-y-6">
      {prices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Aucun prix de référence n’est encore disponible dans la base de données.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prices.map((item) => (
            <div key={item.id} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.product_name}</p>
                  <p className="text-sm text-slate-500">{item.product_category}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {item.status || 'actif'}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Prix de référence</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {Number(item.reference_price).toLocaleString('fr-FR')} {item.unit}
                  </p>
                </div>
                <img
                  src={getProductImage(item.product_name)}
                  alt={item.product_name}
                  className="h-16 w-16 rounded-xl object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31d?w=400&h=300&fit=crop&crop=center&auto=format'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
