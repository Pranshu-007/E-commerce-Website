import { NavLink } from 'react-router-dom'
import AnimatedIcon from './AnimatedIcon'

const links = [
  { to: '/dashboard', icon: 'home', label: 'Dashboard' },
  { to: '/add', icon: 'add', label: 'Add Product' },
  { to: '/list', icon: 'list', label: 'Products' },
  { to: '/orders', icon: 'orders', label: 'Orders' },
  { to: '/inventory', icon: 'inventory', label: 'Inventory' },
  { to: '/coupons', icon: 'settings', label: 'Coupons' },
  { to: '/reviews', icon: 'star', label: 'Reviews' },
  { to: '/subscribers', icon: 'mail', label: 'Newsletter' },
  { to: '/customers', icon: 'customers', label: 'Customers' },
]

const Sidebar = () => (
  <aside className="w-56 min-h-[calc(100vh-73px)] shrink-0 border-r border-slate-200 bg-slate-50/80">
    <nav className="flex flex-col gap-1 p-4">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <AnimatedIcon name={link.icon} size="sm" strokeColor="#475569" />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
)

export default Sidebar
