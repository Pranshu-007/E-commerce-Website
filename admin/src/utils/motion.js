export const EASE_OUT = [0.22, 1, 0.36, 1]

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const pageTransition = {
  duration: 0.32,
  ease: EASE_OUT,
}

export const noMotionVariants = {
  initial: {},
  animate: {},
  exit: {},
}
