import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import { listCoupons, createCoupon, toggleCoupon, validateCoupon } from '../controllers/couponController.js'
import { listReviews, addReview, listAllReviews, deleteReview } from '../controllers/reviewController.js'
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js'
import { subscribe, listSubscribers, removeSubscriber } from '../controllers/newsletterController.js'
import { getDashboard } from '../controllers/dashboardController.js'
import { listCustomers, getInventoryAlerts, getRecentOrders } from '../controllers/adminController.js'
import { getCatalogMode, updateCatalogMode } from '../controllers/storeSettingsController.js'

const shopRouter = express.Router()

shopRouter.post('/newsletter', subscribe)
shopRouter.post('/coupon/validate', validateCoupon)
shopRouter.get('/coupon/list', adminAuth, listCoupons)
shopRouter.post('/coupon/add', adminAuth, createCoupon)
shopRouter.post('/coupon/toggle', adminAuth, toggleCoupon)
shopRouter.get('/review/:productId', listReviews)
shopRouter.post('/review', authUser, addReview)
shopRouter.get('/wishlist', authUser, getWishlist)
shopRouter.post('/wishlist', authUser, toggleWishlist)
shopRouter.get('/catalog-mode', getCatalogMode)
shopRouter.post('/admin/catalog-mode', adminAuth, updateCatalogMode)
shopRouter.get('/dashboard', adminAuth, getDashboard)
shopRouter.get('/admin/subscribers', adminAuth, listSubscribers)
shopRouter.post('/admin/subscribers/remove', adminAuth, removeSubscriber)
shopRouter.get('/admin/reviews', adminAuth, listAllReviews)
shopRouter.post('/admin/reviews/remove', adminAuth, deleteReview)
shopRouter.get('/admin/customers', adminAuth, listCustomers)
shopRouter.get('/admin/inventory', adminAuth, getInventoryAlerts)
shopRouter.get('/admin/orders/recent', adminAuth, getRecentOrders)

export default shopRouter
