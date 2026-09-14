import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()

  // Kalau sudah login, langsung lempar ke halaman koleksi
  if (user) {
    return <Navigate to="/koleksi" replace />
  }

  async function handleSendLink(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Link di email akan langsung mengarahkan user ke /koleksi setelah berhasil masuk
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}koleksi`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
      },
    })

    setLoading(false)

    if (error) {
      setMessage('Gagal mengirim link: ' + error.message)
      return
    }

    setSent(true)
  }

  return (
    <section className="section wrap auth-section">
      <div className="auth-card">
        <div className="hero-eyebrow">akses anggota</div>
        <h2>Masuk / Daftar</h2>

        {!sent ? (
          <>
            <p className="auth-sub">
              Cukup pakai email, tanpa kata sandi. Kami akan kirim link masuk ke email kamu.
              Kalau email kamu belum terdaftar, akun akan otomatis dibuat.
            </p>
            <form className="auth-form" onSubmit={handleSendLink}>
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
              <button className="btn-primary btn-full" disabled={loading}>
                {loading ? 'Mengirim…' : 'Kirim Link Masuk'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-sub">
            <p>
              Link masuk sudah dikirim ke <strong>{email}</strong>. Buka email kamu dan klik
              tombol/link di dalamnya — kamu akan langsung masuk dan diarahkan ke halaman Koleksi.
            </p>
            <p style={{ marginTop: 12 }}>
              Tidak ketemu emailnya? Cek folder spam, atau{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => { setSent(false); setMessage('') }}
              >
                kirim ulang
              </button>.
            </p>
          </div>
        )}

        {message && <p className="auth-message">{message}</p>}
      </div>
    </section>
  )
}
