import UseAnimations from 'react-useanimations'
import edit from 'react-useanimations/lib/edit'
import folder from 'react-useanimations/lib/folder'
import archive from 'react-useanimations/lib/archive'
import home from 'react-useanimations/lib/home'
import settings from 'react-useanimations/lib/settings'
import mail from 'react-useanimations/lib/mail'
import star from 'react-useanimations/lib/star'
import userPlus from 'react-useanimations/lib/userPlus'
import alertCircle from 'react-useanimations/lib/alertCircle'

export const ICONS = {
  add: edit,
  list: folder,
  orders: archive,
  parcel: archive,
  home,
  settings,
  mail,
  star,
  customers: userPlus,
  inventory: alertCircle,
}

const SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
}

const AnimatedIcon = ({
  name,
  size = 'md',
  reverse = false,
  strokeColor = '#414141',
  className = '',
  onClick,
  ...props
}) => {
  const animation = ICONS[name]
  if (!animation) return null

  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md

  return (
    <UseAnimations
      animation={animation}
      size={px}
      reverse={reverse}
      strokeColor={strokeColor}
      onClick={onClick}
      className={className}
      wrapperStyle={{
        cursor: onClick ? 'pointer' : undefined,
        display: 'inline-flex',
      }}
      {...props}
    />
  )
}

export default AnimatedIcon
