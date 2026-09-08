# ACSA Backend

Repositori ini berisi API untuk website ACSA. API adalah pintu yang dipakai frontend untuk membaca produk, mendaftarkan pengguna, membuat pesanan, mengunggah gambar, dan menjalankan pekerjaan lain yang membutuhkan database.

Backend dibuat dengan NestJS dan TypeScript. Data bisnis disimpan di PostgreSQL Supabase. File gambar masuk ke Supabase Storage. Midtrans menangani pembayaran, sedangkan SMTP mengirim email verifikasi.

Versi handover menambahkan Redis untuk cache katalog dan Elasticsearch untuk pencarian produk. Keduanya disiapkan melalui Docker Compose pada VPS. Docker Desktop tidak dibutuhkan untuk membaca kode atau menjalankan unit test di komputer lokal.

## Cara permintaan diproses

Saat frontend meminta daftar produk, alurnya seperti ini:

1. Controller menerima permintaan `GET /api/products`.
2. DTO memeriksa query seperti halaman, harga, merek, dan kata pencarian.
3. Service mencoba membaca respons dari Redis.
4. Jika ada kata pencarian, Elasticsearch mencari ID produk yang cocok.
5. Prisma mengambil data lengkap dari PostgreSQL.
6. Backend mengirim JSON ke frontend dan menyimpan salinannya di Redis untuk beberapa menit.

PostgreSQL tetap menjadi acuan harga dan stok saat pesanan dibuat. Redis boleh kehilangan seluruh isinya tanpa menghilangkan data bisnis. Indeks Elasticsearch juga dapat dibangun ulang dari PostgreSQL.

## Folder utama

| Lokasi | Isi |
| --- | --- |
| `src/main.ts` | Titik awal aplikasi, CORS, prefix `/api`, validasi global, dan port |
| `src/app.module.ts` | Daftar modul yang dipasang ke aplikasi |
| `src/<fitur>/*.controller.ts` | Route HTTP yang menerima permintaan |
| `src/<fitur>/*.service.ts` | Aturan dan proses tiap fitur |
| `src/<fitur>/dto` | Bentuk serta validasi data masukan |
| `src/prisma` | Koneksi backend ke PostgreSQL |
| `src/cache` | Koneksi Redis dan versi cache katalog |
| `src/search` | Koneksi Elasticsearch, pencarian, sinkronisasi, serta reindex |
| `prisma/schema.prisma` | Bentuk tabel dan hubungan data yang dipakai kode |
| `prisma/migrations` | Urutan perubahan struktur database |
| `compose.yaml` | Service backend, Redis, dan Elasticsearch untuk VPS |

## Persiapan lokal

Gunakan Node.js 22 atau versi yang dinyatakan cocok setelah pengujian tim. Dependensi dipasang dari lockfile supaya versi paket sama:

```bash
npm ci
```

Salin `.env.example` menjadi `.env`, lalu isi layanan pengembangan. Jangan memasukkan `.env` ke Git.

Generate Prisma Client dan jalankan backend:

```bash
npx prisma generate
npm run start:dev
```

Alamat lokal bawaan:

```text
http://localhost:3000/api
```

Endpoint root berada di `GET /api` dan mengembalikan `Hello World!`. Respons itu hanya pemeriksaan bahwa proses NestJS hidup. Koneksi database, email, storage, cache, pencarian, dan pembayaran perlu diuji terpisah.

## Perintah proyek

| Perintah | Kegunaan |
| --- | --- |
| `npm run start:dev` | Menjalankan backend dan membaca ulang kode saat file berubah |
| `npm run build` | Menghasilkan JavaScript di folder `dist` |
| `npm run start:prod` | Menjalankan hasil build dari `dist/src/main.js` |
| `npm test` | Menjalankan unit test |
| `npm run test:e2e` | Menjalankan test HTTP; periksa koneksi layanan sebelum memakainya |
| `npm run search:reindex` | Mengisi ulang indeks produk setelah build dan setelah Elasticsearch tersedia |
| `npm run lint` | Memeriksa serta mengubah file secara otomatis karena script memakai `--fix` |

Untuk memeriksa TypeScript tanpa mengubah file:

```bash
npx tsc --noEmit --incremental false -p tsconfig.build.json
```

## Menjalankan di VPS

Isi `.env` pada VPS, lalu jalankan:

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

Redis dan Elasticsearch tidak membuka port ke internet. Backend membuka port yang dipilih lewat `APP_PORT`. Pasang reverse proxy dan HTTPS sebelum alamat API dipakai frontend produksi.

Laptop dengan RAM 8 GB tidak perlu menjalankan Compose ini. Pemeriksaan sintaks dapat dilakukan tanpa menyalakan Docker engine:

```bash
docker compose --env-file .env.example config
```

## Konfigurasi

Semua nama pengaturan tersedia di `.env.example`. Nilai rahasia tetap berada di komputer developer atau env VPS.

Kelompok pengaturannya:

- `DATABASE_URL` dan `DIRECT_URL` untuk PostgreSQL Supabase.
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, serta `SUPABASE_STORAGE_BUCKET` untuk gambar.
- `JWT_SECRET` untuk token login.
- `MIDTRANS_*` untuk pembayaran.
- `SMTP_*` untuk email verifikasi.
- `REDIS_URL` dan `CACHE_*` untuk cache katalog.
- `ELASTICSEARCH_*` untuk pencarian produk.
- `FRONTEND_URL` serta `CORS_ALLOWED_ORIGINS` untuk alamat frontend yang boleh mengakses API.

Mode `production` menolak startup jika pengaturan layanan utama masih kosong. Nando mengisi kunci Midtrans, SMTP, Supabase, dan JWT milik ACSA pada VPS. Jangan menaruh nilainya di Postman collection.

## Cache dan pencarian

Cache katalog punya TTL awal 300 detik. Setiap perubahan pada produk atau data pendukung menaikkan versi cache. Respons lama dibiarkan kedaluwarsa dan tidak dibaca lagi.

Elasticsearch dipakai ketika query `search` terisi. Kalau koneksinya gagal, backend kembali memakai pencarian PostgreSQL yang sudah ada. Jalankan reindex sesudah impor CSV:

```bash
npm run build
npm run search:reindex
```

Di dalam container, gunakan perintah berikut:

```bash
docker compose exec api npm run search:reindex
```

## Dokumen handover

- [Panduan membaca kode](docs/handover/01-panduan-membaca-kode.md)
- [Database untuk pemula](docs/handover/02-database-untuk-pemula.md)
- [Inventaris 104 endpoint API](docs/handover/03-inventaris-api.md)
- [Deployment VPS](docs/deployment-vps.md)
- [Transfer data dan gambar Supabase](docs/transfer-supabase.md)
- [Status implementasi](docs/status-implementasi-handover.md)
- [Postman collection](acsa-backend.postman_collection.json)

Koleksi Postman memuat 104 endpoint yang ada di controller. Gunakan data uji. Contoh response masih perlu disimpan setelah pengujian di lingkungan ACSA. Hapus token aktif sebelum collection dikirim.

## Catatan migrasi

Riwayat migrasi lama tertinggal dari `schema.prisma`. Migrasi `20260909000000_sync_schema_for_handover` menambahkan bagian yang hilang untuk database tujuan baru. Jangan jalankan migrasi ini ke database Supabase lama sebelum membandingkan struktur tabel aktif. Database lama mungkin sudah menerima perubahan lewat `db push` atau SQL manual.

Untuk penyerahan yang direncanakan, siapkan database tujuan dari migrasi yang sudah diuji. Baru setelah itu impor CSV sesuai urutan dalam panduan transfer.
