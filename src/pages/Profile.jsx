import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, address')
        .eq('id', user.id)
        .single()

      if (active) {
        if (!error && data) {
          setForm({ phone: data.phone || '', address: data.address || '' })
        }
        setLoading(false)
      }
    }

    if (user) loadProfile()
    return () => { active = false }
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ phone: form.phone, address: form.address })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setMessage('Gagal menyimpan: ' + error.message)
      return
    }

    setMessage('Berhasil disimpan.')
  }

  return (
    <section className="section wrap auth-section">
      <div className="auth-card">
        <div className="hero-eyebrow">akun saya</div>
        <h2>Profil</h2>
        <p className="auth-sub">
          Data ini dipakai otomatis setiap kali kamu checkout, jadi tidak perlu isi ulang.
        </p>

        {loading ? (
          <p>Memuat…</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" value={user?.email || ''} disabled />
            </label>
            <label>
              Nomor HP / WhatsApp
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </label>
            <label>
              Alamat Pengiriman Lengkap
              <textarea
                rows={4}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
              />
            </label>
            <button className="btn-primary btn-full" disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
            </button>
          </form>
        )}

        {message && <p className="auth-message">{message}</p>}
      </div>
    </section>
  )
}
