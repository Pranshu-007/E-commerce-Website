import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import WishlistIcon from './WishlistIcon'
import AnimatedIcon from './AnimatedIcon'
import MobileMenu from './MobileMenu'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/collection', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const mobileLinks = [
  ...navItems,
  { to: '/wishlist', label: 'Wishlist' },
]

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems, wishlist } = useContext(ShopContext)

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
  }

  return (
    <>
      <div className="relative flex items-center justify-between py-4 sm:py-5">
        <Link to="/" className="shrink-0">
          <img src={assets.logo} className="h-8 w-auto sm:h-9" alt="Forever" />
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <AnimatedIcon
            name="search"
            size="sm"
            strokeColor="#57534e"
            onClick={() => { setShowSearch(true); navigate('/collection') }}
          />

          <div className="group relative">
            <AnimatedIcon
              name="profile"
              size="sm"
              strokeColor="#57534e"
              onClick={() => { if (!token) navigate('/login') }}
            />
            {token && (
              <div className="absolute right-0 top-full z-50 hidden pt-3 group-hover:block">
                <div className="min-w-[10rem] rounded-xl border border-brand-100 bg-white p-2 shadow-card">
                  {[
                    { label: 'Profile', path: '/profile' },
                    { label: 'Wishlist', path: '/wishlist' },
                    { label: 'Orders', path: '/orders' },
                  ].map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50 hover:text-brand-900"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link to="/wishlist" className="relative hidden sm:flex" title="Wishlist">
            <WishlistIcon active={wishlist.length > 0} size="sm" as="span" />
          </Link>

          <Link to="/cart" className="relative flex items-center">
            <AnimatedIcon name="cart" size="sm" strokeColor="#57534e" />
            {getCartCount() > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {getCartCount()}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-brand-100 sm:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <AnimatedIcon
              name="menu"
              size="sm"
              reverse={menuOpen}
              strokeColor="#57534e"
            />
          </button>
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={mobileLinks}
      />
    </>
  )
}

export default Navbar
