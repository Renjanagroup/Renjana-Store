-- =========================================================
-- RENJANA STORE — TAMBAHAN: DATA PENGIRIMAN & PEMBAYARAN MANUAL
-- Jalankan file ini di Supabase SQL Editor (New query), SETELAH schema.sql
-- =========================================================

-- 1. Tambah kolom nomor HP & alamat di profil (dipakai ulang tiap checkout)
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;

drop policy if exists "Admin bisa lihat semua profil" on public.profiles;
create policy "Admin bisa lihat semua profil"
  on public.profiles for select
  using (public.is_admin());

-- 2. Tambah kolom data pengiriman & pembayaran di tabel orders
alter table public.orders add column if not exists shipping_phone text;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists payment_proof_path text;
alter table public.orders add column if not exists payment_status text
  not null default 'menunggu_verifikasi'
  check (payment_status in ('menunggu_verifikasi', 'dibayar', 'ditolak'));

-- =========================================================
-- 3. STORAGE — bucket khusus bukti transfer (PRIVAT, bukan public)
-- Buat dulu manual di Dashboard > Storage > New bucket
-- Nama: payment-proofs | Public bucket: MATIKAN (biar tidak sembarang orang bisa lihat)
-- Baru setelah itu jalankan policy di bawah ini.
-- =========================================================

drop policy if exists "User bisa upload bukti bayar sendiri" on storage.objects;
create policy "User bisa upload bukti bayar sendiri"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "User lihat bukti bayar sendiri, admin lihat semua" on storage.objects;
create policy "User lihat bukti bayar sendiri, admin lihat semua"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
