import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import DemoCatalogBanner from './components/DemoCatalogBanner'
import PageTransition from './components/PageTransition'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Home = lazy(() => import('./pages/Home'))
const Collection = lazy(() => import('./pages/Collection'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Product = lazy(() => import('./pages/Product'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'))
const Orders = lazy(() => import('./pages/Orders'))
const Profile = lazy(() => import('./pages/Profile'))
const Verify = lazy(() => import('./pages/Verify'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-900" />
      <p className="text-sm text-brand-500">Loading...</p>
    </div>
  </div>
)

const App = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-brand-100/80 bg-white/85 backdrop-blur-lg">
        <DemoCatalogBanner />
        <div className="page-container">
          <Navbar />
          <SearchBar />
        </div>
      </header>

      <main className="flex-1 page-container py-6 sm:py-8">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          toastClassName="!rounded-xl !shadow-card !text-sm"
        />
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Suspense fallback={<PageLoader />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product/:productId" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/place-order" element={<PlaceOrder />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}

export default App
