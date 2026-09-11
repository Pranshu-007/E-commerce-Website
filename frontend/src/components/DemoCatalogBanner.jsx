import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const DemoCatalogBanner = () => {
  const { demoCatalog } = useContext(ShopContext)

  if (!demoCatalog) return null

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 sm:text-sm">
      Demo catalog is active — products are loaded from Fake Store API. Cart and checkout are disabled until you switch back to your products in the admin panel.
    </div>
  )
}

export default DemoCatalogBanner
