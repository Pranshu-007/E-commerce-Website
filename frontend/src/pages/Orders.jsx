import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([])

  const loadOrderData = async () => {
    try {
      if (!token) return
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/cancel', { orderId }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        loadOrderData()
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const returnOrder = async (orderId) => {
    const reason = window.prompt('Why are you returning this order?') || ''
    try {
      const response = await axios.post(backendUrl + '/api/order/return', { orderId, reason }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        loadOrderData()
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  useEffect(() => {
    loadOrderData()
  }, [token])

  return (
    <div className='border-t pt-16'>
        <div className='text-2xl'>
            <Title text1={'MY'} text2={'ORDERS'}/>
        </div>
        <div>
            {orders.map((order) => (
              <div key={order._id} className='py-4 border-t border-b text-gray-700'>
                {order.items.map((item, index) => (
                  <div key={index} className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3'>
                    <div className='flex items-start gap-6 text-sm'>
                        <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                        <div>
                          <p className='sm:text-base font-medium'>{item.name}</p>
                          <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                            <p>{currency}{item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Size: {item.size}</p>
                          </div>
                          <p className='mt-1'>Date: <span className=' text-gray-400'>{new Date(order.date).toDateString()}</span></p>
                          <p className='mt-1'>Payment: <span className=' text-gray-400'>{order.paymentMethod}</span></p>
                        </div>
                    </div>
                  </div>
                ))}
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                        <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                        <p className='text-sm md:text-base'>{order.status}</p>
                    </div>
                    <div className='flex gap-2'>
                      {['Order Placed', 'Packing', 'Pending Payment'].includes(order.status) && (
                        <button onClick={() => cancelOrder(order._id)} className='border px-4 py-2 text-sm'>Cancel</button>
                      )}
                      {order.status === 'Delivered' && (
                        <button onClick={() => returnOrder(order._id)} className='border px-4 py-2 text-sm'>Request return</button>
                      )}
                      <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                    </div>
                </div>
              </div>
            ))}
        </div>
    </div>
  )
}

export default Orders
