import AnimatedIcon from './AnimatedIcon'

const SIZES = {
  xs: 22,
  sm: 26,
  md: 32,
  lg: 38,
}

const WishlistIcon = ({
  active = false,
  size = 'md',
  className = '',
  onClick,
  title = 'Wishlist',
  as = 'button',
  animationTrigger,
}) => {
  const px = SIZES[size] || SIZES.md

  const icon = (
    <AnimatedIcon
      name="heart"
      size={px}
      reverse={active}
      animationKey={animationTrigger !== undefined ? `${active}-${animationTrigger}` : undefined}
      strokeColor={active ? '#c2410c' : '#57534e'}
      fillColor={active ? '#ea580c' : undefined}
      onClick={as === 'button' ? onClick : undefined}
      title={title}
      className={`rounded-full bg-white/90 p-1.5 shadow-soft backdrop-blur-sm transition-transform hover:scale-105 ${className}`}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    />
  )

  if (as === 'span') {
    return (
      <span className="inline-flex items-center justify-center" title={title}>
        {icon}
      </span>
    )
  }

  return icon
}

export default WishlistIcon
