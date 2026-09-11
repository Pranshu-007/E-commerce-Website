import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount, discount, couponCode } = useContext(ShopContext)
  const subtotal = getCartAmount()
  const total = subtotal === 0 ? 0 : Math.max(0, subtotal + delivery_fee - discount)

  const rows = [
    { label: 'Subtotal', value: `${currency} ${subtotal}.00` },
    { label: 'Shipping', value: `${currency} ${delivery_fee}.00` },
  ]

  if (discount > 0) {
    rows.push({
      label: `Discount ${couponCode ? `(${couponCode})` : ''}`,
      value: `- ${currency} ${discount}.00`,
      accent: true,
    })
  }

  return (
    <div>
      <h3 className="font-display text-xl text-brand-900 mb-6">Order Summary</h3>
      <div className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className={`flex justify-between ${row.accent ? 'text-emerald-600' : 'text-brand-600'}`}>
            <span>{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </div>
        ))}
        <div className="divider-fade my-4" />
        <div className="flex justify-between text-base font-semibold text-brand-900">
          <span>Total</span>
          <span>{currency} {total}.00</span>
        </div>
      </div>
    </div>
  )
}

export default CartTotal
