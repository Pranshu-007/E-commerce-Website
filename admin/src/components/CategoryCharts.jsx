import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { currency } from '../App'

const CATEGORY_COLORS = {
  Men: '#475569',
  Women: '#C586A5',
  Kids: '#0d9488',
  Other: '#94a3b8',
}

const SUB_COLORS = ['#C586A5', '#475569', '#0d9488', '#f59e0b', '#6366f1']

const formatCurrency = (value) => `${currency}${Number(value || 0).toLocaleString()}`

const ChartTooltip = ({ active, payload, label, valueFormatter }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-slate-800">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="text-slate-600">
          {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

const CategoryCharts = ({ categories = [] }) => {
  if (!categories.length) {
    return (
      <div className="admin-card p-6">
        <p className="text-sm text-slate-500">No category data available yet.</p>
      </div>
    )
  }

  const overviewData = categories.map((category) => ({
    name: category.name,
    revenue: category.revenue,
    unitsSold: category.unitsSold,
    products: category.productCount,
  }))

  const productDistribution = categories
    .filter((category) => category.productCount > 0)
    .map((category) => ({
      name: category.name,
      value: category.productCount,
    }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Category Analytics</h2>
        <p className="text-sm text-slate-500">Revenue, sales, and catalog breakdown by product category</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="admin-card p-4 xl:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Revenue by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${currency}${v}`} />
                <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} />} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                  {overviewData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Catalog Distribution</h3>
          <div className="h-72">
            {productDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {productDistribution.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No products in catalog yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Units Sold by Category</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="unitsSold" name="Units sold" radius={[6, 6, 0, 0]}>
                {overviewData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {categories.map((category) => {
          const subData = category.subCategories.filter(
            (sub) => sub.revenue > 0 || sub.unitsSold > 0 || sub.productCount > 0
          )

          const chartData = subData.length
            ? subData
            : category.subCategories.map((sub) => ({ ...sub }))

          return (
            <div key={category.name} className="admin-card p-4">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{category.name}</h3>
                  <p className="text-xs text-slate-500">Sub-category performance</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[category.name] || CATEGORY_COLORS.Other }}
                >
                  {category.productCount} products
                </span>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">Revenue</p>
                  <p className="font-semibold text-slate-800">{formatCurrency(category.revenue)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">Units sold</p>
                  <p className="font-semibold text-slate-800">{category.unitsSold}</p>
                </div>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${currency}${v}`} />
                    <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip valueFormatter={formatCurrency} />} />
                    <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name} fill={SUB_COLORS[index % SUB_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryCharts
