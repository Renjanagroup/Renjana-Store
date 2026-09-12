# Renjana Store

Website toko baju dengan:
- **Daftar/masuk pakai email saja** (kode OTP 6 digit, tanpa password) — dibutuhkan untuk melihat koleksi lengkap
- **Panel admin** untuk upload produk dan memantau pesanan **secara real-time**
- Dibangun dengan **React + Vite**, database & auth pakai **Supabase**, kode disimpan di **GitHub**

---

## 1. Setup Supabase (project kamu sudah ada)

1. Buka project Supabase kamu → **SQL Editor** → New query.
2. Salin seluruh isi file `supabase/schema.sql` di folder ini, tempel, lalu **Run**.
   Ini akan membuat tabel `profiles`, `products`, `orders`, trigger, dan aturan keamanan (RLS).
3. Buka **Storage** → **New bucket** → beri nama persis `product-images` → set **Public bucket = ON**.
4. Buka **Authentication → Providers → Email**, pastikan **Email OTP / Magic Link** aktif (biasanya sudah aktif secara default). Password login tidak dipakai di sini.
5. Buka **Project Settings → API**, salin:
   - `Project URL`
   - `anon public key`

## 2. Setup Project di Komputer

```bash
# masuk ke folder project
cd renjana-store

# copy contoh env, lalu isi dengan data dari Supabase
cp .env.example .env
```

Edit file `.env`:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=isi-anon-key-kamu
VITE_STORE_WHATSAPP=62812xxxxxxx
```

Install dependencies & jalankan:
```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## 3. Jadikan Akun Kamu sebagai Admin

1. Di website, klik **Masuk**, masukkan email kamu, lalu masukkan kode OTP yang dikirim ke email.
2. Setelah berhasil masuk, buka Supabase **SQL Editor**, jalankan:
   ```sql
   update public.profiles set role = 'admin' where email = 'emailkamu@contoh.com';
   ```
3. Refresh halaman website — menu **Admin** akan muncul di navbar.

Semua akun lain yang daftar otomatis berstatus `customer` dan hanya bisa melihat koleksi + membuat pesanan, tidak bisa mengakses panel admin.

## 4. Alur Penggunaan

**Untuk pelanggan:**
- Buka beranda → klik "Daftar untuk Lihat Koleksi" → masukkan email → masukkan kode OTP.
- Setelah masuk, halaman **Koleksi** menampilkan semua produk yang admin sudah tambahkan.
- Tambah ke keranjang → klik **Buat Pesanan** → pesanan otomatis tersimpan di database dan langsung muncul di dashboard admin (real-time, tanpa refresh).
- Setelah pesanan dibuat, ada tombol opsional **Konfirmasi via WhatsApp** untuk chat langsung ke toko.

**Untuk admin:**
- Menu **Admin → Produk**: isi form (nama, kategori, harga, stok, deskripsi, foto) → **Simpan Produk**. Foto otomatis ter-upload ke Supabase Storage.
- Menu **Admin → Pesanan**: daftar semua pesanan masuk, update otomatis saat ada pesanan baru (real-time lewat Supabase Realtime). Admin bisa ubah status: `pending → diproses → dikirim → selesai` (atau `dibatalkan`).

## 5. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: Renjana Store"
git branch -M main
git remote add origin https://github.com/USERNAME/renjana-store.git
git push -u origin main
```

> File `.env` **tidak ikut ter-push** (sudah ada di `.gitignore`) supaya kunci Supabase kamu tidak bocor ke publik.

## 6. Deploy Online

React perlu proses *build*, jadi paling gampang deploy lewat **Vercel** atau **Netlify** (keduanya gratis dan bisa connect langsung ke GitHub):

1. Buka [vercel.com](https://vercel.com) → **Add New Project** → pilih repo GitHub `renjana-store`.
2. Saat diminta **Environment Variables**, isi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STORE_WHATSAPP`
3. Klik **Deploy**. Setiap kali kamu `git push`, Vercel otomatis build & deploy ulang.

(Kalau tetap ingin pakai GitHub Pages, bisa, tapi perlu setup tambahan untuk *routing* SPA — Vercel/Netlify jauh lebih simpel untuk React.)

## Struktur Folder

```
renjana-store/
├── supabase/schema.sql       ← jalankan ini di Supabase SQL Editor
├── src/
│   ├── supabaseClient.js     ← koneksi ke Supabase
│   ├── context/
│   │   ├── AuthContext.jsx   ← status login & role user
│   │   └── CartContext.jsx   ← keranjang belanja
│   ├── components/           ← Navbar, ProductCard, CartDrawer, route guards
│   ├── pages/
│   │   ├── Home.jsx          ← beranda publik
│   │   ├── Login.jsx         ← daftar/masuk via email OTP
│   │   ├── Collection.jsx    ← koleksi lengkap (butuh login)
│   │   └── admin/            ← dashboard pesanan + kelola produk (khusus admin)
│   └── index.css
└── .env.example
```

## Catatan Keamanan

- Semua akses data diatur lewat **Row Level Security (RLS)** di Supabase — bukan hanya disembunyikan di tampilan. Artinya walau seseorang mencoba akses API langsung, aturan yang sama tetap berlaku.
- Hanya user dengan `role = 'admin'` di tabel `profiles` yang bisa menambah/menghapus produk atau mengubah status pesanan.
- Kunci `anon key` di file `.env` aman untuk dipakai di frontend (memang didesain publik), tapi tetap jangan commit ke repo publik tanpa alasan jelas.
