import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import ScrollReveal from './ScrollReveal'

const BestSeller = () => {
  const { fetchProducts } = useContext(ShopContext)
  const [bestSeller, setBestSeller] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts({ bestseller: true, limit: 5, page: 1 })
        setBestSeller(data.products)
      } catch (error) {
        console.log(error)
      }
    }
    load()
  }, [fetchProducts])

  return (
    <section className="section-padding border-t border-brand-100">
      <ScrollReveal variant="fadeRight">
        <Title
          text1="Best"
          text2="Sellers"
          subtitle="Customer favorites — tried, tested, and loved by our community."
        />
      </ScrollReveal>

      <ScrollReveal
        className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        stagger={0.06}
        variant="scale"
        rebuild={bestSeller.length}
      >
        {bestSeller.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
            category={item.category}
            bestseller={item.bestseller}
            ratingAvg={item.ratingAvg}
            ratingCount={item.ratingCount}
          />
        ))}
      </ScrollReveal>
    </section>
  )
}

export default BestSeller
