import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './index.css'

// BrowserRouter dipakai (bukan HashRouter) karena Supabase mengirim token
// login lewat bagian "#" di URL saat user klik link di email. Kalau kita
// juga pakai "#" untuk routing (HashRouter), keduanya akan bentrok dan
// proses login gagal diam-diam.
// Trik SPA di public/404.html menangani agar navigasi tetap jalan di GitHub Pages.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/Renjana-Store">
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
