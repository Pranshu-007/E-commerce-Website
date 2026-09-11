import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import * as cache from "../services/cache.js"
import { getUseFakeStoreCatalog } from "../services/catalogSettings.js"
import { getFakeProductById, listFakeProducts } from "../services/fakeStore.js"
import { fail, ok } from "../utils/http.js"

const LIST_PROJECTION = "name price image category subCategory bestseller date stock ratingAvg ratingCount"
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
    case "top-rated":
      return { ratingAvg: -1, ratingCount: -1 }
    default:
      return { date: -1 }
  }
}

function parseStock(sizes, rawStock) {
    const stock = {}
    let parsed = {}
    try {
        parsed = typeof rawStock === 'string' ? JSON.parse(rawStock || '{}') : (rawStock || {})
    } catch {
        parsed = {}
    }
    for (const size of sizes) {
        const n = Number(parsed[size])
        stock[size] = Number.isFinite(n) && n >= 0 ? n : 0
    }
    return stock
}

const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files?.image1?.[0]
        const image2 = req.files?.image2?.[0]
        const image3 = req.files?.image3?.[0]
        const image4 = req.files?.image4?.[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        if (!name || !description || !price || !category || !subCategory || !sizes) {
            return fail(res, 400, "Missing product fields")
        }
        if (images.length === 0) {
            return fail(res, 400, "At least one product image is required")
        }
        if (Number.isNaN(Number(price)) || Number(price) <= 0) {
            return fail(res, 400, "Invalid product price")
        }

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
            stock: parseStock(JSON.parse(sizes), req.body.stock),
            image: imagesUrl,
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save()
        await cache.invalidateProductCache()

        return ok(res, { message: "Product Added" }, 201)

    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const listProducts = async (req, res) => {
    try {
        const query = parseListQuery(req)
        const forceLocal = req.query.catalog === 'local'
        const useFakeStore = !forceLocal && await getUseFakeStoreCatalog()

        if (useFakeStore) {
            const result = await listFakeProducts(query)
            return res.json({
                success: true,
                products: result.products,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: result.totalPages,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
                catalogSource: 'fakestore',
                demoCatalog: true,
            })
        }

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
            catalogSource: 'local',
            demoCatalog: false,
        }

        await cache.set(cacheKey, payload, 60)
        res.set('X-Cache', 'MISS')
        res.set('Cache-Control', 'public, max-age=60')
        return res.json(payload)

    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const removeProduct = async (req, res) => {
    try {
        if (!req.body.id) {
            return fail(res, 400, "Product id is required")
        }

        const deleted = await productModel.findByIdAndDelete(req.body.id)
        if (!deleted) {
            return fail(res, 404, "Product not found")
        }

        await cache.invalidateProductCache()
        return ok(res, { message: "Product Removed" })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body
        if (!id) return fail(res, 400, "Product id is required")

        const product = await productModel.findById(id)
        if (!product) return fail(res, 404, "Product not found")

        const parsedSizes = sizes ? JSON.parse(sizes) : product.sizes
        const image1 = req.files?.image1?.[0]
        const image2 = req.files?.image2?.[0]
        const image3 = req.files?.image3?.[0]
        const image4 = req.files?.image4?.[0]
        const newFiles = [image1, image2, image3, image4].filter(Boolean)

        let image = product.image
        if (newFiles.length > 0) {
            const uploaded = await Promise.all(
                newFiles.map(async (item) => {
                    const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' })
                    return result.secure_url
                })
            )
            image = uploaded
        }

        product.name = name || product.name
        product.description = description || product.description
        product.price = price ? Number(price) : product.price
        product.category = category || product.category
        product.subCategory = subCategory || product.subCategory
        product.sizes = parsedSizes
        product.bestseller = String(bestseller) === 'true'
        product.stock = parseStock(parsedSizes, req.body.stock)
        product.image = image
        await product.save()
        await cache.invalidateProductCache()
        return ok(res, { message: "Product Updated", product })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        if (!productId) {
            return fail(res, 400, "Product id is required")
        }

        const forceLocal = req.query.catalog === 'local'
        const useFakeStore = !forceLocal && await getUseFakeStoreCatalog()

        if (useFakeStore) {
            const product = await getFakeProductById(productId)
            if (!product) {
                return fail(res, 404, "Product not found")
            }
            return ok(res, { product, catalogSource: 'fakestore', demoCatalog: true })
        }

        const cacheKey = `products:single:${productId}`
        const cached = await cache.get(cacheKey)
        if (cached) {
            res.set('X-Cache', 'HIT')
            res.set('Cache-Control', 'public, max-age=60')
            return res.json(cached)
        }

        const product = await productModel.findById(productId).lean()
        if (!product) {
            return fail(res, 404, "Product not found")
        }

        const payload = { success: true, product, catalogSource: 'local', demoCatalog: false }
        await cache.set(cacheKey, payload, 120)
        res.set('X-Cache', 'MISS')
        res.set('Cache-Control', 'public, max-age=120')
        return res.json(payload)

    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }
