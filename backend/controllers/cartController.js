import mongoose from "mongoose"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"
import { fail, ok } from "../utils/http.js"

const addToCart = async (req, res) => {
    try {
        const { itemId, size } = req.body
        const userId = req.userId

        if (!itemId || !mongoose.Types.ObjectId.isValid(itemId) || !size) {
            return fail(res, 400, "Invalid cart item")
        }

        const product = await productModel.findById(itemId).lean()
        if (!product) {
            return fail(res, 404, "Product not found")
        }

        const sizes = (product.sizes || []).map(String)
        if (!sizes.includes(String(size))) {
            return fail(res, 400, "Selected size is not available")
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return fail(res, 404, "User not found")
        }

        const cartData = userData.cartData || {}

        if (cartData[itemId]) {
            cartData[itemId][size] = (cartData[itemId][size] || 0) + 1
        } else {
            cartData[itemId] = { [size]: 1 }
        }

        await userModel.findByIdAndUpdate(userId, { cartData })
        return ok(res, { message: "Added To Cart" })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const updateCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body
        const userId = req.userId
        const qty = Number(quantity)

        if (!itemId || !size || !Number.isInteger(qty) || qty < 0 || qty > 99) {
            return fail(res, 400, "Invalid cart update")
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return fail(res, 404, "User not found")
        }

        const cartData = userData.cartData || {}
        if (!cartData[itemId]) {
            cartData[itemId] = {}
        }

        if (qty === 0) {
            delete cartData[itemId][size]
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId]
            }
        } else {
            cartData[itemId][size] = qty
        }

        await userModel.findByIdAndUpdate(userId, { cartData })
        return ok(res, { message: "Cart Updated" })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const getUserCart = async (req, res) => {
    try {
        const userData = await userModel.findById(req.userId)
        if (!userData) {
            return fail(res, 404, "User not found")
        }

        return ok(res, { cartData: userData.cartData || {} })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const mergeCart = async (req, res) => {
    try {
        const incoming = req.body.cartData || {}
        const userData = await userModel.findById(req.userId)
        if (!userData) {
            return fail(res, 404, "User not found")
        }

        const cartData = userData.cartData || {}
        for (const itemId of Object.keys(incoming)) {
            if (!incoming[itemId] || typeof incoming[itemId] !== 'object') continue
            if (!cartData[itemId]) cartData[itemId] = {}
            for (const size of Object.keys(incoming[itemId])) {
                const qty = Number(incoming[itemId][size])
                if (!Number.isInteger(qty) || qty < 1) continue
                cartData[itemId][size] = (cartData[itemId][size] || 0) + qty
            }
        }

        await userModel.findByIdAndUpdate(req.userId, { cartData })
        return ok(res, { cartData, message: "Cart merged" })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

export { addToCart, updateCart, getUserCart, mergeCart }
