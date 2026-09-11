import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const Edit = ({ token }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Men')
  const [subCategory, setSubCategory] = useState('Topwear')
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [stock, setStock] = useState({})
  const [existingImage, setExistingImage] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.post(`${backendUrl}/api/product/single?catalog=local`, { productId: id })
        const product = response.data.product
        if (!product) return
        setName(product.name)
        setDescription(product.description)
        setPrice(product.price)
        setCategory(product.category)
        setSubCategory(product.subCategory)
        setBestseller(Boolean(product.bestseller))
        setSizes(product.sizes || [])
        setStock(product.stock || {})
        setExistingImage(product.image?.[0] || '')
      } catch (error) {
        toast.error(apiErrorMessage(error))
      }
    }
    load()
  }, [id])

  const toggleSize = (size) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('id', id)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify(sizes))
      formData.append('stock', JSON.stringify(stock))
      const response = await axios.post(`${backendUrl}/api/product/update`, formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/list')
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader title="Edit Product" subtitle="Update product details and inventory" />
      <form onSubmit={onSubmit} className="admin-card max-w-3xl space-y-5 p-6">
        {existingImage && (
          <FormField label="Current image">
            <img src={existingImage} alt="" className="h-24 w-24 rounded-lg object-cover border" />
          </FormField>
        )}

        <FormField label="Product name">
          <input value={name} onChange={(e) => setName(e.target.value)} className="admin-input" placeholder="e.g. Slim Fit Denim Jacket" required />
        </FormField>

        <FormField label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="admin-input min-h-[100px]" placeholder="Update product description..." required />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
              <option>Men</option><option>Women</option><option>Kids</option>
            </select>
          </FormField>
          <FormField label="Sub category">
            <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="admin-input">
              <option>Topwear</option><option>Bottomwear</option><option>Winterwear</option>
            </select>
          </FormField>
          <FormField label="Price (USD)">
            <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="admin-input" placeholder="e.g. 79" />
          </FormField>
        </div>

        <FormField label="Sizes">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button key={size} type="button" onClick={() => toggleSize(size)} className={`rounded-lg px-4 py-2 text-sm ${sizes.includes(size) ? 'bg-pink-100 ring-1 ring-pink-300' : 'bg-slate-100'}`}>
                {size}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Stock per size">
          <div className="flex flex-wrap gap-4">
            {sizes.map((size) => (
              <label key={size} className="text-sm">
                {size}
                <input type="number" min="0" placeholder="Qty" value={stock[size] ?? 0} onChange={(e) => setStock((prev) => ({ ...prev, [size]: e.target.value }))} className="admin-input ml-2 w-24" />
              </label>
            ))}
          </div>
        </FormField>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={bestseller} onChange={() => setBestseller((p) => !p)} />
          Bestseller
        </label>

        <div className="flex gap-3">
          <button type="submit" className="admin-btn">Save Changes</button>
          <button type="button" onClick={() => navigate('/list')} className="admin-btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default Edit
