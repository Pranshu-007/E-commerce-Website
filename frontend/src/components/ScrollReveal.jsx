import { Children } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { revealTransition, revealVariants, staggerContainer } from '../utils/motion'

const VIEWPORT_BY_START = {
  'top 88%': { once: true, amount: 0.2 },
  'top 90%': { once: true, amount: 0.15 },
  'top 92%': { once: true, amount: 0.12 },
}

const ScrollReveal = ({
  children,
  className = '',
  variant = 'fadeUp',
  delay = 0,
  duration = 0.85,
  stagger = 0,
  start = 'top 88%',
  rebuild = 0,
}) => {
  const reduceMotion = useReducedMotion()
  const viewport = VIEWPORT_BY_START[start] || VIEWPORT_BY_START['top 88%']
  const itemVariants = revealVariants[variant] || revealVariants.fadeUp

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  if (stagger > 0) {
    return (
      <motion.div
        key={rebuild}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer(stagger, delay)}
      >
        {Children.map(children, (child, index) => (
          <motion.div
            key={child?.key ?? index}
            variants={itemVariants}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={itemVariants.hidden}
      whileInView={itemVariants.visible}
      viewport={viewport}
      transition={{ ...revealTransition(delay), duration }}
    >
      {children}
    </motion.div>
  )
}

export default ScrollReveal
