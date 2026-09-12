-- =========================================================
-- RENJANA STORE — SKEMA SUPABASE
-- Jalankan seluruh isi file ini di Supabase Dashboard > SQL Editor
-- =========================================================

-- 1. PROFILES (menyimpan role: customer / admin)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Pengguna bisa lihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Pengguna bisa update profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: otomatis buat baris profile saat ada user baru daftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fungsi bantu: cek apakah user saat ini admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 2. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric not null default 0,
  stock int not null default 0,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Hanya user yang sudah login (sudah daftar via email) yang bisa lihat koleksi lengkap
create policy "User login bisa lihat produk"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "Admin bisa tambah produk"
  on public.products for insert
  with check (public.is_admin());

create policy "Admin bisa update produk"
  on public.products for update
  using (public.is_admin());

create policy "Admin bisa hapus produk"
  on public.products for delete
  using (public.is_admin());

-- 3. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  customer_email text not null,
  items jsonb not null,
  total numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "User bisa buat order sendiri"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "User bisa lihat order sendiri, admin lihat semua"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admin bisa update status order"
  on public.orders for update
  using (public.is_admin());

-- Aktifkan realtime untuk tabel orders (agar admin dashboard update otomatis)
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.products;

-- =========================================================
-- 4. STORAGE — jalankan setelah membuat bucket 'product-images'
-- Buat bucket dulu di Dashboard > Storage > New bucket
-- Nama: product-images | Public: YES
-- Baru setelah itu jalankan policy di bawah ini.
-- =========================================================

create policy "Publik bisa lihat gambar produk"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin bisa upload gambar produk"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin bisa hapus gambar produk"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- =========================================================
-- 5. JADIKAN AKUN KAMU ADMIN
-- Daftar dulu lewat website pakai email kamu, baru jalankan ini:
-- =========================================================
-- update public.profiles set role = 'admin' where email = 'emailkamu@contoh.com';
