import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

function formatRupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

const STATUS_LABEL = {
  pending: 'Menunggu diproses',
  diproses: 'Sedang diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

const PAYMENT_LABEL = {
  menunggu_verifikasi: 'Menunggu verifikasi pembayaran',
  dibayar: 'Pembayaran dikonfirmasi',
  ditolak: 'Pembayaran ditolak',
}

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({ phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

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

  useEffect(() => {
    let active = true

    async function loadOrders() {
      setOrdersLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (active) {
        if (!error) setOrders(data ?? [])
        setOrdersLoading(false)
      }
    }

    if (user) loadOrders()

    // Update otomatis kalau admin mengubah status pesanan kita
    const channel = supabase
      .channel('my-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          setOrders((prev) => prev.map((o) => (o.id === payload.new.id ? payload.new : o)))
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
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
    <section className="section wrap">
      <div className="profile-layout">
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

        <div className="order-history">
          <h3 style={{ marginBottom: 16 }}>Riwayat Pesanan</h3>

          {ordersLoading ? (
            <p>Memuat pesanan…</p>
          ) : orders.length === 0 ? (
            <p className="drawer-empty">Belum ada pesanan.</p>
          ) : (
            <div className="order-table">
              {orders.map((order) => (
                <div className="order-row" key={order.id}>
                  <div className="order-row-head">
                    <span className="order-id">#{order.id.slice(0, 8)}</span>
                    <span className="order-total">{formatRupiah(order.total)}</span>
                  </div>
                  <ul className="order-items">
                    {(order.items || []).map((item, idx) => (
                      <li key={idx}>{item.name} × {item.qty}</li>
                    ))}
                  </ul>
                  <div className="order-row-foot">
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className={`status-select payment-${order.payment_status}`}>
                        {PAYMENT_LABEL[order.payment_status] || order.payment_status}
                      </span>
                      <span className={`status-select status-${order.status}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
