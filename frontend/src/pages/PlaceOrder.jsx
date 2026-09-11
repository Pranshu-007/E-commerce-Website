import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, couponCode, applyCouponCode, clearCoupon } = useContext(ShopContext);
    const [promo, setPromo] = useState('')
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name:'Order Payment',
            description:'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log(response)
                try {
                    
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay',response,{headers:{token}})
                    if (data.success) {
                        setCartItems({})
                        navigate('/orders', { state: { paymentSuccess: true } })
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(apiErrorMessage(error))
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        orderItems.push({
                            productId: items,
                            size: item,
                            quantity: cartItems[items][item],
                        })
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                couponCode,
            }
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        clearCoupon()
                        navigate('/orders', { state: { paymentSuccess: true } })
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe',orderData,{headers:{token}})
                    if (responseStripe.data.success) {
                        const {session_url} = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'razorpay':

                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers:{token}})
                    if (responseRazorpay.data.success) {
                        initPay(responseRazorpay.data.order)
                    } else {
                        toast.error(responseRazorpay.data.message)
                    }

                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(apiErrorMessage(error))
        }
    }


    const PaymentOption = ({ id, children }) => (
        <button
            type="button"
            onClick={() => setMethod(id)}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                method === id ? 'border-brand-900 bg-brand-50 shadow-soft' : 'border-brand-200 hover:border-brand-400'
            }`}
        >
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                method === id ? 'border-brand-900' : 'border-brand-300'
            }`}>
                {method === id && <span className="h-2 w-2 rounded-full bg-brand-900" />}
            </span>
            {children}
        </button>
    )

    return (
        <form onSubmit={onSubmitHandler} className='grid gap-10 lg:grid-cols-[1fr_400px] min-h-[70vh]'>
            <div className='card p-6 sm:p-8'>
                <Title text1='Delivery' text2='Information' align='left' className='!mb-6' />
                <div className='flex flex-col gap-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='input-field' type="text" placeholder='First name' />
                        <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='input-field' type="text" placeholder='Last name' />
                    </div>
                    <input required onChange={onChangeHandler} name='email' value={formData.email} className='input-field' type="email" placeholder='Email address' />
                    <input required onChange={onChangeHandler} name='street' value={formData.street} className='input-field' type="text" placeholder='Street address' />
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <input required onChange={onChangeHandler} name='city' value={formData.city} className='input-field' type="text" placeholder='City' />
                        <input onChange={onChangeHandler} name='state' value={formData.state} className='input-field' type="text" placeholder='State' />
                    </div>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='input-field' type="number" placeholder='Zipcode' />
                        <input required onChange={onChangeHandler} name='country' value={formData.country} className='input-field' type="text" placeholder='Country' />
                    </div>
                    <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='input-field' type="number" placeholder='Phone number' />
                </div>
            </div>

            <div className='space-y-6'>
                <div className='card-elevated p-6'>
                    <CartTotal />
                    <div className='flex gap-2 mt-6'>
                        <input
                          value={promo}
                          onChange={(e)=>setPromo(e.target.value)}
                          className='input-field flex-1'
                          placeholder='Promo code'
                        />
                        <button type='button' onClick={()=>applyCouponCode(promo)} className='btn-secondary !px-5 shrink-0'>Apply</button>
                    </div>
                </div>

                <div className='card p-6'>
                    <Title text1='Payment' text2='Method' align='left' className='!mb-6' />
                    <div className='flex flex-col gap-3'>
                        <PaymentOption id="stripe">
                            <img className='h-5' src={assets.stripe_logo} alt="Stripe" />
                        </PaymentOption>
                        <PaymentOption id="cod">
                            <span className='text-sm font-medium text-brand-700'>Cash on Delivery</span>
                        </PaymentOption>
                    </div>
                    <button type='submit' className='btn-primary w-full mt-8'>Place Order</button>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
