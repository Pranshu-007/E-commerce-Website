import confetti from 'canvas-confetti'

const BRAND_COLORS = ['#1c1917', '#C586A5', '#9a3412', '#d97706', '#f7f6f4']

export function celebratePayment() {
  const duration = 2800
  const end = Date.now() + duration

  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.62 },
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
  })

  const burst = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
    })

    if (Date.now() < end) {
      requestAnimationFrame(burst)
    }
  }

  burst()
}
