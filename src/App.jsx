import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Collection from './pages/Collection'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/masuk" element={<Login />} />
          <Route
            path="/koleksi"
            element={
              <ProtectedRoute>
                <Collection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="produk" element={<AdminProducts />} />
          </Route>
        </Routes>
      </main>
      <CartDrawer />
    </>
  )
}
