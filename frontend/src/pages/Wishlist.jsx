import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'

const Wishlist = () => {
  const { token, navigate, wishlist, fetchProducts } = useContext(ShopContext)
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    const load = async () => {
      if (!wishlist.length) {
        setProducts([])
        return
      }
      const data = await fetchProducts({ ids: wishlist.join(',') })
      setProducts(data.products || [])
    }
    load()
  }, [wishlist, fetchProducts])

  if (!token) return null

  return (
    <div>
      <Title
        text1="My"
        text2="Wishlist"
        align="left"
        subtitle={products.length ? `${products.length} saved item(s)` : undefined}
      />

      {products.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <p className="font-medium text-brand-800">No saved items yet</p>
          <p className="mt-2 text-sm text-brand-500">Tap the heart on products you love.</p>
          <Link to="/collection" className="btn-primary mt-6">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.image}
              category={item.category}
              bestseller={item.bestseller}
              ratingAvg={item.ratingAvg}
              ratingCount={item.ratingCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
