import reviewModel from '../models/reviewModel.js'
import productModel from '../models/productModel.js'
import userModel from '../models/userModel.js'
import { fail, ok } from '../utils/http.js'

export async function refreshProductRating(productId) {
  const stats = await reviewModel.aggregate([
    { $match: { productId: String(productId) } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const avg = stats[0]?.avg || 0
  const count = stats[0]?.count || 0
  await productModel.findByIdAndUpdate(productId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  })
}

export const listReviews = async (req, res) => {
  try {
    const productId = req.params.productId
    const reviews = await reviewModel.find({ productId }).sort({ date: -1 }).lean()
    return ok(res, { reviews })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const listAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find().sort({ date: -1 }).limit(100).lean()
    const productIds = [...new Set(reviews.map((r) => r.productId))]
    const products = await productModel.find({ _id: { $in: productIds } }).select('name').lean()
    const nameMap = Object.fromEntries(products.map((p) => [String(p._id), p.name]))
    const enriched = reviews.map((r) => ({
      ...r,
      productName: nameMap[r.productId] || 'Unknown product',
    }))
    return ok(res, { reviews: enriched })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const deleteReview = async (req, res) => {
  try {
    const review = await reviewModel.findByIdAndDelete(req.body.id)
    if (!review) return fail(res, 404, 'Review not found')
    await refreshProductRating(review.productId)
    return ok(res, { message: 'Review deleted' })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body
    const stars = Number(rating)
    if (!productId || !Number.isInteger(stars) || stars < 1 || stars > 5) {
      return fail(res, 400, 'A rating from 1 to 5 is required')
    }

    const product = await productModel.findById(productId)
    if (!product) return fail(res, 404, 'Product not found')

    const user = await userModel.findById(req.userId).select('name')
    const payload = {
      productId: String(productId),
      userId: String(req.userId),
      name: user?.name || 'Customer',
      rating: stars,
      comment: String(comment || '').trim().slice(0, 1000),
      date: Date.now(),
    }

    await reviewModel.findOneAndUpdate(
      { productId: payload.productId, userId: payload.userId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    await refreshProductRating(productId)
    const reviews = await reviewModel.find({ productId }).sort({ date: -1 }).lean()
    return ok(res, { message: 'Review saved', reviews })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}
