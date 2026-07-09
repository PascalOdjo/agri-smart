import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronRight,
  Filter,
  Search,
  Download,
  Eye,
  RefreshCw,
  Edit,
  Save,
  X
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { getOrdersByFarmer, updateOrderStatus, addTrackingNumber } from '../services/orders.js'

export function OrderManagement() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingTracking, setEditingTracking] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    try {
      const data = await getOrdersByFarmer(user.id)
      setOrders(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'processing':
        return <RefreshCw className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'processing':
        return 'En préparation'
      case 'shipped':
        return 'Expédiée'
      case 'delivered':
        return 'Livrée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, user.id)
      await fetchOrders() // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const handleTrackingSubmit = async (orderId) => {
    try {
      await addTrackingNumber(orderId, trackingNumber, user.id)
      setTrackingNumber('')
      setEditingTracking(null)
      await fetchOrders()
    } catch (error) {
      console.error('Erreur lors de l\'ajout du numéro de suivi:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.delivery_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-emerald-800 font-medium animate-pulse">Chargement des commandes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-600">
            Gestion des Commandes
          </h1>
          <p className="text-slate-500 mt-1">Gérez les commandes de vos clients</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium hover:from-emerald-700 hover:to-teal-600 shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all"
        >
          <Package className="w-5 h-5" />
          <span>Retour au dashboard</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600">En attente</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {orders.filter(o => o.status === 'processing').length}
              </p>
              <p className="text-sm text-slate-600">En préparation</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
              <p className="text-sm text-slate-600">Expédiées</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
              <p className="text-sm text-slate-600">Livrées</p>
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
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En préparation</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Aucune commande trouvée' : 'Aucune commande'}
            </h3>
            <p className="text-slate-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Vous n\'avez pas encore reçu de commandes.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Commande</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Montant</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Statut</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Suivi</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            #{order.id?.slice(0, 8) || 'Nouvelle commande'}
                          </p>
                          {order.items_count && (
                            <p className="text-sm text-slate-500">
                              {order.items_count} {order.items_count > 1 ? 'articles' : 'article'}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {order.delivery_name || 'Client'}
                          </p>
                          {order.delivery_phone && (
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {order.delivery_phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {order.total_amount ? `${order.total_amount.toFixed(2)} €` : 'N/A'}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusLabel(order.status)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {editingTracking === order.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Numéro de suivi"
                            className="px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          />
                          <button
                            onClick={() => handleTrackingSubmit(order.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTracking(null)
                              setTrackingNumber('')
                            }}
                            className="p-1 text-slate-600 hover:bg-slate-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {order.tracking_number ? (
                            <span className="text-sm text-slate-700 font-mono">
                              {order.tracking_number}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Non défini</span>
                          )}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => setEditingTracking(order.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Status Actions */}
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(order.id, 'processing')}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            Préparer
                          </button>
                        )}

                        {order.status === 'processing' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(order.id, 'shipped')}
                            className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                          >
                            Expédier
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            Livrer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Détails de la commande #{selectedOrder.id?.slice(0, 8)}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                <span>{getStatusLabel(selectedOrder.status)}</span>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Informations du client</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {selectedOrder.delivery_name}
                      </p>
                      <p className="text-blue-700 mb-2">
                        {selectedOrder.delivery_address}
                      </p>
                      {selectedOrder.delivery_phone && (
                        <p className="text-sm text-blue-700 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedOrder.delivery_phone}
                        </p>
                      )}
                      {selectedOrder.delivery_email && (
                        <p className="text-sm text-blue-700 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedOrder.delivery_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Articles commandés</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                            />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{item.product_name}</p>
                            <p className="text-sm text-slate-600">
                              {item.quantity} × {item.unit_price.toFixed(2)} €
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {item.total_price.toFixed(2)} €
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Résumé de la commande</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sous-total:</span>
                    <span className="font-medium text-slate-900">
                      {selectedOrder.subtotal ? `${selectedOrder.subtotal.toFixed(2)} €` : 'N/A'}
                    </span>
                  </div>
                  {selectedOrder.delivery_fee && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Frais de livraison:</span>
                      <span className="font-medium text-slate-900">
                        {selectedOrder.delivery_fee.toFixed(2)} €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <span className="font-bold text-lg text-emerald-600">
                      {selectedOrder.total_amount ? `${selectedOrder.total_amount.toFixed(2)} €` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Notes du client</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Fermer
                </button>

                {selectedOrder.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'processing')
                      setSelectedOrder(null)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Commencer la préparation
                  </button>
                )}

                {selectedOrder.status === 'processing' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'shipped')
                      setSelectedOrder(null)
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Marquer comme expédiée
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
