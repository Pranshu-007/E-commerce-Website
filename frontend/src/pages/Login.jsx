import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'

const Login = () => {
  const [currentState, setCurrentState] = useState('Login')
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)
  const [name, setName] = useState('')
  const [password, setPasword] = useState('')
  const [email, setEmail] = useState('')

  const onForgotPassword = async () => {
    if (!email) {
      toast.error('Enter your email first')
      return
    }
    try {
      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, { email })
      if (response.data.success) toast.success(response.data.message)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(`${backendUrl}/api/user/register`, { name, email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(apiErrorMessage(error))
    }
  }

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10">
      <form onSubmit={onSubmitHandler} className="card-elevated w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">Welcome</p>
          <h1 className="font-display text-3xl text-brand-900">
            {currentState === 'Login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-brand-500">
            {currentState === 'Login'
              ? 'Access your orders, wishlist, and profile.'
              : 'Join Forever for a personalized shopping experience.'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {currentState !== 'Login' && (
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              className="input-field"
              placeholder="Full name"
              required
            />
          )}
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="input-field"
            placeholder="Email address"
            required
          />
          <input
            onChange={(e) => setPasword(e.target.value)}
            value={password}
            type="password"
            className="input-field"
            placeholder="Password"
            required
          />
        </div>

        <div className="mt-4 flex justify-between text-xs text-brand-500">
          <button type="button" onClick={onForgotPassword} className="hover:text-brand-900 transition-colors">
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() => setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login')}
            className="font-medium text-brand-800 hover:text-accent transition-colors"
          >
            {currentState === 'Login' ? 'Create account' : 'Sign in instead'}
          </button>
        </div>

        <button type="submit" className="btn-primary w-full mt-8">
          {currentState === 'Login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

export default Login
