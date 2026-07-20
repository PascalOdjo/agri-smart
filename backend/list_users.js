import { User } from './src/models/index.js'
import { sequelize } from './src/config/database.js'

async function listUsers() {
    try {
        await sequelize.authenticate()
        const users = await User.findAll()
        console.log('Total users:', users.length)
        users.forEach(u => {
            console.log(`- Email: ${u.email} | Role: ${u.role} | Name: ${u.fullName}`)
        })
    } catch (e) {
        console.error(e)
    } finally {
        await sequelize.close()
    }
}

listUsers()
