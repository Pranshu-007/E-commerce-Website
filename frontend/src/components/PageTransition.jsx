import { motion, useReducedMotion } from 'framer-motion'
import { noMotionVariants, pageTransition, pageVariants } from '../utils/motion'

const PageTransition = ({ children }) => {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={reduceMotion ? noMotionVariants : pageVariants}
      transition={reduceMotion ? { duration: 0 } : pageTransition}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
