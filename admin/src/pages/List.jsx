import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {

  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNext: false, hasPrev: false })
  const [loading, setLoading] = useState(true)

  const fetchList = async (page = 1) => {
    setLoading(true)
    try {
      const response = await axios.get(backendUrl + `/api/product/list?page=${page}&limit=20`)
      if (response.data.success) {
        setList(response.data.products);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList(pagination.page);
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>

        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {loading ? (
          <p className='text-sm text-gray-500 py-4'>Loading products...</p>
        ) : list.length === 0 ? (
          <p className='text-sm text-gray-500 py-4'>No products found.</p>
        ) : (
          list.map((item) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={item._id}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p onClick={()=>removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg'>X</p>
            </div>
          ))
        )}

        {pagination.totalPages > 1 && (
          <div className='flex items-center gap-4 mt-4'>
            <button
              onClick={() => fetchList(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className='px-3 py-1 border text-sm disabled:opacity-40'
            >
              Previous
            </button>
            <span className='text-sm'>Page {pagination.page} of {pagination.totalPages}</span>
            <button
              onClick={() => fetchList(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className='px-3 py-1 border text-sm disabled:opacity-40'
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default List
