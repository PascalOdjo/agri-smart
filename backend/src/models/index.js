import User from './User.js'
import Product from './Product.js'
import Order from './Order.js'
import Diagnostic from './Diagnostic.js'
import Farm from './Farm.js'
import PasswordReset from './PasswordReset.js'
import Crop from './Crop.js'
import Notification from './Notification.js'
import NationalPrice from './NationalPrice.js'

// User associations
User.hasMany(Product, { foreignKey: 'farmerId', as: 'products' })
Product.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' })

User.hasMany(Order, { foreignKey: 'clientId', as: 'clientOrders' })
Order.belongsTo(User, { foreignKey: 'clientId', as: 'client' })

User.hasMany(Order, { foreignKey: 'farmerId', as: 'farmerOrders' })
Order.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' })

User.hasMany(Diagnostic, { foreignKey: 'userId', as: 'diagnostics' })
Diagnostic.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasOne(Farm, { foreignKey: 'userId', as: 'farm' })
Farm.belongsTo(User, { foreignKey: 'userId', as: 'owner' })

User.hasMany(Crop, { foreignKey: 'userId', as: 'crops' })
Crop.belongsTo(User, { foreignKey: 'userId', as: 'owner' })
Farm.hasMany(Crop, { foreignKey: 'farmId', as: 'crops' })
Crop.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' })

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' })
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Crop.hasMany(Notification, { foreignKey: 'cropId', as: 'notifications' })
Notification.belongsTo(Crop, { foreignKey: 'cropId', as: 'crop' })

Product.hasMany(Order, { foreignKey: 'productId', as: 'orders' })
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

User.hasMany(PasswordReset, { foreignKey: 'userId', as: 'passwordResets' })
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export {
    User,
    Product,
    Order,
    Diagnostic,
    Farm,
    PasswordReset,
    Crop,
    Notification,
    NationalPrice
}
