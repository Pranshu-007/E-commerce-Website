import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'
import CategoryCharts from '../components/CategoryCharts'
import CatalogToggle from '../components/CatalogToggle'

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          axios.get(`${backendUrl}/api/dashboard`, { headers: { token } }),
          axios.get(`${backendUrl}/api/admin/orders/recent`, { headers: { token } }),
        ])
        if (dashRes.data.success) setStats(dashRes.data.stats)
        if (ordersRes.data.success) setRecentOrders(ordersRes.data.orders)
      } catch (error) {
        toast.error(apiErrorMessage(error))
      }
    }
    load()
  }, [token])

  if (!stats) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>
  }

  const cards = [
    { label: 'Total Revenue', value: `${currency}${stats.revenue}`, hint: 'Paid orders' },
    { label: 'Total Orders', value: stats.orders, hint: 'All time' },
    { label: "Today's Orders", value: stats.todayOrders, hint: 'Since midnight' },
    { label: 'Products', value: stats.productCount, hint: 'In catalog', link: '/list' },
    { label: 'Customers', value: stats.userCount, hint: 'Registered users', link: '/customers' },
    { label: 'Subscribers', value: stats.subscriberCount, hint: 'Newsletter', link: '/subscribers' },
    { label: 'Low Stock', value: stats.lowStockCount, hint: 'Needs attention', link: '/inventory', alert: stats.lowStockCount > 0 },
    { label: 'Pending Payment', value: stats.pendingPayment, hint: 'Unpaid orders', link: '/orders', alert: stats.pendingPayment > 0 },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your store performance" />

      <CatalogToggle token={token} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`admin-card p-4 ${card.alert ? 'border-amber-300 bg-amber-50/50' : ''}`}
          >
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
            {card.link && (
              <Link to={card.link} className="mt-2 inline-block text-xs font-medium text-slate-700 hover:underline">
                View →
              </Link>
            )}
          </div>
        ))}
      </div>

      <CategoryCharts categories={stats.categoryAnalytics || []} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="admin-card p-4">
          <h2 className="mb-3 font-semibold text-slate-900">Top Products</h2>
          <div className="space-y-2">
            {(stats.topProducts || []).map((item) => (
              <div key={item._id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="truncate pr-2">{item._id}</span>
                <span className="shrink-0 text-slate-600">{item.quantity} sold · {currency}{item.revenue}</span>
              </div>
            ))}
            {stats.topProducts?.length === 0 && (
              <p className="text-sm text-slate-500">No sales data yet.</p>
            )}
          </div>
        </div>

        <div className="admin-card p-4">
          <h2 className="mb-3 font-semibold text-slate-900">Recent Orders</h2>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order._id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-slate-800">
                    {order.address?.firstName} {order.address?.lastName}
                  </span>
                  <span className="text-slate-600">{currency}{order.amount}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{order.status}</span>
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-sm text-slate-500">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
