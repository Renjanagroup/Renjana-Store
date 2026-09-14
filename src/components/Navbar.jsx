import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { count, open, clearCart } = useCart()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    clearCart() // keranjang tidak boleh terbawa ke akun berikutnya
    navigate('/')
  }

  return (
    <header className="header">
      <nav className="nav wrap">
        <Link to="/">
          <img src={logo} alt="Renjana Store" className="logo-img" />
        </Link>
        <div className="nav-links">
          <Link to="/">Beranda</Link>
          <Link to="/koleksi">Koleksi</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
        </div>
        <div className="nav-actions">
          <button className="cart-btn" onClick={open}>
            Keranjang<span className="cart-count">{count}</span>
          </button>
          {user ? (
            <button className="link-btn" onClick={handleSignOut}>Keluar</button>
          ) : (
            <Link to="/masuk" className="btn-primary btn-small">Masuk</Link>
          )}
        </div>
      </nav>
    </header>
  )
}
