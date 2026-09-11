import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'

const Coupons = ({ token }) => {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState({ code: '', type: 'percent', value: 10, minAmount: 0, maxUses: 0 })

  const load = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/coupon/list`, { headers: { token } })
      if (response.data.success) setCoupons(response.data.coupons)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  useEffect(() => { load() }, [token])

  const create = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${backendUrl}/api/coupon/add`, form, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setForm({ code: '', type: 'percent', value: 10, minAmount: 0, maxUses: 0 })
        load()
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const toggle = async (id) => {
    try {
      await axios.post(`${backendUrl}/api/coupon/toggle`, { id }, { headers: { token } })
      load()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Create and manage discount codes" />

      <form onSubmit={create} className="admin-card mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <FormField label="Coupon code">
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" className="admin-input" />
        </FormField>
        <FormField label="Discount type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="admin-input">
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed amount ({currency})</option>
          </select>
        </FormField>
        <FormField label="Discount value">
          <input type="number" min="1" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percent' ? 'e.g. 20' : 'e.g. 10'} className="admin-input" />
        </FormField>
        <FormField label="Minimum order">
          <input type="number" min="0" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} placeholder="e.g. 50 (0 = no minimum)" className="admin-input" />
        </FormField>
        <FormField label="Max uses">
          <input type="number" min="0" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="e.g. 100 (0 = unlimited)" className="admin-input" />
        </FormField>
        <div className="sm:col-span-2 lg:col-span-5">
          <button type="submit" className="admin-btn">Create Coupon</button>
        </div>
      </form>

      <div className="admin-card divide-y divide-slate-100">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">{coupon.code}</p>
              <p className="text-slate-500">
                {coupon.type === 'percent' ? `${coupon.value}% off` : `${currency}${coupon.value} off`}
                {coupon.minAmount > 0 && ` · Min ${currency}${coupon.minAmount}`}
                {` · Used ${coupon.usedCount}${coupon.maxUses ? `/${coupon.maxUses}` : ''}`}
              </p>
            </div>
            <button type="button" onClick={() => toggle(coupon._id)} className={`rounded-full px-3 py-1 text-xs font-medium ${coupon.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {coupon.active ? 'Active — Disable' : 'Disabled — Enable'}
            </button>
          </div>
        ))}
        {coupons.length === 0 && <p className="p-6 text-sm text-slate-500">No coupons created yet.</p>}
      </div>
    </div>
  )
}

export default Coupons
