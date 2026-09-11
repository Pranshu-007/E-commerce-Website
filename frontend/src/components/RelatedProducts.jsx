import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const RelatedProducts = ({ category, subCategory }) => {
  const { fetchProducts } = useContext(ShopContext)
  const [related, setRelated] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts({
          category,
          subCategory,
          limit: 5,
          page: 1,
        })
        setRelated(data.products)
      } catch (error) {
        console.log(error)
      }
    }
    if (category && subCategory) load()
  }, [category, subCategory, fetchProducts])

  if (!related.length) return null

  return (
    <section className="mt-24 border-t border-brand-100 pt-16">
      <Title text1="Related" text2="Products" subtitle="You might also like these pieces." />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {related.map((item) => (
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
    </section>
  )
}

export default RelatedProducts
