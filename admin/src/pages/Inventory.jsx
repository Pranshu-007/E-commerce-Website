import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'

const Inventory = ({ token }) => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [threshold, setThreshold] = useState(5)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/admin/inventory`, { headers: { token } })
      if (response.data.success) {
        setProducts(response.data.products)
        setThreshold(response.data.threshold)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  return (
    <div>
      <PageHeader
        title="Inventory Alerts"
        subtitle={`Products with ${threshold} or fewer units in any size`}
      />
      {loading ? (
        <p className="text-sm text-slate-500">Loading inventory...</p>
      ) : products.length === 0 ? (
        <div className="admin-card p-8 text-center text-sm text-slate-500">
          All products are well stocked.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product._id} className="admin-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              {product.image && (
                <img src={product.image} alt="" className="h-16 w-16 rounded-lg object-cover bg-slate-100" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{product.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Total stock: {product.totalStock} units
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.lowSizes.map(({ size, qty }) => (
                    <span
                      key={size}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        qty === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {size}: {qty} left
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/edit/${product._id}`)}
                className="admin-btn-secondary shrink-0"
              >
                Update Stock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Inventory
