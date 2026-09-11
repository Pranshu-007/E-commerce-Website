import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'

const List = ({ token }) => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNext: false, hasPrev: false })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchList = async (page = 1, q = search) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: '20', catalog: 'local' })
      if (q.trim()) params.set('search', q.trim())
      const response = await axios.get(`${backendUrl}/api/product/list?${params}`)
      if (response.data.success) {
        setList(response.data.products)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return
    try {
      const response = await axios.post(`${backendUrl}/api/product/remove`, { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList(pagination.page)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  useEffect(() => { fetchList() }, [])

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your catalog"
        action={
          <button type="button" onClick={() => navigate('/add')} className="admin-btn">
            + Add Product
          </button>
        }
      />

      <input
        className="admin-input mb-4 max-w-md"
        placeholder="Search products by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && fetchList(1, search)}
      />
      <button type="button" onClick={() => fetchList(1, search)} className="admin-btn-secondary mb-4 ml-0 sm:ml-2">
        Search
      </button>

      <div className="admin-card overflow-hidden">
        <div className="admin-table-head">
          <span>Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span className="text-center">Actions</span>
        </div>

        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading products...</p>
        ) : list.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No products found.</p>
        ) : (
          list.map((item) => (
            <div className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 border-t border-slate-100 px-3 py-3 text-sm" key={item._id}>
              <img className="h-12 w-12 rounded-lg object-cover" src={item.image[0]} alt="" />
              <p className="font-medium text-slate-800">{item.name}</p>
              <p className="hidden md:block text-slate-600">{item.category}</p>
              <p className="hidden md:block">{currency}{item.price}</p>
              <p className="text-right md:text-center">
                <button onClick={() => navigate(`/edit/${item._id}`)} className="text-slate-700 underline mr-3">Edit</button>
                <button onClick={() => removeProduct(item._id)} className="text-red-600 hover:underline">Delete</button>
              </p>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center gap-4">
          <button onClick={() => fetchList(pagination.page - 1)} disabled={!pagination.hasPrev} className="admin-btn-secondary !py-2 disabled:opacity-40">Previous</button>
          <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => fetchList(pagination.page + 1)} disabled={!pagination.hasNext} className="admin-btn-secondary !py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}

export default List
