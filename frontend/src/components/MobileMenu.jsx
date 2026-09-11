import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import AnimatedIcon from './AnimatedIcon'
import { EASE_OUT } from '../utils/motion'

const MobileMenu = ({ open, onClose, links }) => {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="mobile-menu" className="fixed inset-0 z-[200] sm:hidden">
          <motion.button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-lift"
            initial={reduceMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
              <span className="font-display text-lg">Menu</span>
              <button type="button" onClick={onClose} className="btn-ghost" aria-label="Close menu">
                <AnimatedIcon name="close" size="sm" reverse strokeColor="#57534e" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {links.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.28, ease: EASE_OUT }}
                >
                  <NavLink
                    onClick={onClose}
                    to={link.to}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand-900 text-white' : 'text-brand-700 hover:bg-brand-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default MobileMenu
