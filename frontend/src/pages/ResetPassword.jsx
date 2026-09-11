import { useContext, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'

const ResetPassword = () => {
  const { backendUrl } = useContext(ShopContext)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(backendUrl + '/api/user/reset-password', {
        token,
        newPassword: password,
      })
      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/login')
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <form onSubmit={onSubmit} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <p className='prata-regular text-3xl'>Reset password</p>
      <input
        type='password'
        minLength={8}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='New password'
      />
      <button className='bg-black text-white px-8 py-2'>UPDATE PASSWORD</button>
    </form>
  )
}

export default ResetPassword
