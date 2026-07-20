import { User } from './src/models/index.js'
import { sequelize } from './src/config/database.js'
import bcrypt from 'bcryptjs'

async function resetPasswords() {
    try {
        await sequelize.authenticate()
        const salt = await bcrypt.genSalt(10)
        const newHash = await bcrypt.hash('password123', salt)

        await User.update({ passwordHash: newHash }, {
            where: {
                role: 'farmer'
            }
        })
        console.log('Les mots de passe des agriculteurs ont été réinitialisés à : password123')
    } catch (e) {
        console.error(e)
    } finally {
        await sequelize.close()
    }
}

resetPasswords()
