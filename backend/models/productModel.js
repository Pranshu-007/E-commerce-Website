import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    stock: { type: Object, default: {} },
    bestseller: { type: Boolean },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    date: { type: Number, required: true }
}, { minimize: false })

productSchema.index({ category: 1, price: 1 })
productSchema.index({ bestseller: 1 })
productSchema.index({ name: 'text', description: 'text' })

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel
