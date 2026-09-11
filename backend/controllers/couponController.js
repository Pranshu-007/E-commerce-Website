import couponModel from '../models/couponModel.js'
import { fail, ok } from '../utils/http.js'
import { applyCoupon, CheckoutError } from '../services/checkout.js'

export const listCoupons = async (_req, res) => {
  try {
    const coupons = await couponModel.find({}).sort({ code: 1 }).lean()
    return ok(res, { coupons })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const createCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase()
    const type = req.body.type === 'fixed' ? 'fixed' : 'percent'
    const value = Number(req.body.value)
    const minAmount = Number(req.body.minAmount) || 0
    const maxUses = Number(req.body.maxUses) || 0
    const expiresAt = req.body.expiresAt ? Number(new Date(req.body.expiresAt).getTime()) : 0

    if (!code || !Number.isFinite(value) || value <= 0) {
      return fail(res, 400, 'Valid code and value are required')
    }
    if (type === 'percent' && value > 100) {
      return fail(res, 400, 'Percent discount cannot exceed 100')
    }

    const coupon = await couponModel.create({
      code, type, value, minAmount, maxUses, expiresAt, active: true,
    })
    return ok(res, { coupon, message: 'Coupon created' }, 201)
  } catch (error) {
    if (error.code === 11000) {
      return fail(res, 409, 'Coupon code already exists')
    }
    return fail(res, 500, error.message)
  }
}

export const toggleCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.findById(req.body.id)
    if (!coupon) return fail(res, 404, 'Coupon not found')
    coupon.active = !coupon.active
    await coupon.save()
    return ok(res, { coupon, message: 'Coupon updated' })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const validateCoupon = async (req, res) => {
  try {
    const amount = Number(req.body.amount) || 0
    const result = await applyCoupon(req.body.code, amount)
    return ok(res, result)
  } catch (error) {
    if (error instanceof CheckoutError) {
      return fail(res, error.status, error.message)
    }
    return fail(res, 500, error.message)
  }
}
