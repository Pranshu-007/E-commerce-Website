const FAKE_STORE_URL = 'https://fakestoreapi.com/products'
const CACHE_TTL_MS = 5 * 60 * 1000
const SIZES = ['S', 'M', 'L', 'XL']

const CATEGORY_MAP = {
  "men's clothing": { category: 'Men', subCategory: 'Topwear' },
  "women's clothing": { category: 'Women', subCategory: 'Topwear' },
  jewelry: { category: 'Women', subCategory: 'Winterwear' },
  electronics: { category: 'Kids', subCategory: 'Bottomwear' },
}

let cachedProducts = null
let cacheTime = 0

export function isDemoProductId(id) {
  return String(id || '').startsWith('fake-')
}

function transformProduct(item) {
  const mapped = CATEGORY_MAP[item.category] || { category: 'Kids', subCategory: 'Topwear' }
  const stock = {}
  for (const size of SIZES) {
    stock[size] = 25
  }

  return {
    _id: `fake-${item.id}`,
    name: item.title,
    description: item.description,
    price: Math.round(item.price),
    image: [item.image],
    category: mapped.category,
    subCategory: mapped.subCategory,
    sizes: SIZES,
    stock,
    bestseller: (item.rating?.rate || 0) >= 4.5,
    ratingAvg: item.rating?.rate || 0,
    ratingCount: item.rating?.count || 0,
    date: Date.now() - item.id * 100000,
    demoProduct: true,
  }
}

export async function fetchFakeProducts() {
  if (cachedProducts && Date.now() - cacheTime < CACHE_TTL_MS) {
    return cachedProducts
  }

  const response = await fetch(FAKE_STORE_URL)
  if (!response.ok) {
    throw new Error('Failed to fetch demo products from Fake Store API')
  }

  const data = await response.json()
  cachedProducts = data.map(transformProduct)
  cacheTime = Date.now()
  return cachedProducts
}

export function clearFakeStoreCache() {
  cachedProducts = null
  cacheTime = 0
}

function sortProducts(products, sort) {
  const list = [...products]
  switch (sort) {
    case 'low-high':
      return list.sort((a, b) => a.price - b.price)
    case 'high-low':
      return list.sort((a, b) => b.price - a.price)
    case 'top-rated':
      return list.sort((a, b) => (b.ratingAvg - a.ratingAvg) || (b.ratingCount - a.ratingCount))
    default:
      return list.sort((a, b) => b.date - a.date)
  }
}

export async function listFakeProducts(query) {
  const all = await fetchFakeProducts()
  let filtered = all

  if (query.ids.length > 0) {
    const idSet = new Set(query.ids.map((id) => (String(id).startsWith('fake-') ? id : `fake-${id}`)))
    filtered = all.filter((product) => idSet.has(product._id))
  } else {
    if (query.category.length > 0) {
      filtered = filtered.filter((product) => query.category.includes(product.category))
    }
    if (query.subCategory.length > 0) {
      filtered = filtered.filter((product) => query.subCategory.includes(product.subCategory))
    }
    if (query.bestseller) {
      filtered = filtered.filter((product) => product.bestseller)
    }
    if (query.search) {
      const term = query.search.toLowerCase()
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(term)
        || product.description.toLowerCase().includes(term)
      )
    }
  }

  const sorted = sortProducts(filtered, query.sort)
  const total = sorted.length

  if (query.ids.length > 0) {
    return { products: sorted, total, page: 1, limit: total, totalPages: 1 }
  }

  const page = query.page
  const limit = query.limit
  const skip = (page - 1) * limit
  const products = sorted.slice(skip, skip + limit)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    products,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export async function getFakeProductById(productId) {
  const id = String(productId).startsWith('fake-') ? String(productId) : `fake-${productId}`
  const all = await fetchFakeProducts()
  return all.find((product) => product._id === id) || null
}
