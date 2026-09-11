import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    couponCounted: { type: Boolean, default: false },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    stripeSessionId: { type: String },
    razorpayOrderId: { type: String },
    stockReserved: { type: Boolean, default: false },
    returnReason: { type: String, default: '' },
})

orderSchema.index({ userId: 1, date: -1 })
orderSchema.index({ stripeSessionId: 1 })
orderSchema.index({ razorpayOrderId: 1 })

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)
export default orderModel;
