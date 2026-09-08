# Status implementasi handover

Pemeriksaan terakhir: 9 September 2026. Docker Desktop tidak dijalankan karena komputer Ezra memiliki RAM 8 GB. Semua pemeriksaan container pada tahap ini hanya memeriksa sintaks Compose. Pengujian runtime container dipindahkan ke VPS.

## Sudah dibuat

- `Dockerfile` memakai Node.js 22 dan menjalankan hasil build dari `dist/src/main.js`.
- `.dockerignore` mencegah env, CSV, hasil build lokal, dan folder kerja masuk image.
- `compose.yaml` memuat backend, Redis 8.10.1, dan Elasticsearch 9.5.1.
- `.env.example` menyediakan tempat untuk konfigurasi ACSA tanpa nilai aktif.
- Konfigurasi production diperiksa saat aplikasi mulai.
- Domain CORS production dibaca dari env.
- Redis menyimpan daftar serta detail produk selama 300 detik secara default.
- Perubahan katalog dan stok menaikkan versi cache.
- Elasticsearch mencari produk ketika query `search` terisi.
- Pencarian kembali ke PostgreSQL saat Elasticsearch tidak tersedia.
- Perintah `npm run search:reindex` mengisi ulang indeks dari PostgreSQL.
- Route tambah, ubah, dan hapus tipe AC sekarang memerlukan role admin.
- Penghapusan gambar produk memeriksa pemilik gambar serta mengambil path Storage secara lengkap.
- Route `GET /api/health` tersedia untuk healthcheck container.
- Dokumentasi README, deployment VPS, dan transfer Supabase sudah ditulis.
- Panduan membaca kode, database, dan inventaris 104 endpoint sudah ditulis di `docs/handover`.
- Generator Postman menghasilkan 19 folder dan 104 request tanpa duplikasi method serta URL.
- Perubahan profil kini dibatasi ke pemilik akun atau admin. DTO profil tidak lagi menerima perubahan role.
- Migrasi tambahan menyelaraskan database tujuan baru dengan schema sekarang.

## Hasil pemeriksaan

| Pemeriksaan | Hasil | Batas hasil |
| --- | --- | --- |
| TypeScript tanpa emit | Lulus | Tidak membuka koneksi layanan |
| `npm run build` | Lulus | Menghasilkan `dist/src/main.js` dan script reindex |
| Compose config | Lulus | Docker engine dan container tidak dijalankan |
| Unit test terarah | 4 suite lulus, 10 test lulus | Menguji konfigurasi, controller utama, alur cache produk, dan izin perubahan profil dengan mock |
| Lint perubahan baru | Lulus | Memeriksa cache, search, konfigurasi, produk yang diubah, entrypoint, dan pembatasan profil |
| Seluruh unit test | 5 suite lulus, 35 suite gagal | Kebanyakan test lama tidak menyediakan service atau mock dependency |
| Audit npm saat instalasi | 43 temuan: 2 low, 16 moderate, 24 high, 1 critical | Belum dipisahkan antara dependency production dan development; belum diperbaiki otomatis |

## Belum bisa dinyatakan selesai

Container belum pernah dibuild atau dinyalakan. Koneksi Redis dan Elasticsearch belum diuji dengan service nyata. Migrasi tambahan belum diterapkan ke database percobaan. CSV serta gambar juga belum dipindahkan.

Deployment menunggu VPS dan env ACSA. Pengujian Midtrans menunggu kunci yang akan diisi Nando. SMTP serta proyek Supabase tujuan juga belum tersedia pada sesi ini.

Koleksi Postman sudah berisi 104 request. Contoh response aktual belum disimpan karena backend tujuan belum berjalan. Isi collection sudah diperiksa agar tidak membawa token JWT, service role, atau kunci pembayaran aktif.

## Pemeriksaan pertama di VPS

1. Jalankan `docker compose config` dan periksa service tanpa menyebarkan keluarannya.
2. Build melalui `docker compose build`.
3. Jalankan `docker compose up -d`, lalu tunggu ketiga service sehat.
4. Terapkan migrasi pada database tujuan kosong yang sudah disetujui.
5. Impor CSV dan gambar, kemudian jalankan reindex.
6. Uji mode cadangan dengan menghentikan Redis dan Elasticsearch satu per satu.
7. Jalankan Postman memakai akun serta data uji ACSA.

Jangan menjalankan migrasi handover pada Supabase lama sebelum struktur database tabel aktif dibandingkan dengan SQL migrasi. Database lama mungkin sudah mendapat perubahan melalui `db push` atau SQL manual.
