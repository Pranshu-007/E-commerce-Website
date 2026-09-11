import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import RelatedProducts from '../components/RelatedProducts'
import StarRating from '../components/StarRating'
import WishlistIcon from '../components/WishlistIcon'
import axios from 'axios'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'

const Product = () => {
  const { productId } = useParams()
  const { currency, addToCart, fetchProductById, backendUrl, token, toggleWishlist, wishlist, demoCatalog } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [wishAnim, setWishAnim] = useState(0)

  const loadReviews = async () => {
    const response = await axios.get(`${backendUrl}/api/review/${productId}`)
    if (response.data.success) setReviews(response.data.reviews)
  }

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      try {
        const product = await fetchProductById(productId)
        setProductData(product)
        setImage(product.image[0])
        setSize('')
        await loadReviews()
      } catch (error) {
        console.log(error)
        setProductData(null)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [productId, fetchProductById])

  const submitReview = async (e) => {
    e.preventDefault()
    if (!token) {
      toast.error('Login to leave a review')
      return
    }
    if (rating < 1) {
      toast.error('Please select a star rating')
      return
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/review`,
        { productId, rating, comment },
        { headers: { token } }
      )
      if (response.data.success) {
        setReviews(response.data.reviews)
        setComment('')
        setRating(5)
        if (productData) {
          const updated = await fetchProductById(productId)
          setProductData(updated)
        }
        toast.success('Review saved')
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const stockFor = (s) => {
    if (!productData?.stock || productData.stock[s] === undefined) return null
    return Number(productData.stock[s])
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-900" />
      </div>
    )
  }

  const saved = wishlist.includes(productData?._id)

  if (!productData) {
    return (
      <div className="card py-20 text-center">
        <p className="text-brand-500">Product not found.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-y-auto sm:w-24">
            {productData.image.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setImage(item)}
                className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  image === item ? 'border-brand-900' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img className="h-20 w-20 object-cover sm:h-24 sm:w-full" src={item} alt="" />
              </button>
            ))}
          </div>
          <div className="card flex-1 overflow-hidden rounded-3xl">
            <img className="w-full object-cover aspect-[4/5]" src={image} alt={productData.name} />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="eyebrow">{productData.category}</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl text-brand-900">{productData.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <StarRating value={Math.round(productData.ratingAvg || 0)} readOnly size="sm" />
            <span className="text-sm text-brand-500">
              ({productData.ratingCount || reviews.length} reviews)
            </span>
          </div>

          <p className="mt-6 text-3xl font-semibold text-brand-900">{currency}{productData.price}</p>
          <p className="mt-4 text-sm text-brand-500 leading-relaxed max-w-lg">{productData.description}</p>

          <div className="mt-8">
            <p className="text-sm font-medium text-brand-800 mb-3">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {productData.sizes.map((item, index) => {
                const left = stockFor(item)
                const out = left === 0
                return (
                  <button
                    disabled={out}
                    onClick={() => setSize(item)}
                    className={`size-pill ${item === size ? 'selected' : ''}`}
                    key={index}
                  >
                    {item}{left !== null ? ` (${left})` : ''}
                  </button>
                )
              })}
            </div>
          </div>

          {demoCatalog && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This is a demo product from Fake Store API. Cart, wishlist, and reviews are disabled until you switch back to your catalog in admin.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => addToCart(productData._id, size)}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={demoCatalog}
            >
              Add to Cart
            </button>
            <button
              type="button"
              disabled={demoCatalog}
              onClick={() => {
                setWishAnim((n) => n + 1)
                toggleWishlist(productData._id)
              }}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <WishlistIcon active={saved} size="md" as="span" animationTrigger={wishAnim} />
              {saved ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          <ul className="mt-8 space-y-2 text-sm text-brand-500">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" />100% authentic product</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Cash on delivery available</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Easy 7-day return & exchange</li>
          </ul>
        </div>
      </div>

      <section className="mt-20">
        <div className="card overflow-hidden">
          <div className="border-b border-brand-100 bg-brand-50 px-6 py-4">
            <h2 className="font-display text-xl text-brand-900">Reviews ({reviews.length})</h2>
          </div>
          <div className="p-6 space-y-6">
            {!demoCatalog && (
              <form onSubmit={submitReview} className="max-w-xl space-y-4">
                <StarRating label="Your rating" value={rating} onChange={setRating} size="lg" />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Share your experience..."
                />
                <button type="submit" className="btn-primary !py-2.5 !text-xs">
                  Submit Review
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-brand-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4 pt-4 border-t border-brand-100">
                {reviews.map((review) => (
                  <div key={review._id} className="pb-4 border-b border-brand-50 last:border-0">
                    <p className="font-medium text-brand-900">{review.name}</p>
                    <StarRating value={review.rating} readOnly size="sm" />
                    {review.comment && <p className="mt-2 text-sm text-brand-500">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  )
}

export default Product
