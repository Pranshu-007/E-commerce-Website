import { useContext, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ShopContext } from '../context/ShopContext'
import AnimatedIcon from './AnimatedIcon'
import { useLocation } from 'react-router-dom'
import { EASE_OUT } from '../utils/motion'

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext)
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setVisible(location.pathname.includes('collection'))
  }, [location])

  const isOpen = showSearch && visible

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-bar"
          className="overflow-hidden border-t border-brand-100 pb-4"
          initial={reduceMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <div className="flex items-center gap-3 pt-4">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-brand-200 bg-brand-50 px-5 py-2.5">
              <AnimatedIcon name="search" size="xs" strokeColor="#78716c" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-brand-400"
                type="text"
                placeholder="Search products..."
                autoFocus
              />
            </div>
            <button type="button" onClick={() => setShowSearch(false)} className="btn-ghost shrink-0">
              <AnimatedIcon name="close" size="xs" reverse strokeColor="#57534e" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchBar
