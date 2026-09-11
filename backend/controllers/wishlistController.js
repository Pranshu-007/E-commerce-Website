import userModel from '../models/userModel.js'
import productModel from '../models/productModel.js'
import { fail, ok } from '../utils/http.js'

export const getWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('wishlist')
    if (!user) return fail(res, 404, 'User not found')
    const products = await productModel
      .find({ _id: { $in: user.wishlist || [] } })
      .select('name price image category ratingAvg ratingCount')
      .lean()
    return ok(res, { wishlist: user.wishlist || [], products })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body
    if (!productId) return fail(res, 400, 'Product id is required')

    const user = await userModel.findById(req.userId)
    if (!user) return fail(res, 404, 'User not found')

    const list = user.wishlist || []
    const exists = list.includes(productId)
    user.wishlist = exists ? list.filter((id) => id !== productId) : [...list, productId]
    await user.save()
    return ok(res, {
      wishlist: user.wishlist,
      added: !exists,
      message: exists ? 'Removed from wishlist' : 'Added to wishlist',
    })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}
