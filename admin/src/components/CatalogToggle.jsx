import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { apiErrorMessage } from '../utils/apiError'

const CatalogToggle = ({ token }) => {
  const [useFakeStore, setUseFakeStore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/catalog-mode`)
        if (response.data.success) {
          setUseFakeStore(Boolean(response.data.useFakeStoreCatalog))
        }
      } catch (error) {
        toast.error(apiErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = async () => {
    const next = !useFakeStore
    setSaving(true)
    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/catalog-mode`,
        { useFakeStoreCatalog: next },
        { headers: { token } }
      )
      if (response.data.success) {
        setUseFakeStore(next)
        toast.success(response.data.message)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-card mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">Storefront catalog source</p>
        <p className="mt-1 text-xs text-slate-500">
          {useFakeStore
            ? 'Visitors see demo products from Fake Store API. Your real catalog is hidden on the website.'
            : 'Visitors see products from your database. Add products in Admin → Add Product.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium ${useFakeStore ? 'text-slate-400' : 'text-slate-800'}`}>
          Your products
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={useFakeStore}
          disabled={loading || saving}
          onClick={handleToggle}
          className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-60 ${
            useFakeStore ? 'bg-teal-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              useFakeStore ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-xs font-medium ${useFakeStore ? 'text-teal-700' : 'text-slate-400'}`}>
          Fake Store API
        </span>
      </div>
    </div>
  )
}

export default CatalogToggle
