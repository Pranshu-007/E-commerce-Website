import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import ScrollReveal from './ScrollReveal'

const LatestCollection = () => {
  const { fetchProducts } = useContext(ShopContext)
  const [latestProducts, setLatestProducts] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts({ limit: 10, page: 1, sort: 'relevant' })
        setLatestProducts(data.products)
      } catch (error) {
        console.log(error)
      }
    }
    load()
  }, [fetchProducts])

  return (
    <section className="section-padding">
      <ScrollReveal>
        <Title
          text1="Latest"
          text2="Collections"
          subtitle="Elevate your wardrobe with our newest arrivals — thoughtfully selected for the season."
        />
      </ScrollReveal>

      <ScrollReveal
        className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        stagger={0.06}
        rebuild={latestProducts.length}
      >
        {latestProducts.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            category={item.category}
            bestseller={item.bestseller}
            ratingAvg={item.ratingAvg}
            ratingCount={item.ratingCount}
          />
        ))}
      </ScrollReveal>

      <div className="mt-10 text-center">
        <Link to="/collection" className="btn-secondary">
          View All Products
        </Link>
      </div>
    </section>
  )
}

export default LatestCollection
