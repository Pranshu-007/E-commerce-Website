import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { search, showSearch, fetchProducts } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant')
  const [page, setPage] = useState(1);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setCategory(prev => [...prev, e.target.value])
    }
    setPage(1);
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setSubCategory(prev => [...prev, e.target.value])
    }
    setPage(1);
  }

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          sort: sortType,
        };

        if (category.length > 0) params.category = category.join(',');
        if (subCategory.length > 0) params.subCategory = subCategory.join(',');
        if (showSearch && search) params.search = search;

        const data = await fetchProducts(params);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, subCategory, search, showSearch, sortType, page, fetchProducts]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Men'} checked={category.includes('Men')} onChange={toggleCategory} /> Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Women'} checked={category.includes('Women')} onChange={toggleCategory} /> Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Kids'} checked={category.includes('Kids')} onChange={toggleCategory} /> kids
            </p>
          </div>
        </div>
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Topwear'} checked={subCategory.includes('Topwear')} onChange={toggleSubCategory} /> Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bottomwear'} checked={subCategory.includes('Bottomwear')} onChange={toggleSubCategory} /> Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Winterwear'} checked={subCategory.includes('Winterwear')} onChange={toggleSubCategory} /> Winterwear
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select
            onChange={(e) => { setSortType(e.target.value); setPage(1); }}
            value={sortType}
            className='border-2 border-gray-300 text-sm px-2'
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {loading ? (
          <p className='text-center text-gray-500 py-10'>Loading products...</p>
        ) : products.length === 0 ? (
          <p className='text-center text-gray-500 py-10'>No products found.</p>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {products.map((item) => (
              <ProductItem key={item._id} name={item.name} id={item._id} price={item.price} image={item.image} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className='flex items-center justify-center gap-4 mt-10 mb-6'>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev}
              className='px-4 py-2 border text-sm disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Previous
            </button>
            <span className='text-sm text-gray-600'>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className='px-4 py-2 border text-sm disabled:opacity-40 disabled:cursor-not-allowed'
            >
              Next
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default Collection
