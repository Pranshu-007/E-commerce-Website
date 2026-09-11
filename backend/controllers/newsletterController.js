import validator from 'validator'
import subscriberModel from '../models/subscriberModel.js'
import { fail, ok } from '../utils/http.js'

export const listSubscribers = async (_req, res) => {
  try {
    const [subscribers, total] = await Promise.all([
      subscriberModel.find().sort({ date: -1 }).limit(100).lean(),
      subscriberModel.countDocuments(),
    ])
    return ok(res, { subscribers, total })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const removeSubscriber = async (req, res) => {
  try {
    const deleted = await subscriberModel.findByIdAndDelete(req.body.id)
    if (!deleted) return fail(res, 404, 'Subscriber not found')
    return ok(res, { message: 'Subscriber removed' })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!validator.isEmail(email)) {
      return fail(res, 400, 'Please enter a valid email')
    }

    await subscriberModel.updateOne(
      { email },
      { $setOnInsert: { email, date: Date.now() } },
      { upsert: true }
    )
    return ok(res, { message: 'Subscribed successfully' })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}
