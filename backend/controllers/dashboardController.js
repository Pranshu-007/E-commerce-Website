import orderModel from '../models/orderModel.js'
import productModel from '../models/productModel.js'
import userModel from '../models/userModel.js'
import subscriberModel from '../models/subscriberModel.js'
import { fail, ok } from '../utils/http.js'

const LOW_STOCK_THRESHOLD = 5
const CATEGORIES = ['Men', 'Women', 'Kids']
const SUB_CATEGORIES = ['Topwear', 'Bottomwear', 'Winterwear']

function buildCategoryAnalytics(salesRows, productRows) {
  const salesMap = {}
  for (const row of salesRows) {
    const cat = row._id?.category || 'Other'
    const sub = row._id?.subCategory || 'Other'
    if (!salesMap[cat]) salesMap[cat] = {}
    salesMap[cat][sub] = {
      revenue: row.revenue || 0,
      unitsSold: row.unitsSold || 0,
    }
  }

  const productMap = {}
  for (const row of productRows) {
    const cat = row._id?.category || 'Other'
    const sub = row._id?.subCategory || 'Other'
    if (!productMap[cat]) productMap[cat] = {}
    productMap[cat][sub] = row.productCount || 0
  }

  const categoryNames = [...new Set([
    ...CATEGORIES,
    ...Object.keys(salesMap),
    ...Object.keys(productMap),
  ])]

  return categoryNames.map((category) => {
    const subNames = [...new Set([
      ...SUB_CATEGORIES,
      ...Object.keys(salesMap[category] || {}),
      ...Object.keys(productMap[category] || {}),
    ])]

    const subCategories = subNames.map((name) => ({
      name,
      productCount: productMap[category]?.[name] || 0,
      revenue: salesMap[category]?.[name]?.revenue || 0,
      unitsSold: salesMap[category]?.[name]?.unitsSold || 0,
    }))

    return {
      name: category,
      productCount: subCategories.reduce((sum, item) => sum + item.productCount, 0),
      revenue: subCategories.reduce((sum, item) => sum + item.revenue, 0),
      unitsSold: subCategories.reduce((sum, item) => sum + item.unitsSold, 0),
      subCategories,
    }
  }).sort((a, b) => {
    const aIndex = CATEGORIES.indexOf(a.name)
    const bIndex = CATEGORIES.indexOf(b.name)
    if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}

export const getDashboard = async (_req, res) => {
  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [totals] = await orderModel.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Pending Payment'] } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      },
    ])

    const todayOrders = await orderModel.countDocuments({
      date: { $gte: startOfDay.getTime() },
      status: { $nin: ['Cancelled'] },
    })

    const topProducts = await orderModel.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Pending Payment'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ])

    const productCount = await productModel.countDocuments()
    const userCount = await userModel.countDocuments()
    const subscriberCount = await subscriberModel.countDocuments()
    const pendingPayment = await orderModel.countDocuments({ payment: false, status: { $ne: 'Cancelled' } })

    const allProducts = await productModel.find().select('stock').lean()
    const lowStockCount = allProducts.filter((p) => {
      const stock = p.stock || {}
      const values = Object.values(stock)
      if (!values.length) return true
      return values.some((qty) => Number(qty) <= LOW_STOCK_THRESHOLD)
    }).length

    const [salesByCategory, productsByCategory] = await Promise.all([
      orderModel.aggregate([
        { $match: { status: { $nin: ['Cancelled', 'Pending Payment'] } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: {
              category: '$items.category',
              subCategory: '$items.subCategory',
            },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            unitsSold: { $sum: '$items.quantity' },
          },
        },
      ]),
      productModel.aggregate([
        {
          $group: {
            _id: {
              category: '$category',
              subCategory: '$subCategory',
            },
            productCount: { $sum: 1 },
          },
        },
      ]),
    ])

    const categoryAnalytics = buildCategoryAnalytics(salesByCategory, productsByCategory)

    return ok(res, {
      stats: {
        revenue: totals?.revenue || 0,
        orders: totals?.orders || 0,
        todayOrders,
        productCount,
        userCount,
        subscriberCount,
        pendingPayment,
        lowStockCount,
        topProducts,
        categoryAnalytics,
      },
    })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}
