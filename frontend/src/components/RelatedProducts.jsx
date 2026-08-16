import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({ category, subCategory }) => {

    const { fetchProducts } = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchProducts({
                    category,
                    subCategory,
                    limit: 5,
                    page: 1,
                });
                setRelated(data.products);
            } catch (error) {
                console.log(error);
            }
        };

        if (category && subCategory) load();
    }, [category, subCategory, fetchProducts])

  return (
    <div className='my-24'>
      <div className=' text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={"PRODUCTS"} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item)=>(
            <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image}/>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
