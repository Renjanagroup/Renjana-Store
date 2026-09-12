import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <section className="section wrap">
      <div className="section-head">
        <div>
          <h2>Panel Admin</h2>
          <p>Kelola produk dan pantau pesanan secara real-time.</p>
        </div>
      </div>

      <div className="admin-tabs">
        <NavLink to="/admin" end className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
          Pesanan
        </NavLink>
        <NavLink to="/admin/produk" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
          Produk
        </NavLink>
      </div>

      <Outlet />
    </section>
  )
}
