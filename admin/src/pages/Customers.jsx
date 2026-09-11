import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'

const Customers = ({ token }) => {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/customers`, { headers: { token } })
      if (response.data.success) {
        setUsers(response.data.users)
        setTotal(response.data.total)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  useEffect(() => { load() }, [token])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${total} registered accounts`} />
      <input
        className="admin-input mb-4 max-w-md"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="admin-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_3fr] gap-2 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase text-slate-600">
          <span>Name</span>
          <span>Email</span>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map((user) => (
            <div key={user._id} className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-1 px-4 py-3 text-sm">
              <p className="font-medium text-slate-800">{user.name}</p>
              <p className="text-slate-600">{user.email}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-sm text-slate-500">No customers match your search.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Customers
