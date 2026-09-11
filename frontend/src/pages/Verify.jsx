import { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { apiErrorMessage } from '../utils/apiError'

const Verify = () => {
    const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
    const [searchParams] = useSearchParams()

    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('orderId')
    const cancelled = searchParams.get('cancelled')

    const verifyPayment = async () => {
        try {
            if (cancelled === 'true') {
                navigate('/cart')
                return
            }

            if (!token || !sessionId || !orderId) {
                return
            }

            const response = await axios.post(
                backendUrl + '/api/order/verifyStripe',
                { sessionId, orderId },
                { headers: { token } }
            )

            if (response.data.success && response.data.paid) {
                setCartItems({})
                navigate('/orders', { state: { paymentSuccess: true } })
            } else {
                toast.error(response.data.message || 'Payment not completed')
                navigate('/cart')
            }
        } catch (error) {
            console.log(error)
            toast.error(apiErrorMessage(error))
            navigate('/cart')
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [token])

    return (
        <div className='py-20 text-center text-gray-500 text-sm'>
            Confirming payment...
        </div>
    )
}

export default Verify
