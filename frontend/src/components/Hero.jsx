import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { assets } from '../assets/assets'
import { EASE_OUT } from '../utils/motion'

const lineVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT },
  },
}

const textContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const Hero = () => {
  const containerRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  return (
    <section ref={containerRef} className="relative mb-4 sm:mb-8">
      <div className="card-elevated overflow-hidden rounded-3xl sm:rounded-4xl">
        <div className="grid min-h-[420px] lg:min-h-[520px] grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 bg-gradient-to-br from-brand-50 to-white">
            <motion.div
              variants={textContainerVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              className="max-w-md"
            >
              <motion.p variants={lineVariants} className="eyebrow mb-4">
                New Season · 2026
              </motion.p>
              <motion.h1
                variants={lineVariants}
                className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-brand-900"
              >
                Style That
                <span className="block text-accent">Lasts Forever</span>
              </motion.h1>
              <motion.p
                variants={lineVariants}
                className="mt-5 text-sm sm:text-base text-brand-500 leading-relaxed"
              >
                Curated essentials and statement pieces — crafted for comfort, designed for confidence.
              </motion.p>
              <motion.div variants={lineVariants} className="mt-8 flex flex-wrap gap-3">
                <Link to="/collection" className="btn-primary">
                  Shop Collection
                </Link>
                <Link to="/about" className="btn-secondary">
                  Our Story
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative overflow-hidden min-h-[280px] lg:min-h-full">
            <motion.img
              className="absolute inset-0 h-full w-full object-cover"
              src={assets.hero_img}
              alt="Latest fashion arrivals"
              style={reduceMotion ? undefined : { y: imageY }}
              initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/20 via-transparent to-transparent lg:bg-gradient-to-l lg:from-brand-900/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
