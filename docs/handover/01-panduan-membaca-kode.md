# Panduan membaca kode ACSA Backend

Dokumen ini ditulis untuk orang/ agents yang baru membuka proyek. Readers tidak harus hafal NestJS atau Prisma. Mulailah dari satu contoh sederhana: pengguna membuka halaman produk, lalu frontend meminta data ke backend.

Alamat yang dipanggil frontend berbentuk `GET /api/products`. Kata `GET` berarti membaca. Bagian `/api/products` menunjukkan tujuan permintaan. Backend menerima permintaan itu, memeriksa isi query, membaca data, lalu mengirim jawaban JSON.

## Lima istilah yang sering muncul

API adalah aturan komunikasi antara frontend dan backend. Endpoint adalah satu alamat beserta HTTP method-nya, misalnya `POST /api/auth/login`. Request adalah data yang dikirim pemanggil. Response adalah jawaban backend. JSON adalah bentuk teks terstruktur yang dipakai untuk membawa data.

Di proyek ini, satu fitur biasanya mempunyai tiga lapisan:

1. Controller menerima request HTTP. File ini menentukan alamat, method, dan kebutuhan login.
2. DTO memeriksa bentuk input. DTO dapat menolak angka, teks, atau isian wajib yang salah sebelum service dijalankan.
3. Service menjalankan aturan fitur dan memanggil Prisma, Supabase Storage, Midtrans, Redis, atau Elasticsearch.

Prisma mengubah pemanggilan TypeScript menjadi query PostgreSQL. Guard memeriksa identitas atau role. Interceptor file membaca unggahan `multipart/form-data`. Module mendaftarkan komponen agar NestJS dapat membuat dan menghubungkannya.

## Titik awal aplikasi

Proses Node.js mulai dari `src/main.ts`. Urutannya:

1. NestJS membuat aplikasi berdasarkan `AppModule`.
2. `ConfigModule` membaca `.env` dan memeriksa env production.
3. CORS menentukan alamat frontend yang boleh mengakses API.
4. Prefix global `/api` dipasang. Route controller `products` akhirnya menjadi `/api/products`.
5. `ValidationPipe` menghapus properti input yang tidak ada di DTO dan mengubah tipe jika decorator mendukungnya.
6. Server mendengarkan `PORT`, dengan nilai awal 3000.

`src/app.module.ts` adalah daftar isi aplikasi. Jika sebuah modul tidak ada di bagian `imports`, controller di dalam modul tersebut tidak ikut hidup.

Route `GET /api/health` hanya membuktikan proses NestJS merespons. Route itu belum membuktikan PostgreSQL, Redis, Elasticsearch, SMTP, Storage, atau Midtrans sehat.

## Contoh alur daftar produk

Buka file berikut secara berurutan:

1. `src/products/products.controller.ts`
2. `src/products/dto/query-product.dto.ts`
3. `src/products/products.service.ts`
4. `src/cache/catalog-cache.service.ts`
5. `src/search/product-search.service.ts`
6. `src/prisma/prisma.service.ts`
7. `prisma/schema.prisma`

Controller menerima query dari URL. Contoh:

```text
GET /api/products?search=daikin&page=1&limit=10&sortBy=price&sortOrder=asc
```

`QueryProductDto` membatasi `page` mulai dari 1 dan `limit` sampai 100. Service membuat identitas cache dari query tersebut. Jika Redis mempunyai salinannya, response langsung dikembalikan.

Jika cache kosong dan `search` terisi, Elasticsearch mencari ID produk. Prisma kemudian mengambil row lengkap berdasarkan ID tadi. Langkah kedua tetap dibutuhkan karena PostgreSQL adalah sumber data produk, harga, stok, relasi, dan gambar.

Kalau Elasticsearch tidak dapat dihubungi, service memakai pencarian `contains` di PostgreSQL. Kalau Redis mati, service melewati cache. Dua kegagalan itu seharusnya membuat permintaan lebih lambat atau urutannya sedikit berbeda, tetapi tidak langsung mematikan katalog.

## Contoh alur login

`POST /api/auth/login` masuk ke `AuthController.login`, kemudian ke `AuthService.login`.

Service mencari pengguna berdasarkan email. Password dari request dibandingkan dengan hash bcrypt di database. Login ditolak jika email belum diverifikasi. Saat lolos, backend membuat JWT yang berisi ID, email, dan role.

Request yang dilindungi mengirim token seperti ini:

```http
Authorization: Bearer TOKEN_HASIL_LOGIN
```

`JwtGuard` membaca header itu melalui `JwtStrategy`. Strategy memeriksa tanda tangan token dengan `JWT_SECRET`, lalu mencari pengguna di database. Pemeriksaan database membuat token milik pengguna yang sudah dihapus tidak dapat dipakai lagi.

`RolesGuard` bekerja setelah `JwtGuard`. Decorator `@Roles('admin')` berarti role pengguna harus persis `admin`.

## Contoh alur pesanan dan pembayaran

Pengguna login memanggil `POST /api/orders` dengan daftar produk dan jumlah. `OrdersService` menjalankan langkah ini:

1. Membaca produk dari PostgreSQL.
2. Memastikan setiap produk ada dan stok awal cukup.
3. Menghitung total dari harga yang tersimpan di database. Harga dari frontend tidak dipercaya.
4. Membuat order, membuat item order, dan mengurangi stok dalam transaksi Prisma.
5. Meminta Snap token ke Midtrans.
6. Menyimpan token serta URL pembayaran jika Midtrans menjawab.

Jika pembuatan transaksi Midtrans gagal, order sudah telanjur tercatat dan stok sudah berkurang. Kode mengembalikan order tanpa Snap token. Belum ada endpoint khusus untuk mencoba membuat Snap token lagi. Kondisi ini perlu diketahui saat menguji dan menangani tiket pengguna.

Midtrans memanggil `POST /api/orders/payment/webhook`. Endpoint ini publik karena server Midtrans tidak memakai JWT pengguna. Keasliannya diperiksa memakai `signature_key` dan `MIDTRANS_SERVER_KEY`. Jangan menguji webhook produksi dengan body buatan yang tidak mempunyai signature sah.

Status gagal mengembalikan stok satu kali selama status order sebelumnya belum `failure`. Pembatalan oleh pengguna juga mengembalikan stok jika status masih `pending`.

Ada risiko transaksi yang perlu diuji lebih lanjut: pengecekan stok dilakukan sebelum transaksi pengurangan. Dua request yang datang hampir bersamaan dapat sama-sama melihat stok awal yang cukup. Perbaikan membutuhkan update stok bersyarat atau penguncian row di PostgreSQL.

## File gambar

Gambar tidak disimpan sebagai byte di PostgreSQL. Backend mengunggah file ke Supabase Storage, lalu menyimpan URL publiknya di tabel.

Endpoint unggahan memakai field berikut:

| Fitur | Field | Jumlah maksimum dari controller |
| --- | --- | --- |
| Produk | `files` | 10 file |
| Proyek | `files` | 10 file |
| Artikel | `files` | 10 file |
| Brand | `file` | 1 file |
| Banner | `file` | 1 file |
| Staf | `file` | 1 file |
| Logo perusahaan | `file` | 1 file |

Controller membatasi jumlah pada beberapa endpoint, tetapi kode belum menetapkan batas ukuran dan MIME type secara global. Reverse proxy dan aturan Storage perlu memberi batas tambahan.

## Redis dan versi cache

`CatalogCacheService` menyimpan JSON dengan TTL dari `CACHE_TTL_SECONDS`. Nilai awalnya 300 detik. Key juga mempunyai prefix dari `CACHE_PREFIX` supaya data ACSA tidak bercampur dengan aplikasi lain pada Redis yang sama.

Saat produk, kategori, brand, tipe AC, diskon, featured product, review, atau stok berubah, service menaikkan nomor versi katalog. Request berikutnya memakai key versi baru. Key lama tidak dibaca lagi dan hilang setelah TTL habis.

Data Redis bukan backup. Redis boleh dikosongkan. PostgreSQL tetap menyimpan data bisnis.

## Elasticsearch dan reindex

Indeks default bernama `acsa-products`. Dokumen pencarian berisi ID, nama, deskripsi, data brand, kategori, tipe AC, tipe freon, model, seri, harga, tanggal, dan penanda hapus.

Perubahan produk memanggil `syncProduct`. Produk yang diberi `is_deleted=true` dihapus dari indeks. Sinkronisasi yang gagal tidak membatalkan perubahan PostgreSQL. Jalankan reindex untuk mencocokkan ulang seluruh indeks:

```bash
npm run build
npm run search:reindex
```

Di VPS:

```bash
docker compose exec api npm run search:reindex
```

Reindex membaca seluruh produk dari PostgreSQL. Karena itu, jalankan sesudah impor CSV produk dan relasinya selesai.

## Peta modul

| Modul | Tanggung jawab | Layanan yang disentuh |
| --- | --- | --- |
| `auth` | Daftar, verifikasi email, login, profil aktif, daftar pengguna untuk admin | PostgreSQL, SMTP, JWT |
| `users` | Mengubah profil sendiri atau profil apa pun oleh admin, menghapus pengguna oleh admin | PostgreSQL |
| `products` | Katalog, filter, pencarian, soft delete, gambar | PostgreSQL, Redis, Elasticsearch, Storage |
| `brands`, `categories`, `ac-types` | Data pengelompokan produk | PostgreSQL, Redis |
| `cart`, `wishlist` | Daftar sementara milik pengguna login | PostgreSQL |
| `orders` | Pesanan, stok, status, pembatalan, webhook | PostgreSQL, Midtrans, Redis |
| `discounts` | Harga diskon dengan tanggal mulai dan selesai | PostgreSQL, Redis |
| `featured-products` | Produk pilihan dengan prioritas dan periode tayang | PostgreSQL, Redis |
| `reviews` | Rating dan komentar produk | PostgreSQL, Redis |
| `sponsored-brands`, `banners` | Konten promosi berdasarkan periode | PostgreSQL, Storage untuk gambar banner |
| `projects`, `articles` | Konten portofolio dan artikel beserta gambar | PostgreSQL, Storage |
| `company`, `social-media`, `staff` | Profil ACSA dan data tampilan website | PostgreSQL, Storage untuk logo atau foto |
| `prisma` | Satu koneksi database yang dipakai modul lain | PostgreSQL |
| `supabase` | Upload, hapus, dan pembuatan URL publik | Supabase Storage |
| `email` | Email verifikasi | SMTP ACSA |
| `cache` | Cache katalog yang boleh gagal tanpa mematikan aplikasi | Redis |
| `search` | Pencarian teks produk dan sinkronisasi indeks | Elasticsearch, PostgreSQL |

## Cara mengikuti satu bug

Mulai dari alamat yang gagal. Cari `@Controller` untuk bagian pertama URL, lalu cari decorator method seperti `@Get` atau `@Post`. Periksa DTO untuk melihat apakah request berhenti saat validasi. Setelah itu ikuti nama fungsi service.

Jika error berasal dari Prisma, cari model yang dipanggil di `schema.prisma`. Jika gambar gagal, periksa URL database dan log Supabase. Jika hasil pencarian tertinggal, bandingkan produk PostgreSQL lalu jalankan reindex. Jika daftar lama masih muncul, periksa koneksi Redis dan nomor versi cache.

Jangan menebak berdasarkan pesan frontend saja. Catat method, URL, status HTTP, body request tanpa rahasia, response, waktu kejadian, dan potongan log backend pada waktu yang sama.

## Batas yang perlu diketahui penerus

- Seluruh test lama belum sehat. Banyak spec bawaan hanya membuat service tanpa menyediakan dependency.
- Role masih disimpan sebagai teks, bukan enum database.
- Status order juga berupa teks. Endpoint admin membatasi beberapa nilai, sedangkan webhook dapat menyimpan `settlement`, `failure`, atau `challenge`.
- Belum ada rate limit untuk login, kirim ulang email, atau endpoint publik.
- Belum ada pembatas ukuran dan jenis file yang seragam.
- Healthcheck belum memeriksa dependency eksternal.
- Migrasi handover belum diuji pada PostgreSQL tujuan.
- Update stok bersamaan masih perlu pengujian dan penguatan.

Catatan ini adalah kondisi kode per 9 September 2026. Ubah dokumen ketika perilaku kode berubah.
