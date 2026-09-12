import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <section className="hero wrap">
        <div>
          <div className="hero-eyebrow">pilihan terkurasi</div>
          <h1>Pakaian yang menyimpan rasa</h1>
          <p className="lead">
            Renjana berarti rindu yang dalam — begitu pula setiap pilihan kami: dikurasi dari
            supplier tepercaya, dipilih untuk dipakai bertahun-tahun, bukan semusim.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to="/koleksi" className="btn-primary">Lihat Koleksi Lengkap</Link>
            ) : (
              <Link to="/masuk" className="btn-primary">Daftar untuk Lihat Koleksi</Link>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
            <rect width="400" height="500" fill="#4E1B29" />
            <path d="M120 90 L200 60 L280 90 L260 150 L230 130 L230 420 L170 420 L170 130 L140 150 Z" fill="#F4EEE1" opacity="0.9" />
            <circle cx="200" cy="60" r="14" fill="#8A9178" />
            <path d="M0 500 L0 430 Q200 380 400 430 L400 500 Z" fill="#2A2420" opacity="0.5" />
          </svg>
          <div className="hero-tag">
            <span className="serif">Akses Anggota</span>
            Daftar dengan email untuk membuka koleksi penuh.
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="strip-track">
          <span>Daftar gratis, cukup email</span>
          <span>Koleksi diperbarui rutin</span>
          <span>Kirim ke seluruh Indonesia</span>
          <span>Pesanan diproses langsung oleh tim kami</span>
          <span>Daftar gratis, cukup email</span>
          <span>Koleksi diperbarui rutin</span>
          <span>Kirim ke seluruh Indonesia</span>
          <span>Pesanan diproses langsung oleh tim kami</span>
        </div>
      </div>

      <section className="section wrap">
        <div className="about">
          <div className="about-visual">
            <svg viewBox="0 0 400 400">
              <rect width="400" height="400" fill="#8A9178" />
              <circle cx="200" cy="150" r="55" fill="#F4EEE1" opacity="0.85" />
              <rect x="160" y="200" width="80" height="120" fill="#F4EEE1" opacity="0.85" />
            </svg>
          </div>
          <div>
            <h2>Dipilih dengan niat, bukan asal ikut tren</h2>
            <p>
              Kami tidak memproduksi sendiri. Setiap produk dikurasi satu per satu dari supplier
              tepercaya, lalu diperiksa kualitas bahan dan jahitannya sebelum ditawarkan.
            </p>
            <p>
              Koleksi lengkap hanya bisa dilihat oleh anggota terdaftar — cukup daftar dengan
              email, tanpa perlu kata sandi.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
