import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'daftar'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/koleksi" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (mode === 'daftar') {
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) {
        setMessage('Gagal daftar: ' + error.message)
        return
      }
      // Kalau "Confirm email" masih aktif di Supabase, sesi belum langsung ada.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage('Akun berhasil dibuat. Silakan masuk dengan email & password kamu.')
        setMode('login')
      }
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setMessage('Gagal masuk: ' + error.message)
    }
  }

  return (
    <section className="section wrap auth-section">
      <div className="auth-card">
        <div className="hero-eyebrow">akses anggota</div>
        <h2>{mode === 'login' ? 'Masuk' : 'Buat Akun'}</h2>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Masukkan email dan password kamu.'
            : 'Isi email dan buat password untuk membuat akun baru.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </label>
          <button className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <button
          type="button"
          className="link-btn"
          style={{ marginTop: 16 }}
          onClick={() => { setMode(mode === 'login' ? 'daftar' : 'login'); setMessage('') }}
        >
          {mode === 'login' ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
        </button>

        {message && <p className="auth-message">{message}</p>}
      </div>
    </section>
  )
}
