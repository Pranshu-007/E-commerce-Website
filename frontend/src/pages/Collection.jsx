import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import AnimatedIcon from '../components/AnimatedIcon'
import ProductItem from '../components/ProductItem'

const Collection = () => {
  const { search, showSearch, fetchProducts } = useContext(ShopContext)
  const [showFilter, setShowFilter] = useState(false)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false })
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState([])
  const [subCategory, setSubCategory] = useState([])
  const [sortType, setSortType] = useState('relevant')
  const [page, setPage] = useState(1)

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value))
    } else {
      setCategory((prev) => [...prev, e.target.value])
    }
    setPage(1)
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value))
    } else {
      setSubCategory((prev) => [...prev, e.target.value])
    }
    setPage(1)
  }

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const params = { page, limit: 12, sort: sortType }
        if (category.length > 0) params.category = category.join(',')
        if (subCategory.length > 0) params.subCategory = subCategory.join(',')
        if (showSearch && search) params.search = search

        const data = await fetchProducts(params)
        setProducts(data.products)
        setPagination(data.pagination)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [category, subCategory, search, showSearch, sortType, page, fetchProducts])

  const FilterCheckbox = ({ value, label, checked, onChange }) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-brand-700 transition-colors hover:bg-brand-50">
      <input
        className="h-4 w-4 rounded border-brand-300 text-brand-900 focus:ring-brand-500"
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  )

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <aside className="lg:w-64 shrink-0">
        <button
          type="button"
          onClick={() => setShowFilter(!showFilter)}
          className="mb-4 flex w-full items-center justify-between rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-medium sm:hidden"
        >
          Filters
          <AnimatedIcon name="dropdown" size="xs" reverse={showFilter} strokeColor="#57534e" />
        </button>

        <div className={`space-y-4 ${showFilter ? 'block' : 'hidden'} sm:block`}>
          <div className="filter-panel">
            <p className="eyebrow mb-3">Categories</p>
            <div className="flex flex-col">
              <FilterCheckbox value="Men" label="Men" checked={category.includes('Men')} onChange={toggleCategory} />
              <FilterCheckbox value="Women" label="Women" checked={category.includes('Women')} onChange={toggleCategory} />
              <FilterCheckbox value="Kids" label="Kids" checked={category.includes('Kids')} onChange={toggleCategory} />
            </div>
          </div>

          <div className="filter-panel">
            <p className="eyebrow mb-3">Type</p>
            <div className="flex flex-col">
              <FilterCheckbox value="Topwear" label="Topwear" checked={subCategory.includes('Topwear')} onChange={toggleSubCategory} />
              <FilterCheckbox value="Bottomwear" label="Bottomwear" checked={subCategory.includes('Bottomwear')} onChange={toggleSubCategory} />
              <FilterCheckbox value="Winterwear" label="Winterwear" checked={subCategory.includes('Winterwear')} onChange={toggleSubCategory} />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Title
            text1="All"
            text2="Collections"
            align="left"
            className="!mb-0"
            subtitle={pagination.total ? `${pagination.total} products` : undefined}
          />
          <select
            onChange={(e) => { setSortType(e.target.value); setPage(1) }}
            value={sortType}
            className="select-field w-full sm:w-auto"
          >
            <option value="relevant">Sort: Relevant</option>
            <option value="low-high">Sort: Price Low to High</option>
            <option value="high-low">Sort: Price High to Low</option>
            <option value="top-rated">Sort: Top Rated</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[3/4] bg-brand-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-brand-100 rounded" />
                  <div className="h-4 w-1/2 bg-brand-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <p className="font-medium text-brand-800">No products found</p>
            <p className="mt-2 text-sm text-brand-500">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {products.map((item) => (
              <ProductItem
                key={item._id}
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.image}
                category={item.category}
                bestseller={item.bestseller}
                ratingAvg={item.ratingAvg}
                ratingCount={item.ratingCount}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev}
              className="btn-secondary !px-5 !py-2 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-brand-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="btn-secondary !px-5 !py-2 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection
