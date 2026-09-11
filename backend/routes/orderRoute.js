import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay, cancelOrder, requestReturn} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import { checkoutLimiter } from '../middleware/rateLimiter.js'

const orderRouter = express.Router()

orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

orderRouter.post('/place',checkoutLimiter,authUser,placeOrder)
orderRouter.post('/stripe',checkoutLimiter,authUser,placeOrderStripe)
orderRouter.post('/razorpay',checkoutLimiter,authUser,placeOrderRazorpay)

orderRouter.post('/userorders',authUser,userOrders)
orderRouter.post('/cancel',authUser,cancelOrder)
orderRouter.post('/return',authUser,requestReturn)

orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyRazorpay',authUser, verifyRazorpay)

export default orderRouter
