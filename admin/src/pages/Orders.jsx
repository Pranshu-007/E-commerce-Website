import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import AnimatedIcon from '../components/AnimatedIcon'
import PageHeader from '../components/PageHeader'

const STATUS_OPTIONS = [
  'Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered',
  'Cancelled', 'Return Requested', 'Returned',
]

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchAllOrders = async () => {
    if (!token) return
    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } })
      if (response.data.success) setOrders(response.data.orders.reverse())
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        { headers: { token } }
      )
      if (response.data.success) await fetchAllOrders()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  useEffect(() => { fetchAllOrders() }, [token])

  const filtered = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const q = search.toLowerCase()
    const name = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.toLowerCase()
    const matchesSearch = !q || name.includes(q) || order.address?.phone?.includes(q)
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} total orders`} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="admin-input max-w-xs"
          placeholder="Search by customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((order) => (
          <div className="admin-card grid grid-cols-1 gap-4 p-5 sm:grid-cols-[auto_2fr_1fr_1fr] lg:grid-cols-[auto_2fr_1fr_1fr_1fr] text-sm" key={order._id}>
            <AnimatedIcon name="parcel" size="lg" />
            <div>
              {order.items.map((item, idx) => (
                <p className="py-0.5 text-slate-700" key={idx}>
                  {item.name} × {item.quantity} <span className="text-slate-500">({item.size})</span>
                </p>
              ))}
              <p className="mt-3 font-medium text-slate-900">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p className="text-slate-600">{order.address.street}, {order.address.city}</p>
              <p className="text-slate-600">{order.address.state}, {order.address.country} {order.address.zipcode}</p>
              <p className="text-slate-500">{order.address.phone}</p>
            </div>
            <div className="text-slate-600">
              <p>Items: {order.items.length}</p>
              <p className="mt-2">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? 'Paid' : 'Pending'}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="font-semibold text-slate-900">{currency}{order.amount}</p>
            <select
              onChange={(e) => statusHandler(e, order._id)}
              value={order.status}
              className="admin-input"
              aria-label="Order status"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-card p-8 text-center text-sm text-slate-500">No orders match your filters.</div>
        )}
      </div>
    </div>
  )
}

export default Orders
