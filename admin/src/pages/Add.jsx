import { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { apiErrorMessage } from '../utils/apiError'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Men')
  const [subCategory, setSubCategory] = useState('Topwear')
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [stock, setStock] = useState({})

  const toggleSize = (size) => {
    setSizes((prev) => {
      if (prev.includes(size)) {
        const nextStock = { ...stock }
        delete nextStock[size]
        setStock(nextStock)
        return prev.filter((item) => item !== size)
      }
      setStock((s) => ({ ...s, [size]: s[size] ?? 10 }))
      return [...prev, size]
    })
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify(sizes))
      formData.append('stock', JSON.stringify(stock))
      image1 && formData.append('image1', image1)
      image2 && formData.append('image2', image2)
      image3 && formData.append('image3', image3)
      image4 && formData.append('image4', image4)

      const response = await axios.post(`${backendUrl}/api/product/add`, formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
        setSizes([])
        setStock({})
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader title="Add Product" subtitle="Create a new item for your store catalog" />
      <form onSubmit={onSubmitHandler} className="admin-card max-w-3xl space-y-5 p-6">
        <FormField label="Product images" hint="Upload up to 4 images (first image is the main photo)">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((n) => {
              const img = { 1: image1, 2: image2, 3: image3, 4: image4 }[n]
              const setImg = { 1: setImage1, 2: setImage2, 3: setImage3, 4: setImage4 }[n]
              return (
                <label key={n} htmlFor={`image${n}`} className="cursor-pointer">
                  <img className="h-20 w-20 rounded-lg border border-dashed border-slate-300 object-cover" src={!img ? assets.upload_area : URL.createObjectURL(img)} alt={`Upload ${n}`} />
                  <input onChange={(e) => setImg(e.target.files[0])} type="file" id={`image${n}`} accept="image/*" hidden />
                </label>
              )
            })}
          </div>
        </FormField>

        <FormField label="Product name">
          <input onChange={(e) => setName(e.target.value)} value={name} className="admin-input" type="text" placeholder="e.g. Classic Cotton T-Shirt" required />
        </FormField>

        <FormField label="Description">
          <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="admin-input min-h-[100px]" placeholder="Describe fabric, fit, care instructions, and key features..." required />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Category">
            <select onChange={(e) => setCategory(e.target.value)} value={category} className="admin-input">
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </FormField>
          <FormField label="Sub category">
            <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className="admin-input">
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </FormField>
          <FormField label="Price (USD)">
            <input onChange={(e) => setPrice(e.target.value)} value={price} className="admin-input" type="number" min="1" placeholder="e.g. 49" required />
          </FormField>
        </div>

        <FormField label="Available sizes" hint="Click a size to enable it, then set stock below">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  sizes.includes(size) ? 'bg-pink-100 text-pink-900 ring-1 ring-pink-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FormField>

        {sizes.length > 0 && (
          <FormField label="Stock per size">
            <div className="flex flex-wrap gap-4">
              {sizes.map((size) => (
                <label key={size} className="text-sm text-slate-600">
                  {size}
                  <input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={stock[size] ?? 0}
                    onChange={(e) => setStock((prev) => ({ ...prev, [size]: e.target.value }))}
                    className="admin-input ml-2 w-24"
                  />
                </label>
              ))}
            </div>
          </FormField>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={bestseller} onChange={() => setBestseller((p) => !p)} />
          Mark as bestseller (shows on homepage)
        </label>

        <button type="submit" className="admin-btn">Add Product</button>
      </form>
    </div>
  )
}

export default Add
