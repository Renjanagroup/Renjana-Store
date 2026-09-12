import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  if (user) {
    navigate('/koleksi')
  }

  async function handleSendCode(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    setLoading(false)

    if (error) {
      setMessage('Gagal mengirim kode: ' + error.message)
      return
    }

    setStep('code')
    setMessage('Kode 6 digit sudah dikirim ke email kamu. Cek juga folder spam ya.')
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    setLoading(false)

    if (error) {
      setMessage('Kode salah atau kedaluwarsa: ' + error.message)
      return
    }

    navigate('/koleksi')
  }

  return (
    <section className="section wrap auth-section">
      <div className="auth-card">
        <div className="hero-eyebrow">akses anggota</div>
        <h2>{step === 'email' ? 'Masuk / Daftar' : 'Masukkan Kode'}</h2>
        <p className="auth-sub">
          {step === 'email'
            ? 'Cukup pakai email, tanpa kata sandi. Kalau email kamu belum terdaftar, akun akan otomatis dibuat.'
            : `Kami sudah mengirim kode 6 digit ke ${email}.`}
        </p>

        {step === 'email' ? (
          <form className="auth-form" onSubmit={handleSendCode}>
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
              {loading ? 'Mengirim…' : 'Kirim Kode'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyCode}>
            <label>
              Kode 6 digit
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </label>
            <button className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Memverifikasi…' : 'Masuk'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => { setStep('email'); setMessage('') }}
            >
              Ganti email
            </button>
          </form>
        )}

        {message && <p className="auth-message">{message}</p>}
      </div>
    </section>
  )
}
