# Memindahkan data dan gambar Supabase

Rencana handover memakai CSV untuk row database. File gambar dipindahkan terpisah karena CSV hanya menyimpan teks URL, bukan isi file.

Lakukan percobaan pada proyek tujuan kosong lebih dulu. Jangan menjadikan ekspor CSV sebagai satu-satunya backup. Simpan dump PostgreSQL dan salinan Storage sampai Nando menerima hasil transfer.

## Sebelum ekspor

Catat project ID sumber, project ID tujuan, nama bucket, jumlah row tiap tabel, dan jumlah file per folder. Jangan menulis service role key dalam catatan ini.

Pastikan database tujuan memakai schema yang sama dengan kode. Riwayat migrasi proyek pernah tertinggal dari schema, jadi jalankan migrasi hanya pada database tujuan kosong yang sudah diperiksa. Jangan menjalankan migrasi handover ke database lama tanpa membandingkan tabel aktif.

## Urutan impor CSV

Foreign key menghubungkan satu tabel dengan tabel lain. Row induk harus masuk lebih dulu. Gunakan urutan ini:

1. Tabel mandiri: `User`, `Brand`, `Category`, `AcType`, `Company`, `SocialMedia`, `Staff`, `Article`, dan `Project`.
2. Data produk dan konten turunan awal: `Product`, `Cart`, `Wishlist`, `Banner`, `SponsoredBrand`, `ArticleImages`, serta `ProjectImages`.
3. Relasi produk: `ProductImages`, `Discount`, `FeaturedProduct`, `Review`, dan `ProjectProduct`.
4. Data belanja: `CartItem`, `WishlistItem`, dan `Order`.
5. Rincian pesanan: `OrderItems`.

Jika dashboard menampilkan nama tabel dengan huruf besar, pertahankan kapitalisasinya. PostgreSQL membedakan identifier berpetik seperti `Product` dari `product`.

## Cara ekspor

Ekspor satu CSV untuk setiap tabel melalui Table Editor Supabase. Pastikan seluruh row masuk, bukan hanya halaman yang sedang terlihat. Nama file sebaiknya memakai nama tabel dan tanggal, misalnya `Product-2026-09-09.csv`.

Periksa hal berikut pada beberapa sampel:

- UUID dan ID integer tidak berubah.
- Nilai tanggal menyertakan waktu yang benar.
- Harga desimal tidak berubah menjadi pembulatan Excel.
- Teks Indonesia tetap terbaca sebagai UTF-8.
- NULL tidak berubah menjadi teks `NULL` atau string kosong tanpa sengaja.
- Hash password tetap berupa teks utuh dan file hanya dapat dibaca orang yang ditunjuk.

Jangan membuka lalu menyimpan CSV harga atau ID lewat aplikasi spreadsheet jika aplikasi itu mengubah format angka secara otomatis.

## Cara impor

Buka tabel tujuan di Supabase, pilih impor CSV, cocokkan kolom, lalu impor sesuai urutan di atas. Setelah setiap tabel selesai, bandingkan jumlah row dengan sumber. Simpan pesan error jika ada.

Jika impor berhenti di tengah, periksa row yang sudah masuk sebelum mengulang. Mengimpor file yang sama dua kali dapat membuat data duplikat atau gagal karena primary key sudah dipakai.

Setelah seluruh tabel ber-ID integer masuk, perbarui sequence. Contoh untuk satu tabel:

```sql
SELECT setval(
  pg_get_serial_sequence('"ProductImages"', 'id'),
  COALESCE((SELECT MAX(id) FROM "ProductImages"), 1),
  EXISTS (SELECT 1 FROM "ProductImages")
);
```

Ulangi pola itu untuk tabel ber-ID integer: `Brand`, `SponsoredBrand`, `Banner`, `Category`, `AcType`, `CartItem`, `WishlistItem`, `OrderItems`, `ProductImages`, `Review`, `Discount`, `FeaturedProduct`, `Project`, `ProjectProduct`, `ProjectImages`, `Article`, `ArticleImages`, `Company`, `SocialMedia`, dan `Staff`.

Tes membuat row baru melalui API. ID baru harus lebih besar dari ID tertinggi hasil impor.

## Memindahkan gambar

Salin seluruh isi bucket sumber ke bucket tujuan dengan struktur folder yang sama. Kode memakai folder seperti `products/<product-id>/...`, `projects/...`, `articles/...`, `brands/...`, dan folder fitur gambar lain.

Setelah file masuk, URL lama di database masih mengarah ke project ID Supabase sumber. Buat pemetaan:

```text
https://PROJECT_LAMA.supabase.co/storage/v1/object/public/BUCKET_LAMA/
https://PROJECT_BARU.supabase.co/storage/v1/object/public/BUCKET_BARU/
```

Perbarui hanya prefix URL yang cocok. Buat backup sebelum menjalankan SQL penggantian. Periksa kolom `image_url` dan `logo_url` pada tabel yang menyimpan gambar.

Uji minimal satu file dari tiap folder. Lalu uji upload serta penghapusan melalui API tujuan. Penghapusan perlu perhatian karena backend harus mengambil path lengkap setelah nama bucket.

## Pemeriksaan akhir

Bandingkan jumlah row semua tabel. Pilih sampel pengguna, produk, pesanan, artikel, proyek, dan gambar. Periksa relasinya dari API, bukan hanya dari Table Editor.

Jalankan reindex setelah data produk selesai:

```bash
docker compose exec api npm run search:reindex
```

Data dianggap berpindah setelah Nando dapat login, membaca katalog, melihat gambar lama, membuat data uji baru, serta memeriksa satu alur pesanan pada lingkungan pengujian.
