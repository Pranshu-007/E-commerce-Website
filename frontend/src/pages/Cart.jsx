import { useContext, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import AnimatedIcon from '../components/AnimatedIcon'
import { EASE_OUT } from '../utils/motion'

const Cart = () => {
  const { cartItems, cartProducts, currency, updateQuantity, navigate } = useContext(ShopContext)
  const [cartData, setCartData] = useState([])

  useEffect(() => {
    const tempData = []
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({ _id: items, size: item, quantity: cartItems[items][item] })
        }
      }
    }
    setCartData(tempData)
  }, [cartItems])

  return (
    <div>
      <Title text1="Your" text2="Cart" align="left" subtitle={cartData.length ? `${cartData.length} item(s)` : 'Your cart is empty'} />

      {cartData.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <p className="font-medium text-brand-800">Your cart is empty</p>
          <p className="mt-2 text-sm text-brand-500">Browse our collection and add something you love.</p>
          <button onClick={() => navigate('/collection')} className="btn-primary mt-6">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {cartData.map((item) => {
                const productData = cartProducts[item._id]
                if (!productData) return null
                const rowKey = `${item._id}-${item.size}`

                return (
                  <motion.div
                    key={rowKey}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="card flex flex-col gap-4 overflow-hidden p-4 sm:flex-row sm:items-center sm:gap-6"
                  >
                    <img
                      className="h-24 w-20 shrink-0 rounded-xl object-cover bg-brand-100 sm:h-28 sm:w-24"
                      src={productData.image[0]}
                      alt={productData.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-900 truncate">{productData.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-semibold">{currency}{productData.price}</span>
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                          Size {item.size}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:shrink-0">
                      <input
                        onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))}
                        className="input-field !w-20 !py-2 text-center"
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                      />
                      <AnimatedIcon
                        name="trash"
                        size="sm"
                        strokeColor="#57534e"
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="card-elevated h-fit p-6 lg:sticky lg:top-28">
            <CartTotal />
            <button onClick={() => navigate('/place-order')} className="btn-primary w-full mt-8">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
