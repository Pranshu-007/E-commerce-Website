import orderModel from '../models/orderModel.js'
import productModel from '../models/productModel.js'
import userModel from '../models/userModel.js'
import { fail, ok } from '../utils/http.js'

const LOW_STOCK_THRESHOLD = 5

export const listCustomers = async (_req, res) => {
  try {
    const [users, total] = await Promise.all([
      userModel.find().select('name email').sort({ _id: -1 }).limit(100).lean(),
      userModel.countDocuments(),
    ])
    return ok(res, { users, total })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const getInventoryAlerts = async (_req, res) => {
  try {
    const products = await productModel.find().select('name image stock sizes').lean()
    const alerts = products
      .map((product) => {
        const stock = product.stock || {}
        const lowSizes = Object.entries(stock)
          .filter(([, qty]) => Number(qty) <= LOW_STOCK_THRESHOLD)
          .map(([size, qty]) => ({ size, qty: Number(qty) }))
        const totalStock = Object.values(stock).reduce((sum, qty) => sum + Number(qty || 0), 0)
        return {
          _id: product._id,
          name: product.name,
          image: product.image?.[0],
          totalStock,
          lowSizes,
        }
      })
      .filter((p) => p.lowSizes.length > 0 || p.totalStock === 0)
      .sort((a, b) => a.totalStock - b.totalStock)

    return ok(res, { products: alerts, threshold: LOW_STOCK_THRESHOLD })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const getRecentOrders = async (_req, res) => {
  try {
    const orders = await orderModel
      .find()
      .sort({ date: -1 })
      .limit(8)
      .select('amount status date payment address.firstName address.lastName items')
      .lean()
    return ok(res, { orders })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}
