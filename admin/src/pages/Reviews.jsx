import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'

const Reviews = ({ token }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/admin/reviews`, { headers: { token } })
      if (response.data.success) setReviews(response.data.reviews)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/reviews/remove`,
        { id },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        load()
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  useEffect(() => { load() }, [token])

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase()
    return (
      r.name?.toLowerCase().includes(q)
      || r.productName?.toLowerCase().includes(q)
      || r.comment?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <PageHeader
        title="Product Reviews"
        subtitle="Moderate customer reviews across all products"
      />
      <input
        className="admin-input mb-4 max-w-md"
        placeholder="Search by customer, product, or comment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="admin-card divide-y divide-slate-100">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading reviews...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No reviews found.</p>
        ) : (
          filtered.map((review) => (
            <div key={review._id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.productName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {review.rating} ★
                  </span>
                  <button type="button" onClick={() => remove(review._id)} className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(review.date).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews
