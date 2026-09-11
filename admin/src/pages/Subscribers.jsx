import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'

const Subscribers = ({ token }) => {
  const [subscribers, setSubscribers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/admin/subscribers`, { headers: { token } })
      if (response.data.success) {
        setSubscribers(response.data.subscribers)
        setTotal(response.data.total)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return
    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/subscribers/remove`,
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

  return (
    <div>
      <PageHeader
        title="Newsletter Subscribers"
        subtitle={`${total} total email subscribers`}
      />
      <div className="admin-card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading subscribers...</p>
        ) : subscribers.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No subscribers yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {subscribers.map((sub) => (
              <div key={sub._id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{sub.email}</p>
                  <p className="text-xs text-slate-500">
                    Joined {new Date(sub.date).toLocaleDateString()}
                  </p>
                </div>
                <button type="button" onClick={() => remove(sub._id)} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Subscribers
