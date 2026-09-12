import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function formatRupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

export default function CartDrawer() {
  const { items, total, isOpen, close, changeQty, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleCheckout() {
    if (!user) {
      close()
      navigate('/masuk')
      return
    }
    setPlacing(true)
    setErrorMsg('')

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_email: user.email,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
        total,
      })
      .select()
      .single()

    setPlacing(false)

    if (error) {
      setErrorMsg('Gagal membuat pesanan: ' + error.message)
      return
    }

    setPlacedOrder(data)
    clearCart()
  }

  function handleWhatsAppConfirm() {
    const waNumber = import.meta.env.VITE_STORE_WHATSAPP || '6281234567890'
    const lines = (placedOrder.items || [])
      .map((i) => `- ${i.name} x${i.qty}`)
      .join('%0A')
    const msg = `Halo Renjana Store, saya sudah membuat pesanan #${placedOrder.id.slice(0, 8)}%0A${lines}%0A%0ATotal: ${formatRupiah(placedOrder.total)}%0A%0AMohon konfirmasi ya. Terima kasih.`
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank')
  }

  function handleClose() {
    setPlacedOrder(null)
    close()
  }

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={handleClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>{placedOrder ? 'Pesanan Dibuat' : 'Keranjang'}</h3>
          <button className="drawer-close" onClick={handleClose}>&times;</button>
        </div>

        {placedOrder ? (
          <div className="drawer-success">
            <p>Pesanan kamu <strong>#{placedOrder.id.slice(0, 8)}</strong> sudah kami terima dan sedang menunggu diproses oleh tim kami.</p>
            <button className="checkout-btn" onClick={handleWhatsAppConfirm}>
              Konfirmasi via WhatsApp
            </button>
            <button className="btn-ghost-full" onClick={handleClose}>Lanjut Belanja</button>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {items.length === 0 ? (
                <div className="drawer-empty">Keranjang kamu masih kosong.</div>
              ) : (
                items.map((item) => (
                  <div className="drawer-item" key={item.id}>
                    <div className="mini-media">
                      {item.image_url ? <img src={item.image_url} alt={item.name} /> : null}
                    </div>
                    <div className="drawer-item-info">
                      <div className="name">{item.name}</div>
                      <div className="meta">{formatRupiah(item.price)}</div>
                      <div className="qty-row">
                        <button onClick={() => changeQty(item.id, -1)}>–</button>
                        <span>{item.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)}>+</button>
                        <button className="remove-btn" onClick={() => removeItem(item.id)}>Hapus</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="drawer-foot">
                <div className="drawer-total"><span>Total</span><span>{formatRupiah(total)}</span></div>
                {errorMsg && <p className="form-error">{errorMsg}</p>}
                <button className="checkout-btn" disabled={placing} onClick={handleCheckout}>
                  {placing ? 'Memproses…' : user ? 'Buat Pesanan' : 'Masuk untuk Memesan'}
                </button>
                <div className="checkout-hint">Pesanan masuk langsung ke admin secara real-time.</div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
