import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { paymentConfig } from '../storeConfig'

function formatRupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

export default function CartDrawer() {
  const { items, total, isOpen, close, changeQty, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // step: 'cart' | 'shipping' | 'payment' | 'done'
  const [step, setStep] = useState('cart')
  const [shipping, setShipping] = useState({ phone: '', address: '' })
  const [proofFile, setProofFile] = useState(null)
  const [loadingStep, setLoadingStep] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  function resetAndClose() {
    setStep('cart')
    setProofFile(null)
    setErrorMsg('')
    setPlacedOrder(null)
    close()
  }

  async function goToShipping() {
    if (!user) {
      close()
      navigate('/masuk')
      return
    }
    setErrorMsg('')
    setLoadingStep(true)

    // Ambil data HP & alamat yang mungkin sudah tersimpan dari checkout sebelumnya
    const { data } = await supabase
      .from('profiles')
      .select('phone, address')
      .eq('id', user.id)
      .single()

    setShipping({
      phone: data?.phone || '',
      address: data?.address || '',
    })
    setLoadingStep(false)
    setStep('shipping')
  }

  async function handleShippingSubmit(e) {
    e.preventDefault()
    setErrorMsg('')
    setLoadingStep(true)

    // Simpan ke profil supaya tidak perlu isi ulang di checkout berikutnya
    const { error } = await supabase
      .from('profiles')
      .update({ phone: shipping.phone, address: shipping.address })
      .eq('id', user.id)

    setLoadingStep(false)

    if (error) {
      setErrorMsg('Gagal menyimpan data pengiriman: ' + error.message)
      return
    }

    setStep('payment')
  }

  async function handlePaymentSubmit(e) {
    e.preventDefault()
    if (!proofFile) {
      setErrorMsg('Upload bukti transfer dulu ya.')
      return
    }
    setErrorMsg('')
    setLoadingStep(true)

    try {
      const fileExt = proofFile.name.split('.').pop()
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, proofFile)

      if (uploadError) throw uploadError

      const { data, error: insertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_email: user.email,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
          total,
          shipping_phone: shipping.phone,
          shipping_address: shipping.address,
          payment_proof_path: filePath,
          payment_status: 'menunggu_verifikasi',
        })
        .select()
        .single()

      if (insertError) throw insertError

      setPlacedOrder(data)
      clearCart()
      setStep('done')
    } catch (err) {
      setErrorMsg('Gagal mengirim pesanan: ' + err.message)
    } finally {
      setLoadingStep(false)
    }
  }

  function handleWhatsAppConfirm() {
    const lines = (placedOrder.items || []).map((i) => `- ${i.name} x${i.qty}`).join('%0A')
    const msg =
      `Halo Renjana Store, saya sudah transfer untuk pesanan #${placedOrder.id.slice(0, 8)}%0A${lines}%0A%0ATotal: ${formatRupiah(placedOrder.total)}%0A%0AMohon dicek dan diproses ya. Terima kasih.`
    window.open(`https://wa.me/${paymentConfig.whatsappNumber}?text=${msg}`, '_blank')
  }

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={resetAndClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>
            {step === 'cart' && 'Keranjang'}
            {step === 'shipping' && 'Data Pengiriman'}
            {step === 'payment' && 'Pembayaran'}
            {step === 'done' && 'Pesanan Dibuat'}
          </h3>
          <button className="drawer-close" onClick={resetAndClose}>&times;</button>
        </div>

        {/* STEP 1: KERANJANG */}
        {step === 'cart' && (
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
                <button className="checkout-btn" disabled={loadingStep} onClick={goToShipping}>
                  {loadingStep ? 'Memuat…' : user ? 'Lanjut ke Pengiriman' : 'Masuk untuk Memesan'}
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: DATA PENGIRIMAN */}
        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="drawer-items">
              <p className="auth-sub" style={{ marginBottom: 16 }}>
                Data ini akan tersimpan di akun kamu, jadi tidak perlu isi ulang di pesanan berikutnya.
              </p>
              <div className="auth-form">
                <label>
                  Nomor HP / WhatsApp
                  <input
                    type="tel"
                    required
                    value={shipping.phone}
                    onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                  />
                </label>
                <label>
                  Alamat Pengiriman Lengkap
                  <textarea
                    required
                    rows={4}
                    value={shipping.address}
                    onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                    placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
                  />
                </label>
              </div>
            </div>
            <div className="drawer-foot">
              {errorMsg && <p className="form-error">{errorMsg}</p>}
              <button type="button" className="btn-ghost-full" onClick={() => setStep('cart')}>
                Kembali
              </button>
              <button className="checkout-btn" disabled={loadingStep} style={{ marginTop: 10 }}>
                {loadingStep ? 'Menyimpan…' : 'Lanjut ke Pembayaran'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PEMBAYARAN */}
        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="drawer-items">
              <div className="payment-info">
                <div className="drawer-total" style={{ marginBottom: 14 }}>
                  <span>Total Bayar</span><span>{formatRupiah(total)}</span>
                </div>
                <p className="auth-sub">Transfer ke rekening berikut, lalu upload bukti transfernya:</p>
                <div className="payment-box">
                  <div><strong>{paymentConfig.bankName}</strong></div>
                  <div className="payment-number">{paymentConfig.accountNumber}</div>
                  <div>a.n. {paymentConfig.accountHolder}</div>
                </div>
                {paymentConfig.qrisImageUrl && (
                  <img src={paymentConfig.qrisImageUrl} alt="QRIS" style={{ marginTop: 14, borderRadius: 4 }} />
                )}
              </div>

              <label style={{ display: 'block', marginTop: 20 }}>
                Upload Bukti Transfer
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                  style={{ marginTop: 6 }}
                />
              </label>
            </div>
            <div className="drawer-foot">
              {errorMsg && <p className="form-error">{errorMsg}</p>}
              <button type="button" className="btn-ghost-full" onClick={() => setStep('shipping')}>
                Kembali
              </button>
              <button className="checkout-btn" disabled={loadingStep} style={{ marginTop: 10 }}>
                {loadingStep ? 'Mengirim…' : 'Kirim Bukti & Buat Pesanan'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SELESAI */}
        {step === 'done' && placedOrder && (
          <div className="drawer-success">
            <p>
              Pesanan kamu <strong>#{placedOrder.id.slice(0, 8)}</strong> sudah kami terima.
              Bukti transfer sedang diverifikasi oleh tim kami.
            </p>
            <button className="checkout-btn" onClick={handleWhatsAppConfirm}>
              Konfirmasi via WhatsApp
            </button>
            <button className="btn-ghost-full" onClick={resetAndClose}>Lanjut Belanja</button>
          </div>
        )}
      </div>
    </>
  )
}
