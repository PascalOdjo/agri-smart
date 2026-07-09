import { supabase } from '../lib/supabase.js'

// Récupérer toutes les commandes d'un client
export const getOrdersByClient = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_image,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      // Si la table n'existe pas, retourner des données de test
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Table orders non trouvée, utilisation des données de test')
        return getTestOrders(clientId)
      }
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    // En cas d'erreur, retourner des données de test pour le développement
    return getTestOrders(clientId)
  }
}

// Récupérer une commande spécifique avec ses détails
export const getOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_image,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error)
    throw error
  }
}

// Créer une nouvelle commande
export const createOrder = async (orderData) => {
  try {
    // D'abord créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: orderData.client_id,
        farmer_id: orderData.farmer_id,
        farmer_name: orderData.farmer_name,
        farmer_phone: orderData.farmer_phone,
        farmer_location: orderData.farmer_location,
        status: 'pending',
        delivery_fee: orderData.delivery_fee || 0,
        delivery_name: orderData.delivery_name,
        delivery_address: orderData.delivery_address,
        delivery_phone: orderData.delivery_phone,
        delivery_email: orderData.delivery_email,
        delivery_date: orderData.delivery_date,
        notes: orderData.notes
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Ensuite ajouter les articles de la commande
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.quantity * item.price
    }))

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) throw itemsError

    // Récupérer la commande complète avec les articles
    const fullOrder = await getOrderById(order.id)
    return fullOrder
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    throw error
  }
}

// Mettre à jour le statut d'une commande (pour les agriculteurs)
export const updateOrderStatus = async (orderId, status, farmerId) => {
  try {
    const updateData = { status }

    // Ajouter les timestamps selon le statut
    if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('farmer_id', farmerId) // S'assurer que seul l'agriculteur concerné peut modifier
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    throw error
  }
}

// Ajouter un numéro de suivi
export const addTrackingNumber = async (orderId, trackingNumber, farmerId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        status: 'shipped',
        shipped_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('farmer_id', farmerId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de l\'ajout du numéro de suivi:', error)
    throw error
  }
}

// Annuler une commande (pour les clients)
export const cancelOrder = async (orderId, clientId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('client_id', clientId)
      .eq('status', 'pending') // Ne peut annuler que les commandes en attente
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error)
    throw error
  }
}

// Récupérer les commandes d'un agriculteur
export const getOrdersByFarmer = async (farmerId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })

    if (error) {
      // Si la table n'existe pas, retourner des données de test
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Table orders non trouvée, utilisation des données de test')
        return getTestFarmerOrders(farmerId)
      }
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes agriculteur:', error)
    // En cas d'erreur, retourner des données de test pour le développement
    return getTestFarmerOrders(farmerId)
  }
}

// Obtenir les statistiques des commandes pour un client
export const getClientOrderStats = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .eq('client_id', clientId)

    if (error) throw error

    const stats = {
      total: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      processing: data.filter(o => o.status === 'processing').length,
      shipped: data.filter(o => o.status === 'shipped').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
      totalSpent: data.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      averageOrderValue: data.length > 0 ? data.reduce((sum, o) => sum + (o.total_amount || 0), 0) / data.length : 0
    }

    return stats
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw error
  }
}

// Obtenir les statistiques des commandes pour un agriculteur
export const getFarmerOrderStats = async (farmerId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .eq('farmer_id', farmerId)

    if (error) throw error

    const stats = {
      total: data.length,
      pending: data.filter(o => o.status === 'pending').length,
      processing: data.filter(o => o.status === 'processing').length,
      shipped: data.filter(o => o.status === 'shipped').length,
      delivered: data.filter(o => o.status === 'delivered').length,
      cancelled: data.filter(o => o.status === 'cancelled').length,
      totalRevenue: data.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      averageOrderValue: data.length > 0 ? data.reduce((sum, o) => sum + (o.total_amount || 0), 0) / data.length : 0
    }

    return stats
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques agriculteur:', error)
    throw error
  }
}

// Fonction de test pour le développement (à supprimer en production)
function getTestOrders(clientId) {
  const testOrders = [
    {
      id: 'test-order-1',
      client_id: clientId,
      farmer_id: 'farmer-1',
      farmer_name: 'Ferme du Soleil',
      farmer_phone: '+228 90 12 34 56',
      farmer_location: 'Lomé, Togo',
      status: 'delivered',
      subtotal: 45.50,
      delivery_fee: 5.00,
      total_amount: 50.50,
      items_count: 3,
      delivery_name: 'Jean Dupont',
      delivery_address: '123 Rue Principale, Lomé',
      delivery_phone: '+228 91 23 45 67',
      delivery_email: 'jean.dupont@email.com',
      delivery_date: '2024-03-15',
      notes: 'Livraison après 18h',
      tracking_number: 'TOGO123456',
      created_at: '2024-03-10T10:30:00Z',
      shipped_at: '2024-03-12T14:20:00Z',
      delivered_at: '2024-03-15T16:45:00Z',
      order_items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          product_name: 'Tomates Fraîches',
          product_image: null,
          quantity: 2,
          unit_price: 12.50,
          total_price: 25.00
        },
        {
          id: 'item-2',
          product_id: 'prod-2',
          product_name: 'Lait Frais',
          product_image: null,
          quantity: 1,
          unit_price: 15.50,
          total_price: 15.50
        },
        {
          id: 'item-3',
          product_id: 'prod-3',
          product_name: 'Pain Artisanal',
          product_image: null,
          quantity: 1,
          unit_price: 5.00,
          total_price: 5.00
        }
      ]
    },
    {
      id: 'test-order-2',
      client_id: clientId,
      farmer_id: 'farmer-2',
      farmer_name: 'Domaine Vert',
      farmer_phone: '+228 80 98 76 54',
      farmer_location: 'Kara, Togo',
      status: 'shipped',
      subtotal: 28.00,
      delivery_fee: 0.00,
      total_amount: 28.00,
      items_count: 2,
      delivery_name: 'Marie Kouma',
      delivery_address: '45 Avenue de l\'Indépendance, Kara',
      delivery_phone: '+228 92 34 56 78',
      delivery_email: 'marie.kouma@email.com',
      delivery_date: '2024-03-18',
      notes: 'Appeler avant livraison',
      tracking_number: 'TOGO789012',
      created_at: '2024-03-14T09:15:00Z',
      shipped_at: '2024-03-16T11:30:00Z',
      delivered_at: null,
      order_items: [
        {
          id: 'item-4',
          product_id: 'prod-4',
          product_name: 'Œufs Bio',
          product_image: null,
          quantity: 12,
          unit_price: 2.00,
          total_price: 24.00
        },
        {
          id: 'item-5',
          product_id: 'prod-5',
          product_name: 'Miel Local',
          product_image: null,
          quantity: 1,
          unit_price: 4.00,
          total_price: 4.00
        }
      ]
    },
    {
      id: 'test-order-3',
      client_id: clientId,
      farmer_id: 'farmer-1',
      farmer_name: 'Ferme du Soleil',
      farmer_phone: '+228 90 12 34 56',
      farmer_location: 'Lomé, Togo',
      status: 'pending',
      subtotal: 15.00,
      delivery_fee: 3.50,
      total_amount: 18.50,
      items_count: 1,
      delivery_name: 'Paul Aho',
      delivery_address: '78 Rue du Commerce, Lomé',
      delivery_phone: '+228 93 45 67 89',
      delivery_email: 'paul.aho@email.com',
      delivery_date: '2024-03-20',
      notes: null,
      tracking_number: null,
      created_at: '2024-03-17T14:20:00Z',
      shipped_at: null,
      delivered_at: null,
      order_items: [
        {
          id: 'item-6',
          product_id: 'prod-6',
          product_name: 'Salade Verte',
          product_image: null,
          quantity: 3,
          unit_price: 5.00,
          total_price: 15.00
        }
      ]
    }
  ]

  console.log('Données de test générées pour le client:', clientId)
  return testOrders
}

// Fonction de test pour les agriculteurs
function getTestFarmerOrders(farmerId) {
  const testFarmerOrders = [
    {
      id: 'farmer-order-1',
      client_id: 'client-1',
      farmer_id: farmerId,
      farmer_name: 'Ma Ferme',
      farmer_phone: '+228 90 12 34 56',
      farmer_location: 'Lomé, Togo',
      status: 'pending',
      subtotal: 35.00,
      delivery_fee: 5.00,
      total_amount: 40.00,
      items_count: 2,
      delivery_name: 'Client Test 1',
      delivery_address: '123 Rue Test, Lomé',
      delivery_phone: '+228 91 23 45 67',
      delivery_email: 'client1@test.com',
      delivery_date: '2024-03-20',
      notes: 'Commande urgente',
      tracking_number: null,
      created_at: '2024-03-18T10:30:00Z',
      shipped_at: null,
      delivered_at: null,
      order_items: [
        {
          id: 'farmer-item-1',
          product_name: 'Légumes Mixes',
          product_image: null,
          quantity: 2,
          unit_price: 15.00,
          total_price: 30.00
        },
        {
          id: 'farmer-item-2',
          product_name: 'Fruits Frais',
          product_image: null,
          quantity: 1,
          unit_price: 5.00,
          total_price: 5.00
        }
      ]
    },
    {
      id: 'farmer-order-2',
      client_id: 'client-2',
      farmer_id: farmerId,
      farmer_name: 'Ma Ferme',
      farmer_phone: '+228 90 12 34 56',
      farmer_location: 'Lomé, Togo',
      status: 'processing',
      subtotal: 25.00,
      delivery_fee: 0.00,
      total_amount: 25.00,
      items_count: 1,
      delivery_name: 'Client Test 2',
      delivery_address: '45 Avenue Test, Kara',
      delivery_phone: '+228 92 34 56 78',
      delivery_email: 'client2@test.com',
      delivery_date: '2024-03-19',
      notes: null,
      tracking_number: null,
      created_at: '2024-03-17T14:20:00Z',
      shipped_at: null,
      delivered_at: null,
      order_items: [
        {
          id: 'farmer-item-3',
          product_name: 'Produits Laitiers',
          product_image: null,
          quantity: 1,
          unit_price: 25.00,
          total_price: 25.00
        }
      ]
    },
    {
      id: 'farmer-order-3',
      client_id: 'client-3',
      farmer_id: farmerId,
      farmer_name: 'Ma Ferme',
      farmer_phone: '+228 90 12 34 56',
      farmer_location: 'Lomé, Togo',
      status: 'shipped',
      subtotal: 60.00,
      delivery_fee: 8.00,
      total_amount: 68.00,
      items_count: 4,
      delivery_name: 'Client Test 3',
      delivery_address: '78 Rue Commerce, Sokodé',
      delivery_phone: '+228 93 45 67 89',
      delivery_email: 'client3@test.com',
      delivery_date: '2024-03-16',
      notes: 'Livraison matin',
      tracking_number: 'FARM987654',
      created_at: '2024-03-15T09:15:00Z',
      shipped_at: '2024-03-16T11:30:00Z',
      delivered_at: null,
      order_items: [
        {
          id: 'farmer-item-4',
          product_name: 'Céréales Bio',
          product_image: null,
          quantity: 2,
          unit_price: 20.00,
          total_price: 40.00
        },
        {
          id: 'farmer-item-5',
          product_name: 'Miel Artisanal',
          product_image: null,
          quantity: 1,
          unit_price: 15.00,
          total_price: 15.00
        },
        {
          id: 'farmer-item-6',
          product_name: 'Confitures Maison',
          product_image: null,
          quantity: 1,
          unit_price: 5.00,
          total_price: 5.00
        }
      ]
    }
  ]

  console.log('Données de test générées pour l\'agriculteur:', farmerId)
  return testFarmerOrders
}
