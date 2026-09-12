import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

const STATUS_OPTIONS = ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan']

function formatRupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadOrders() {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (active) {
        if (!error) setOrders(data ?? [])
        setLoading(false)
      }
    }

    loadOrders()

    // Berlangganan perubahan real-time pada tabel orders
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new, ...prev]
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((o) => (o.id === payload.new.id ? payload.new : o))
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((o) => o.id !== payload.old.id)
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  async function updateStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) alert('Gagal mengubah status: ' + error.message)
  }

  return (
    <div className="admin-panel">
      <div className="live-dot">
        <span className="dot-pulse" /> Terhubung real-time — pesanan baru muncul otomatis
      </div>

      {loading ? (
        <p>Memuat pesanan…</p>
      ) : orders.length === 0 ? (
        <p className="drawer-empty">Belum ada pesanan masuk.</p>
      ) : (
        <div className="order-table">
          {orders.map((order) => (
            <div className="order-row" key={order.id}>
              <div className="order-row-head">
                <div>
                  <span className="order-id">#{order.id.slice(0, 8)}</span>
                  <span className="order-email">{order.customer_email}</span>
                </div>
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
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className={`status-select status-${order.status}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
