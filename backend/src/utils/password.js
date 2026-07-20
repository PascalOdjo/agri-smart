import bcrypt from 'bcryptjs'

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}

export const generateResetToken = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
}
