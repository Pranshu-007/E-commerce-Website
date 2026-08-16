import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import * as cache from "../services/cache.js"

const LIST_PROJECTION = "name price image category subCategory bestseller date"
const MAX_LIMIT = 50

function buildListCacheKey(query) {
  return `products:list:${JSON.stringify(query)}`
}

function parseListQuery(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 12))
  const search = (req.query.search || "").trim()
  const sort = req.query.sort || "relevant"
  const bestseller = req.query.bestseller === "true"

  const category = req.query.category
    ? req.query.category.split(",").map((c) => c.trim()).filter(Boolean)
    : []

  const subCategory = req.query.subCategory
    ? req.query.subCategory.split(",").map((c) => c.trim()).filter(Boolean)
    : []

  const ids = req.query.ids
    ? req.query.ids.split(",").map((id) => id.trim()).filter(Boolean)
    : []

  return { page, limit, search, sort, bestseller, category, subCategory, ids }
}

function buildFilter({ search, bestseller, category, subCategory, ids }) {
  const filter = {}

  if (ids.length > 0) {
    filter._id = { $in: ids }
    return filter
  }

  if (category.length > 0) filter.category = { $in: category }
  if (subCategory.length > 0) filter.subCategory = { $in: subCategory }
  if (bestseller) filter.bestseller = true

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ]
  }

  return filter
}

function buildSort(sort) {
  switch (sort) {
    case "low-high":
      return { price: 1 }
    case "high-low":
      return { price: -1 }
    default:
      return { date: -1 }
  }
}

const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save()
        await cache.invalidateProductCache()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const listProducts = async (req, res) => {
    try {
        const query = parseListQuery(req)
        const cacheKey = buildListCacheKey(query)
        const cached = await cache.get(cacheKey)

        if (cached) {
            res.set('X-Cache', 'HIT')
            res.set('Cache-Control', 'public, max-age=60')
            return res.json(cached)
        }

        const filter = buildFilter(query)
        const sort = buildSort(query.sort)

        let products
        let total

        if (query.ids.length > 0) {
            products = await productModel
                .find(filter)
                .select(LIST_PROJECTION)
                .sort(sort)
                .lean()
            total = products.length
        } else {
            const skip = (query.page - 1) * query.limit
            ;[products, total] = await Promise.all([
                productModel
                    .find(filter)
                    .select(LIST_PROJECTION)
                    .sort(sort)
                    .skip(skip)
                    .limit(query.limit)
                    .lean(),
                productModel.countDocuments(filter),
            ])
        }

        const totalPages = query.ids.length > 0 ? 1 : Math.ceil(total / query.limit)

        const payload = {
            success: true,
            products,
            pagination: {
                page: query.ids.length > 0 ? 1 : query.page,
                limit: query.ids.length > 0 ? total : query.limit,
                total,
                totalPages,
                hasNext: query.page < totalPages,
                hasPrev: query.page > 1,
            },
        }

        await cache.set(cacheKey, payload, 60)
        res.set('X-Cache', 'MISS')
        res.set('Cache-Control', 'public, max-age=60')
        res.json(payload)

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        await cache.invalidateProductCache()
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const cacheKey = `products:single:${productId}`
        const cached = await cache.get(cacheKey)
        if (cached) {
            res.set('X-Cache', 'HIT')
            res.set('Cache-Control', 'public, max-age=60')
            return res.json(cached)
        }

        const product = await productModel.findById(productId).lean()
        const payload = { success: true, product }
        await cache.set(cacheKey, payload, 120)
        res.set('X-Cache', 'MISS')
        res.set('Cache-Control', 'public, max-age=120')
        res.json(payload)

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct }
