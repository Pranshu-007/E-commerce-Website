import UseAnimations from 'react-useanimations'
import explore from 'react-useanimations/lib/explore'
import userPlus from 'react-useanimations/lib/userPlus'
import pocket from 'react-useanimations/lib/pocket'
import menu3 from 'react-useanimations/lib/menu3'
import plusToX from 'react-useanimations/lib/plusToX'
import arrowDownCircle from 'react-useanimations/lib/arrowDownCircle'
import arrowLeftCircle from 'react-useanimations/lib/arrowLeftCircle'
import trash2 from 'react-useanimations/lib/trash2'
import heart from 'react-useanimations/lib/heart'
import star from 'react-useanimations/lib/star'
import archive from 'react-useanimations/lib/archive'
import info from 'react-useanimations/lib/info'
import edit from 'react-useanimations/lib/edit'
import folder from 'react-useanimations/lib/folder'
import home from 'react-useanimations/lib/home'
import settings from 'react-useanimations/lib/settings'

export const ICONS = {
  search: explore,
  profile: userPlus,
  cart: pocket,
  menu: menu3,
  close: plusToX,
  dropdown: arrowDownCircle,
  back: arrowLeftCircle,
  trash: trash2,
  heart,
  star,
  exchange: archive,
  quality: info,
  support: userPlus,
  add: edit,
  list: folder,
  parcel: archive,
  home,
  settings,
}

const SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

const AnimatedIcon = ({
  name,
  size = 'md',
  reverse = false,
  strokeColor = '#414141',
  fillColor,
  className = '',
  onClick,
  animationKey,
  wrapperStyle,
  ...props
}) => {
  const animation = ICONS[name]
  if (!animation) return null

  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md

  return (
    <UseAnimations
      key={animationKey}
      animation={animation}
      size={px}
      reverse={reverse}
      strokeColor={strokeColor}
      fillColor={fillColor}
      onClick={onClick}
      className={className}
      wrapperStyle={{
        cursor: onClick ? 'pointer' : undefined,
        display: 'inline-flex',
        ...wrapperStyle,
      }}
      {...props}
    />
  )
}

export default AnimatedIcon
