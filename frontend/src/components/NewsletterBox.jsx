import { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import ScrollReveal from './ScrollReveal'

const NewsletterBox = () => {
  const { backendUrl } = useContext(ShopContext)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(`${backendUrl}/api/newsletter`, { email })
      if (response.data.success) {
        toast.success(response.data.message)
        setEmail('')
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollReveal start="top 92%" variant="scale">
      <section className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 sm:px-12 sm:py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(154,52,18,0.25),transparent_50%)]" />
        <div className="relative mx-auto max-w-xl">
          <p className="eyebrow text-brand-400">Newsletter</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl text-white">
            Get 20% Off Your First Order
          </h2>
          <p className="mt-3 text-sm text-brand-400 leading-relaxed">
            Join our list for exclusive offers, early access to new arrivals, and style inspiration.
          </p>
          <form
            onSubmit={onSubmitHandler}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              className="input-field flex-1 border-brand-700 bg-brand-800/50 text-white placeholder:text-brand-500 focus:border-brand-500 focus:ring-brand-700"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="btn-primary bg-white text-brand-900 hover:bg-brand-100 shrink-0">
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </ScrollReveal>
  )
}

export default NewsletterBox
