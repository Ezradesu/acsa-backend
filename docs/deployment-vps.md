# Menjalankan ACSA Backend di VPS

Panduan ini ditujukan kepada Nando atau backend engineer yang melanjutkan proyek. Perintah memakai Docker Engine dan Docker Compose di VPS Linux. Docker Desktop di laptop Ezra tidak perlu dinyalakan.

## Yang perlu tersedia

Sebelum mulai, siapkan akses SSH, Git, Docker Engine, plugin Docker Compose, domain API, serta file `.env` milik ACSA. Catat RAM, CPU, disk, dan sistem operasi VPS. Elasticsearch memakai ruang disk untuk indeks dan 512 MB heap pada konfigurasi awal proyek.

Jangan kirim `.env` lewat repositori. Letakkan file itu langsung pada root proyek di VPS dengan akses baca terbatas untuk akun deployment.

## Menyiapkan proyek

Masuk ke VPS lewat SSH, ambil repositori, lalu pindah ke folder backend:

```bash
git clone URL_REPOSITORI_ACSA
cd acsa-backend
cp .env.example .env
```

Isi `.env`. Nilai `REDIS_URL` dan `ELASTICSEARCH_NODE` untuk Compose sudah diarahkan melalui nama service. Isi koneksi Supabase, JWT, domain frontend, SMTP, serta Midtrans milik ACSA.

Periksa hasil konfigurasi tanpa menyalakan container:

```bash
docker compose config
```

Perintah tersebut juga memperlihatkan hasil penggabungan env. Jangan menyalin keluarannya ke tiket atau chat karena nilainya dapat memuat password.

## Startup pertama

Build dan jalankan service:

```bash
docker compose up -d --build
docker compose ps
```

Status yang diharapkan: `redis` dan `elasticsearch` sehat, lalu `api` berjalan. Lihat log backend jika statusnya restart atau berhenti:

```bash
docker compose logs --tail=200 api
```

Lihat log layanan pendukung jika backend melaporkan koneksi gagal:

```bash
docker compose logs --tail=200 redis
docker compose logs --tail=200 elasticsearch
```

Jangan membuka port Redis 6379 atau Elasticsearch 9200 pada firewall publik. Keduanya hanya dipakai backend lewat jaringan Compose.

## Menyiapkan database dan indeks

Untuk database tujuan baru, terapkan migrasi setelah `DIRECT_URL` diperiksa:

```bash
docker compose exec api npx prisma migrate deploy
```

Impor data mengikuti [panduan transfer Supabase](transfer-supabase.md). Setelah data produk masuk, isi Elasticsearch:

```bash
docker compose exec api npm run search:reindex
```

Catat jumlah produk pada pesan hasil reindex. Bandingkan dengan jumlah row `Product` di PostgreSQL.

## Pemeriksaan setelah startup

Uji root API melalui port lokal VPS:

```bash
curl --fail http://127.0.0.1:3000/api
```

Setelah reverse proxy dan HTTPS siap, uji alamat publik. Lanjutkan dengan Postman untuk login, daftar produk, upload gambar, serta pembayaran sandbox.

Cache dan pencarian punya mode cadangan. Hentikan satu service saat jendela pengujian untuk membuktikannya:

```bash
docker compose stop redis
docker compose start redis
docker compose stop elasticsearch
docker compose start elasticsearch
```

Daftar produk harus tetap terbaca. Pencarian mungkin lebih lambat atau urutannya berubah ketika memakai PostgreSQL.

## Memperbarui aplikasi

Sebelum update, catat commit yang sedang berjalan:

```bash
git rev-parse HEAD
```

Ambil versi yang sudah disetujui, build ulang, lalu periksa status:

```bash
git pull
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 api
```

Jika update membawa migrasi baru, baca SQL migrasinya dan buat backup database lebih dulu. Jalankan `prisma migrate deploy` setelah tujuan koneksi dipastikan.

## Cara kembali ke versi sebelumnya

Catat commit lama sebelum update. Jika kode baru gagal dan tidak ada perubahan database yang sulit dibalik, checkout commit lama lalu build ulang:

```bash
git checkout COMMIT_LAMA
docker compose up -d --build
```

Rollback database perlu rencana terpisah. Jangan mengembalikan backup lama begitu saja setelah pengguna membuat pesanan baru, karena transaksi setelah backup akan hilang.

## Data yang bertahan saat container diganti

Data bisnis dan gambar berada di Supabase. Elasticsearch memakai volume `elasticsearch-data`. Redis tidak memakai persistence karena isinya hanya cache.

Perintah `docker compose down` menghentikan container tetapi mempertahankan volume. Jangan menambahkan opsi `-v` pada server produksi kecuali indeks Elasticsearch memang akan dihapus dan dibangun ulang.
