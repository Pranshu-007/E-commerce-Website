import productModel from '../models/productModel.js'
import { CheckoutError } from '../utils/errors.js'

export function getSizeStock(product, size) {
  if (!product?.stock || product.stock[size] === undefined || product.stock[size] === null) {
    return Number.POSITIVE_INFINITY
  }
  return Math.max(0, Number(product.stock[size]) || 0)
}

export async function decrementStock(items = []) {
  for (const item of items) {
    const product = await productModel.findById(item._id)
    if (!product) continue
    const available = getSizeStock(product, item.size)
    if (!Number.isFinite(available)) continue
    if (available < item.quantity) {
      throw new CheckoutError(`Not enough stock for ${product.name} (${item.size})`)
    }
    product.stock[item.size] = available - item.quantity
    product.markModified('stock')
    await product.save()
  }
}

export async function restoreStock(items = []) {
  for (const item of items) {
    const product = await productModel.findById(item._id)
    if (!product?.stock || product.stock[item.size] === undefined) continue
    product.stock[item.size] = Number(product.stock[item.size] || 0) + Number(item.quantity || 0)
    product.markModified('stock')
    await product.save()
  }
}
