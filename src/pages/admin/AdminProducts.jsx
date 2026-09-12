import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

const CATEGORIES = ['atasan', 'bawahan', 'dress', 'aksesoris']

const emptyForm = {
  name: '',
  category: 'atasan',
  price: '',
  stock: '',
  description: '',
}

function formatRupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function loadProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')

    try {
      let image_url = null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        image_url = publicUrlData.publicUrl
      }

      const { error: insertError } = await supabase.from('products').insert({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
        image_url,
      })

      if (insertError) throw insertError

      setForm(emptyForm)
      setImageFile(null)
      e.target.reset()
      loadProducts()
    } catch (err) {
      setErrorMsg('Gagal menyimpan produk: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(product) {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    loadProducts()
  }

  async function deleteProduct(product) {
    if (!confirm(`Hapus produk "${product.name}"?`)) return
    await supabase.from('products').delete().eq('id', product.id)
    loadProducts()
  }

  return (
    <div className="admin-panel admin-products">
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>Tambah Produk Baru</h3>

        <label>
          Nama Produk
          <input
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Contoh: Kemeja Linen Ansana"
          />
        </label>

        <div className="form-row">
          <label>
            Kategori
            <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Harga (Rp)
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="150000"
            />
          </label>
          <label>
            Stok
            <input
              type="number"
              required
              min="0"
              value={form.stock}
              onChange={(e) => updateField('stock', e.target.value)}
              placeholder="20"
            />
          </label>
        </div>

        <label>
          Deskripsi
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Bahan, ukuran, detail lainnya"
          />
        </label>

        <label>
          Foto Produk
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {errorMsg && <p className="form-error">{errorMsg}</p>}

        <button className="btn-primary btn-full" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan Produk'}
        </button>
      </form>

      <div className="product-list">
        <h3>Produk Tersimpan ({products.length})</h3>
        {loading ? (
          <p>Memuat…</p>
        ) : (
          products.map((p) => (
            <div className="product-row" key={p.id}>
              <div className="product-row-media">
                {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="card-media-placeholder" />}
              </div>
              <div className="product-row-info">
                <span className="card-name">{p.name}</span>
                <span className="card-cat">{p.category} · stok {p.stock}</span>
                <span className="card-price">{formatRupiah(p.price)}</span>
              </div>
              <div className="product-row-actions">
                <button className="mini-btn" onClick={() => toggleActive(p)}>
                  {p.is_active ? 'Sembunyikan' : 'Tampilkan'}
                </button>
                <button className="mini-btn danger" onClick={() => deleteProduct(p)}>Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
