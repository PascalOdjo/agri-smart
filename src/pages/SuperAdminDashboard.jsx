import { useEffect, useState } from 'react'
import {
  Users,
  Package,
  DollarSign,
  MapPin,
  TrendingUp,
  Settings,
  Shield,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  X,
  Calendar,
  Globe,
  Store,
  Warehouse
} from 'lucide-react'
import { get, post, put, del } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'

export function SuperAdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Data states
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [regions, setRegions] = useState([])
  const [nationalPrices, setNationalPrices] = useState([])
  const [regionalAdjustments, setRegionalAdjustments] = useState([])
  const [stats, setStats] = useState({})

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isSuperAdmin) return

    fetchDashboardData()
  }, [isSuperAdmin])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [
        usersData,
        productsData,
        regionsData,
        nationalPricesData,
        regionalAdjustmentsData
      ] = await Promise.all([
        fetchUsers(),
        fetchProducts(),
        fetchRegions(),
        fetchNationalPrices(),
        fetchRegionalAdjustments()
      ])

      setUsers(usersData)
      setProducts(productsData)
      setRegions(regionsData)
      setNationalPrices(nationalPricesData)
      setRegionalAdjustments(regionalAdjustmentsData)

      // Calculate real stats from actual data
      const statsData = {
        totalUsers: usersData.length,
        totalFarmers: usersData.filter(u => u.role === 'farmer').length,
        totalClients: usersData.filter(u => u.role === 'client').length,
        totalProducts: Math.max(productsData.length, nationalPricesData.length),
        totalRegions: regionsData.length,
        avgProductPrice: productsData.length > 0
          ? productsData.reduce((sum, p) => sum + (p.price || 0), 0) / productsData.length
          : nationalPricesData.length > 0
            ? nationalPricesData.reduce((sum, p) => sum + (p.reference_price || 0), 0) / nationalPricesData.length
            : 0,
        totalNationalPrices: nationalPricesData.length,
        totalRegionalAdjustments: regionalAdjustmentsData.length
      }
      setStats(statsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await get('/users')
      return res?.users || []
    } catch (error) {
      console.error('Erreur utilisateurs:', error)
      return []
    }
  }

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
        return formattedProducts
      }

      const productsRes = await get('/products')
      return productsRes?.products || []
    } catch (error) {
      console.error('Erreur produits:', error)
      return getTestProducts()
    }
  }

  const fetchRegions = async () => {
    try {
      const res = await get('/regions')
      return res?.regions || []
    } catch (error) {
      console.error('Erreur régions:', error)
      return []
    }
  }

  const fetchNationalPrices = async () => {
    try {
      const res = await get('/national_prices?status=active')
      return res?.national_prices || []
    } catch (error) {
      console.error('Erreur prix nationaux:', error)
      return []
    }
  }

  const fetchRegionalAdjustments = async () => {
    try {
      const res = await get('/regional_price_adjustments?status=active')
      return res?.regional_price_adjustments || []
    } catch (error) {
      console.error('Erreur ajustements régionaux:', error)
      return []
    }
  }

  const getTestUsers = () => [
    {
      id: 'user-1',
      email: 'farmer1@togo.com',
      full_name: 'Koffi Amenyo',
      role: 'farmer',
      region: 'Lomé',
      phone: '+228 90 12 34 56',
      created_at: '2024-03-10T10:30:00Z',
      status: 'active'
    },
    {
      id: 'user-2',
      email: 'client1@togo.com',
      full_name: 'Awa Bako',
      role: 'client',
      region: 'Kara',
      phone: '+228 91 23 45 67',
      created_at: '2024-03-11T09:15:00Z',
      status: 'active'
    },
    {
      id: 'user-3',
      email: 'farmer2@togo.com',
      full_name: 'Moussa Traoré',
      role: 'farmer',
      region: 'Sokodé',
      phone: '+228 92 34 56 78',
      created_at: '2024-03-12T14:20:00Z',
      status: 'active'
    },
    {
      id: 'user-4',
      email: 'client2@togo.com',
      full_name: 'Yao Koffi',
      role: 'client',
      region: 'Atakpamé',
      phone: '+228 93 45 67 89',
      created_at: '2024-03-13T11:45:00Z',
      status: 'active'
    },
    {
      id: 'user-5',
      email: 'farmer3@togo.com',
      full_name: 'Kossi Adzo',
      role: 'farmer',
      region: 'Mango',
      phone: '+228 94 56 78 90',
      created_at: '2024-03-14T08:30:00Z',
      status: 'active'
    }
  ]

  const getTestProducts = () => [
    {
      id: 'prod-1',
      title: 'Tomates Togolaises',
      description: 'Tomates bio cultivées dans la région de Lomé',
      category: 'légumes',
      price: 2500,
      unit: 'kg',
      region: 'Lomé',
      stock: 500,
      is_national_price: true,
      created_at: '2024-03-10T10:30:00Z'
    },
    {
      id: 'prod-2',
      title: 'Riz de Kara',
      description: 'Riz local de haute qualité de la région de Kara',
      category: 'céréales',
      price: 600,
      unit: 'kg',
      region: 'Kara',
      stock: 1000,
      is_national_price: false,
      created_at: '2024-03-11T09:15:00Z'
    },
    {
      id: 'prod-3',
      title: 'Miel des Savanes',
      description: 'Miel artisanal des régions du nord Togo',
      category: 'miel',
      price: 8000,
      unit: 'pot',
      region: 'Sokodé',
      stock: 200,
      is_national_price: true,
      created_at: '2024-03-12T14:20:00Z'
    }
  ]

  const getTestRegions = () => [
    {
      id: 'region-1',
      name: 'Lomé',
      code: 'LOM',
      description: 'Région maritime, capitale économique',
      population: 2000000,
      main_products: ['tomates', 'poisson', 'légumes'],
      created_at: '2024-03-10T10:30:00Z'
    },
    {
      id: 'region-2',
      name: 'Kara',
      code: 'KAR',
      description: 'Région centrale, zone agricole',
      population: 800000,
      main_products: ['riz', 'igname', 'mil'],
      created_at: '2024-03-11T09:15:00Z'
    },
    {
      id: 'region-3',
      name: 'Sokodé',
      code: 'SOK',
      description: 'Région du centre, zone d\'élevage',
      population: 600000,
      main_products: ['miel', 'viande', 'lait'],
      created_at: '2024-03-12T14:20:00Z'
    },
    {
      id: 'region-4',
      name: 'Atakpamé',
      code: 'ATA',
      description: 'Région des plateaux, zone caféière',
      population: 500000,
      main_products: ['café', 'cacao', 'bananes'],
      created_at: '2024-03-13T11:45:00Z'
    }
  ]

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price)
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès Administrateur Requis</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Vous devez être administrateur pour accéder à ce panneau de contrôle.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-600">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-slate-500 mt-1">Gestion complète de l'écosystème agricole du Togo</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Globe className="w-4 h-4" />
          <span>Territoire National</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-purple-100 p-1 overflow-x-auto">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon={BarChart3}
          label="Aperçu"
        />
        <TabButton
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          icon={Users}
          label="Utilisateurs"
        />
        <TabButton
          active={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          icon={Package}
          label="Produits"
        />
        <TabButton
          active={activeTab === 'regions'}
          onClick={() => setActiveTab('regions')}
          icon={MapPin}
          label="Régions"
        />
        <TabButton
          active={activeTab === 'prices'}
          onClick={() => setActiveTab('prices')}
          icon={DollarSign}
          label="Prix Nationaux"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && <OverviewTab stats={stats} users={users} products={products} regions={regions} nationalPrices={nationalPrices} regionalAdjustments={regionalAdjustments} />}
      {activeTab === 'users' && <UsersTab users={users} />}
      {activeTab === 'products' && <ProductsTab products={products} regions={regions} />}
      {activeTab === 'regions' && <RegionsTab regions={regions} />}
      {activeTab === 'prices' && <PricesTab products={products} regions={regions} />}
    </div>
  )
}

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${active
        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

// Overview Tab Component
function OverviewTab({ stats, users, products, regions, nationalPrices, regionalAdjustments }) {
  // Get recent activity from real data
  const recentActivity = [
    ...(users.slice(0, 2).map((user, index) => ({
      id: `user-${user.id}`,
      type: 'user',
      title: `Nouvel utilisateur inscrit : ${user.full_name}`,
      subtitle: `${user.role === 'farmer' ? 'Agriculteur' : user.role === 'client' ? 'Client' : 'Admin'} - ${user.region || 'Non spécifié'}`,
      time: `Il y a ${index + 1}h`,
      color: user.role === 'farmer' ? 'green' : user.role === 'client' ? 'blue' : 'purple'
    }))),
    ...(products.slice(0, 2).map((product, index) => ({
      id: `product-${product.id}`,
      type: 'product',
      title: `Nouveau produit référencé : ${product.title}`,
      subtitle: `${product.category} - ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(product.price)}`,
      time: `Il y a ${index + 3}h`,
      color: 'amber'
    })))
  ].slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Utilisateurs"
          value={stats.totalUsers || 0}
          icon={Users}
          color="blue"
          change={stats.totalUsers > 0 ? `+${Math.round((stats.totalFarmers + stats.totalClients) / stats.totalUsers * 100)}%` : '0%'}
        />
        <StatCard
          title="Agriculteurs Actifs"
          value={stats.totalFarmers || 0}
          icon={Store}
          color="green"
          change={stats.totalFarmers > 0 ? `+${Math.round(stats.totalFarmers / (stats.totalUsers || 1) * 100)}%` : '0%'}
        />
        <StatCard
          title="Clients Enregistrés"
          value={stats.totalClients || 0}
          icon={Package}
          color="purple"
          change={stats.totalClients > 0 ? `+${Math.round(stats.totalClients / (stats.totalUsers || 1) * 100)}%` : '0%'}
        />
        <StatCard
          title="Prix Nationaux"
          value={stats.totalNationalPrices || 0}
          icon={Warehouse}
          color="amber"
          change={stats.totalNationalPrices > 0 ? `+${Math.round(stats.totalNationalPrices / (stats.totalProducts || 1) * 100)}%` : '0%'}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-900">Régions Couvertes</h4>
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalRegions || 0}</div>
          <p className="text-sm text-slate-600 mt-1">Régions administrées</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-900">Prix Moyen</h4>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF'
            }).format(stats.avgProductPrice || 0)}
          </div>
          <p className="text-sm text-slate-600 mt-1">Prix moyen par produit</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-900">Ajustements Régionaux</h4>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalRegionalAdjustments || 0}</div>
          <p className="text-sm text-slate-600 mt-1">Ajustements actifs</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Activité Récente</h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 font-medium">{activity.title}</p>
                  <p className="text-xs text-slate-500">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune activité récente</p>
              <p className="text-sm">Les nouvelles activités apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, change }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600'
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm text-green-600 font-medium">{change}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm text-slate-600 mt-1">{title}</p>
    </div>
  )
}

// Users Tab Component
function UsersTab({ users }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Gestion des Utilisateurs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Utilisateur</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Rôle</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Région</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Téléphone</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Statut</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'farmer' ? 'bg-green-100 text-green-700' :
                    user.role === 'client' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                    {user.role === 'farmer' ? 'Agriculteur' :
                      user.role === 'client' ? 'Client' :
                        'Admin'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-700">{user.region}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-700">{user.phone}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                    }`}>
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Products Tab Component
function ProductsTab({ products, regions }) {
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      await del(`/national_prices/${productId}`)
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du produit')
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowAddForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Produits Nationaux</h3>
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un produit</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Produit</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Catégorie</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Prix National</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Région</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Stock</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{product.title}</p>
                      <p className="text-sm text-slate-500">{product.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-purple-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF'
                      }).format(product.price)}
                    </span>
                    {product.is_national_price && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        National
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-700">{product.region}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${product.stock > 100 ? 'text-green-600' :
                      product.stock > 50 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* Formulaire d'ajout/modification de produit */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const productData = {
                product_name: formData.get('product_name'),
                product_category: formData.get('product_category'),
                reference_price: parseFloat(formData.get('reference_price')),
                unit: formData.get('unit'),
                effective_date: new Date().toISOString().split('T')[0]
              }

              try {
                if (editingProduct) {
                  // Modifier le produit
                  await put(`/national_prices/${editingProduct.id}`, productData)
                  alert('Produit modifié avec succès')
                  setShowAddForm(false)
                  window.location.reload()
                } else {
                  // Ajouter un nouveau produit
                  await post('/national_prices', productData)
                  alert('Produit ajouté avec succès')
                  setShowAddForm(false)
                  window.location.reload()
                }
              } catch (error) {
                console.error('Erreur:', error)
                alert('Erreur lors de l\'opération')
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  name="product_name"
                  defaultValue={editingProduct?.title || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Tomates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  name="product_category"
                  defaultValue={editingProduct?.category || 'légumes'}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="légumes">Légumes</option>
                  <option value="céréales">Céréales</option>
                  <option value="produits laitiers">Produits laitiers</option>
                  <option value="miel">Miel</option>
                  <option value="viande">Viande</option>
                  <option value="fruits">Fruits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prix de référence (FCFA)
                </label>
                <input
                  type="number"
                  name="reference_price"
                  defaultValue={editingProduct?.price || ''}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 2500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unité
                </label>
                <select
                  name="unit"
                  defaultValue={editingProduct?.unit || 'kg'}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="kg">kg</option>
                  <option value="L">Litre</option>
                  <option value="pot">pot</option>
                  <option value="pièce">pièce</option>
                  <option value="douzaine">douzaine</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Regions Tab Component
function RegionsTab({ regions }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regions.map((region) => (
          <div key={region.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{region.name}</h3>
                <p className="text-sm text-slate-500">{region.description}</p>
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {region.code}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Population</span>
                <span className="font-medium text-slate-900">
                  {region.population.toLocaleString('fr-FR')} habitants
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Produits Principaux</p>
                <div className="flex flex-wrap gap-2">
                  {region.main_products.map((product, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <button className="flex-1 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                Gérer
              </button>
              <button className="flex-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Prices Tab Component
function PricesTab({ products, regions }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Gestion des Prix Nationaux</h3>

        <div className="space-y-4">
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-purple-900">Prix de Référence National</h4>
              <span className="text-sm text-purple-600">Actif</span>
            </div>
            <p className="text-sm text-purple-700 mb-3">
              Définissez les prix de référence pour tous les produits sur le territoire togolais.
              Ces prix servent de base pour les variations régionales.
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Configurer les prix nationaux
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions.map((region) => (
              <div key={region.id} className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Région: {region.name}</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Ajustez les prix locaux en fonction des conditions économiques régionales.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Variation autorisée</span>
                    <span className="font-medium text-slate-900">±15%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Produits gérés</span>
                    <span className="font-medium text-slate-900">
                      {products.filter(p => p.region === region.name).length}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-3 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Gérer les prix régionaux
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
