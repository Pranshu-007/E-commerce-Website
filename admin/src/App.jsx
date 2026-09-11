import { useEffect, useState } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import Navbar from './components/Navbar'

import Sidebar from './components/Sidebar'

import PageTransition from './components/PageTransition'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Add from './pages/Add'

import List from './pages/List'

import Orders from './pages/Orders'

import Edit from './pages/Edit'

import Dashboard from './pages/Dashboard'

import Coupons from './pages/Coupons'
import Subscribers from './pages/Subscribers'
import Reviews from './pages/Reviews'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'

import Login from './components/Login'

import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

import { EASE_OUT } from './utils/motion'



export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export const currency = '$'



const AdminRoutes = ({ token }) => {

  const location = useLocation()



  return (

    <AnimatePresence mode="wait">

      <PageTransition key={location.pathname}>

        <Routes location={location}>

          <Route path='/' element={<Navigate to='/dashboard' replace />} />

          <Route path='/dashboard' element={<Dashboard token={token} />} />

          <Route path='/add' element={<Add token={token} />} />

          <Route path='/list' element={<List token={token} />} />

          <Route path='/edit/:id' element={<Edit token={token} />} />

          <Route path='/orders' element={<Orders token={token} />} />

          <Route path='/coupons' element={<Coupons token={token} />} />
          <Route path='/subscribers' element={<Subscribers token={token} />} />
          <Route path='/reviews' element={<Reviews token={token} />} />
          <Route path='/customers' element={<Customers token={token} />} />
          <Route path='/inventory' element={<Inventory token={token} />} />

        </Routes>

      </PageTransition>

    </AnimatePresence>

  )

}



const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')

  const reduceMotion = useReducedMotion()



  useEffect(() => {

    localStorage.setItem('token', token)

  }, [token])



  return (

    <div className='bg-gray-50 min-h-screen'>

      <ToastContainer />

      <AnimatePresence mode="wait">

        {token === '' ? (

          <motion.div

            key="login"

            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}

            animate={{ opacity: 1, scale: 1 }}

            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}

            transition={{ duration: 0.3, ease: EASE_OUT }}

          >

            <Login setToken={setToken} />

          </motion.div>

        ) : (

          <motion.div

            key="admin"

            initial={reduceMotion ? false : { opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={{ duration: 0.25 }}

          >

            <Navbar setToken={setToken} />

            <hr />

            <div className='flex w-full'>

              <Sidebar />

              <div className='flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8'>

                <AdminRoutes token={token} />

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  )

}



export default App

