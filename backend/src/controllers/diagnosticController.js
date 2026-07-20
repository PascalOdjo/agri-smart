import { handleAsync, AppError } from '../utils/errors.js'
import { Diagnostic, User } from '../models/index.js'

export const saveDiagnostic = handleAsync(async (req, res) => {
    const { imageUrl, diseaseName, severity, solution, ecoAlternative } = req.body

    const diagnostic = await Diagnostic.create({
        userId: req.user.id,
        imageUrl,
        diseaseName,
        severity,
        solution,
        ecoAlternative
    })

    res.status(201).json({
        success: true,
        message: 'Diagnostic saved',
        diagnostic
    })
})

export const getUserDiagnostics = handleAsync(async (req, res) => {
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id }
    const diagnostics = await Diagnostic.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }]
    })

    res.status(200).json({
        success: true,
        diagnostics
    })
})

export const getDiagnosticById = handleAsync(async (req, res) => {
    const { id } = req.params
    const diagnostic = await Diagnostic.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }]
    })

    if (!diagnostic) {
        throw new AppError('Diagnostic not found', 404)
    }

    if (diagnostic.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized to view this diagnostic', 403)
    }

    res.status(200).json({
        success: true,
        diagnostic
    })
})
