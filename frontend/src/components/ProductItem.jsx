import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import WishlistIcon from './WishlistIcon'
import AnimatedIcon from './AnimatedIcon'

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ProductItem = ({
  id,
  image,
  name,
  price,
  category,
  bestseller,
  ratingAvg = 0,
  ratingCount = 0,
}) => {
  const { currency, wishlist, toggleWishlist, demoCatalog } = useContext(ShopContext)
  const [imageHovered, setImageHovered] = useState(false)
  const saved = wishlist.includes(id)
  const hasSecondImage = image?.length > 1
  const showRating = ratingCount > 0 || ratingAvg > 0

  return (
    <article
      className="product-card group"
      onMouseEnter={() => setImageHovered(true)}
      onMouseLeave={() => setImageHovered(false)}
    >
      <div className="product-card__media">
        <Link
          to={`/product/${id}`}
          onClick={() => scrollTo(0, 0)}
          className="product-card__image-link"
          aria-label={`View ${name}`}
        >
          <img
            className={`product-card__image ${imageHovered && hasSecondImage ? 'product-card__image--hidden' : ''}`}
            src={image[0]}
            alt={name}
            loading="lazy"
          />
          {hasSecondImage && (
            <img
              className={`product-card__image product-card__image--alt ${imageHovered ? 'product-card__image--visible' : ''}`}
              src={image[1]}
              alt=""
              loading="lazy"
              aria-hidden="true"
            />
          )}
          <div className="product-card__overlay">
            <span className="product-card__cta">
              View product
              <ArrowRight />
            </span>
          </div>
        </Link>

        <div className="product-card__badges">
          {bestseller && <span className="product-card__badge product-card__badge--accent">Bestseller</span>}
          {category && !bestseller && <span className="product-card__badge">{category}</span>}
        </div>

        {!demoCatalog && (
          <WishlistIcon
            active={saved}
            size="xs"
            className="product-card__wishlist"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleWishlist(id)
            }}
          />
        )}
      </div>

      <Link
        to={`/product/${id}`}
        onClick={() => scrollTo(0, 0)}
        className="product-card__body"
      >
        {category && bestseller && (
          <p className="product-card__category">{category}</p>
        )}
        <h3 className="product-card__title">{name}</h3>

        {showRating && (
          <div className="product-card__rating">
            <AnimatedIcon
              name="star"
              size={14}
              reverse={ratingAvg >= 3.5}
              strokeColor="#d97706"
              fillColor={ratingAvg >= 3.5 ? '#f59e0b' : undefined}
            />
            <span>{Number(ratingAvg).toFixed(1)}</span>
            {ratingCount > 0 && <span className="product-card__rating-count">({ratingCount})</span>}
          </div>
        )}

        <div className="product-card__footer">
          <p className="product-card__price">
            <span className="product-card__price-value">{currency}{price}</span>
          </p>
        </div>
      </Link>
    </article>
  )
}

export default ProductItem
