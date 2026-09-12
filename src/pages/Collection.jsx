import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['semua', 'atasan', 'bawahan', 'dress', 'aksesoris']

export default function Collection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('semua')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let active = true

    async function loadProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (active) {
        if (error) setErrorMsg(error.message)
        setProducts(data ?? [])
        setLoading(false)
      }
    }

    loadProducts()
    return () => { active = false }
  }, [])

  const filtered = filter === 'semua' ? products : products.filter((p) => p.category === filter)

  return (
    <section className="section wrap">
      <div className="section-head">
        <div>
          <h2>Koleksi Lengkap</h2>
          <p>Produk dikurasi dari supplier tepercaya, diperbarui rutin.</p>
        </div>
      </div>

      <div className="filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'semua' ? 'Semua' : cat[0].toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p>Memuat koleksi…</p>}
      {errorMsg && <p className="form-error">{errorMsg}</p>}
      {!loading && filtered.length === 0 && !errorMsg && (
        <p className="drawer-empty">Belum ada produk di kategori ini.</p>
      )}

      <div className="grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
