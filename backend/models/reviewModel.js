import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  date: { type: Number, required: true },
})

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema)
export default reviewModel
