import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'

const emptyAddress = {
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
}

const Profile = () => {

  const { backendUrl, token, navigate } = useContext(ShopContext)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: { ...emptyAddress },
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const fetchProfile = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/user/profile', { headers: { token } })
      if (response.data.success) {
        const user = response.data.user
        setEmail(user.email)
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          address: { ...emptyAddress, ...user.address },
        })
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [token])

  const onChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const onPasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await axios.put(backendUrl + '/api/user/profile', formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    try {
      const response = await axios.post(
        backendUrl + '/api/user/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to change password')
    }
  }

  if (loading) {
    return <div className='py-20 text-center text-gray-500'>Loading profile...</div>
  }

  return (
    <div className='border-t pt-10 pb-16'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      <div className='flex flex-col lg:flex-row gap-10'>
        {/* Profile details */}
        <form onSubmit={handleProfileSubmit} className='flex-1 max-w-xl flex flex-col gap-4'>
          <h2 className='text-lg font-medium text-gray-800'>Personal Information</h2>

          <div>
            <label className='text-sm text-gray-600 mb-1 block'>Full Name</label>
            <input
              name='name'
              value={formData.name}
              onChange={onChange}
              className='w-full border border-gray-300 rounded px-3 py-2 outline-none'
              required
            />
          </div>

          <div>
            <label className='text-sm text-gray-600 mb-1 block'>Email</label>
            <input
              value={email}
              className='w-full border border-gray-200 rounded px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed'
              disabled
            />
            <p className='text-xs text-gray-400 mt-1'>Email cannot be changed</p>
          </div>

          <div>
            <label className='text-sm text-gray-600 mb-1 block'>Phone</label>
            <input
              name='phone'
              value={formData.phone}
              onChange={onChange}
              className='w-full border border-gray-300 rounded px-3 py-2 outline-none'
              placeholder='+1 234 567 8900'
            />
          </div>

          <h2 className='text-lg font-medium text-gray-800 mt-4'>Shipping Address</h2>

          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='text-sm text-gray-600 mb-1 block'>First Name</label>
              <input name='address.firstName' value={formData.address.firstName} onChange={onChange} className='w-full border border-gray-300 rounded px-3 py-2 outline-none' />
            </div>
            <div className='flex-1'>
              <label className='text-sm text-gray-600 mb-1 block'>Last Name</label>
              <input name='address.lastName' value={formData.address.lastName} onChange={onChange} className='w-full border border-gray-300 rounded px-3 py-2 outline-none' />
            </div>
          </div>

          <div>
            <label className='text-sm text-gray-600 mb-1 block'>Street Address</label>
            <input name='address.street' value={formData.address.street} onChange={onChange} className='w-full border border-gray-300 rounded px-3 py-2 outline-none' />
          </div>

          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='text-sm text-gray-600 mb-1 block'>City</label>
              <input name='address.city' value={formData.address.city} onChange={onChange} className='w-full border border-gray-300 rounded px-3 py-2 outline-none' />
            </div>
            <div className='flex-1'>
              <label className='text-sm text-gray-600 mb-1 block'>State</label>
              <input name='address.state' value={formData.address.state} onChange={onChange} className='w-full border border-gray-300 rounded px-3 py-2 outline-none' />
            </div>
          </div>

          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='text-sm text-gray-600 mb-1 block'>Zipcode</label>
              <input name='address.zipcode' value={formData.address.zipcode} onChange={onChange} className='w-full border border-gray-300 rounded px-3 py-2 outline-none' />
            </div>
            <div className='flex-1'>
              <label className='text-sm text-gray-600 mb-1 block'>Country</label>
              <input name='address.country' value={formData.address.country} onChange={onChange} className='w-full border border-gray-300 rounded px-3 py-2 outline-none' />
            </div>
          </div>

          <button
            type='submit'
            disabled={saving}
            className='bg-black text-white px-8 py-3 text-sm mt-4 w-fit disabled:opacity-50'
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handlePasswordSubmit} className='flex-1 max-w-xl flex flex-col gap-4'>
          <h2 className='text-lg font-medium text-gray-800'>Change Password</h2>

          <div>
            <label className='text-sm text-gray-600 mb-1 block'>Current Password</label>
            <input
              type='password'
              name='currentPassword'
              value={passwordData.currentPassword}
              onChange={onPasswordChange}
              className='w-full border border-gray-300 rounded px-3 py-2 outline-none'
              required
            />
          </div>

          <div>
            <label className='text-sm text-gray-600 mb-1 block'>New Password</label>
            <input
              type='password'
              name='newPassword'
              value={passwordData.newPassword}
              onChange={onPasswordChange}
              className='w-full border border-gray-300 rounded px-3 py-2 outline-none'
              minLength={8}
              required
            />
          </div>

          <div>
            <label className='text-sm text-gray-600 mb-1 block'>Confirm New Password</label>
            <input
              type='password'
              name='confirmPassword'
              value={passwordData.confirmPassword}
              onChange={onPasswordChange}
              className='w-full border border-gray-300 rounded px-3 py-2 outline-none'
              minLength={8}
              required
            />
          </div>

          <button type='submit' className='border border-black text-black px-8 py-3 text-sm mt-4 w-fit'>
            UPDATE PASSWORD
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
