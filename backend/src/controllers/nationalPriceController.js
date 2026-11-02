import { NationalPrice } from '../models/index.js'

function toApiPrice(price) {
    const data = price.toJSON()
    return {
        ...data,
        product_name: data.productName,
        product_category: data.productCategory,
        reference_price: data.referencePrice === null ? null : Number(data.referencePrice),
        region: data.region,
        effective_date: data.effectiveDate
    }
}

export async function listNationalPrices(req, res, next) {
    try {
        const where = req.query.status ? { status: req.query.status } : {}
        const prices = await NationalPrice.findAll({ where, order: [['productName', 'ASC']] })
        res.json({ national_prices: prices.map(toApiPrice) })
    } catch (error) {
        next(error)
    }
}

export async function createNationalPrice(req, res, next) {
    try {
        const price = await NationalPrice.create({
            productName: req.body.product_name,
            productCategory: req.body.product_category,
            referencePrice: req.body.reference_price,
            unit: req.body.unit,
            region: req.body.region || null,
            effectiveDate: req.body.effective_date || new Date()
        })
        res.status(201).json({ national_price: toApiPrice(price) })
    } catch (error) {
        next(error)
    }
}

export async function updateNationalPrice(req, res, next) {
    try {
        const price = await NationalPrice.findByPk(req.params.id)
        if (!price) return res.status(404).json({ error: 'Produit national introuvable' })

        await price.update({
            productName: req.body.product_name,
            productCategory: req.body.product_category,
            referencePrice: req.body.reference_price,
            unit: req.body.unit,
            region: req.body.region || null,
            effectiveDate: req.body.effective_date || price.effectiveDate
        })
        res.json({ national_price: toApiPrice(price) })
    } catch (error) {
        next(error)
    }
}

export async function deleteNationalPrice(req, res, next) {
    try {
        const price = await NationalPrice.findByPk(req.params.id)
        if (!price) return res.status(404).json({ error: 'Produit national introuvable' })
        await price.destroy()
        res.json({ message: 'Produit national supprimé' })
    } catch (error) {
        next(error)
    }
}