import { useCart } from '../context/CartContext'

function formatRupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const outOfStock = product.stock <= 0

  return (
    <div className="card">
      <div className="card-media">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="card-media-placeholder" />
        )}
        {outOfStock && <span className="card-badge out">Stok Habis</span>}
      </div>
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <span className="card-name">{product.name}</span>
        <span className="card-price">{formatRupiah(product.price)}</span>
        <button
          className="card-add"
          disabled={outOfStock}
          onClick={() => addItem(product)}
        >
          {outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
      </div>
    </div>
  )
}
