import { useState } from 'react'
import AnimatedIcon from './AnimatedIcon'

const SIZE_MAP = {
  sm: 18,
  md: 24,
  lg: 30,
}

const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  label,
}) => {
  const [hover, setHover] = useState(0)
  const display = hover || value
  const starPx = SIZE_MAP[size] || SIZE_MAP.md

  const stars = [1, 2, 3, 4, 5].map((star) => {
    const filled = star <= display

    if (readOnly) {
      return (
        <span key={star} className="inline-flex">
          <AnimatedIcon
            name="star"
            size={starPx}
            reverse={filled}
            strokeColor="#d97706"
            fillColor={filled ? '#f59e0b' : undefined}
          />
        </span>
      )
    }

    return (
      <button
        key={star}
        type="button"
        onClick={() => onChange?.(star)}
        onMouseEnter={() => setHover(star)}
        onMouseLeave={() => setHover(0)}
        onFocus={() => setHover(star)}
        onBlur={() => setHover(0)}
        className="p-0.5 border-0 bg-transparent cursor-pointer hover:scale-110 transition-transform"
        aria-label={`Rate ${star} out of 5 stars`}
      >
        <AnimatedIcon
          name="star"
          size={starPx}
          reverse={filled}
          animationKey={`${star}-${display}`}
          strokeColor="#d97706"
          fillColor={filled ? '#f59e0b' : undefined}
        />
      </button>
    )
  })

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <div className="flex items-center gap-0.5">
        {stars}
        {!readOnly && value > 0 && (
          <span className="text-xs text-gray-500 ml-2">{value}/5</span>
        )}
      </div>
    </div>
  )
}

export default StarRating
