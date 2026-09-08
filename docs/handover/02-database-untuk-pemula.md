# Database ACSA untuk pemula

PostgreSQL menyimpan data ACSA dalam tabel. Satu row adalah satu catatan. Kolom adalah bagian dari catatan tersebut. Primary key memberi identitas unik, sedangkan foreign key menghubungkan satu tabel dengan tabel lain.

Contoh: row `Product` mempunyai `id_brand`. Nilai itu menunjuk ke `Brand.id`. Backend dapat menampilkan nama brand tanpa menyalin nama tersebut ke setiap produk.

## Jenis ID

`User`, `Cart`, `Wishlist`, `Order`, dan `Product` memakai UUID berbentuk teks. PostgreSQL membuat UUID baru saat row dibuat. Tabel lain umumnya memakai integer yang bertambah otomatis.

Saat impor CSV, pertahankan semua ID lama. Setelah mengimpor ID integer, sequence juga harus diperbarui. Jika tidak, insert baru dapat mencoba memakai angka yang sudah ada.

## Tabel pengguna dan belanja

| Tabel | Isi | Hubungan utama |
| --- | --- | --- |
| `User` | Nama, alamat, email unik, hash password, role, dan verifikasi email | Punya cart, wishlist, order, dan review |
| `Cart` | Keranjang milik pengguna | Menunjuk satu user dan mempunyai banyak cart item |
| `CartItem` | Produk dan jumlah di dalam keranjang | Menunjuk cart serta product |
| `Wishlist` | Daftar simpan milik pengguna | Menunjuk user dan mempunyai banyak wishlist item |
| `WishlistItem` | Satu produk yang disimpan | Menunjuk wishlist serta product |
| `Order` | Total, status, waktu, dan data Snap Midtrans | Menunjuk user dan mempunyai banyak order item |
| `OrderItems` | Produk, jumlah, serta harga saat order dibuat | Menunjuk order serta product |

Harga pada `OrderItems` menyimpan harga saat transaksi. Nilai ini tidak boleh diganti mengikuti harga produk terbaru karena riwayat pesanan akan berubah.

Password dalam `User.password` adalah hash bcrypt. Hash tetap termasuk data rahasia karena dapat diserang secara offline. CSV pengguna harus disimpan di tempat terbatas dan dihapus dari laptop atau folder transfer setelah serah terima diterima.

## Tabel katalog

| Tabel | Isi | Catatan |
| --- | --- | --- |
| `Brand` | Nama dan URL logo brand | `is_deleted` dipakai untuk soft delete |
| `Category` | Nama kategori yang unik | `is_deleted` dipakai untuk soft delete |
| `AcType` | Nama tipe AC yang unik | Terhubung langsung ke product |
| `Product` | Nama, harga, stok, spesifikasi, dan relasi katalog | UUID, soft delete melalui `is_deleted` |
| `ProductImages` | URL gambar produk | File aslinya berada di Storage |
| `Discount` | Harga diskon dan periode aktif | Menunjuk product |
| `FeaturedProduct` | Produk pilihan, prioritas, dan periode | Menunjuk product |
| `Review` | Rating, komentar, pengguna, dan produk | Belum ada unique constraint user per product di schema |

`Decimal` dipakai untuk harga dan total. Jangan melewatkan CSV harga melalui aplikasi spreadsheet yang mengubah pemisah desimal atau notasi angka.

`Product.is_deleted=true` berarti row dipertahankan tetapi disembunyikan dari katalog normal. Riwayat relasi masih ada. Ini berbeda dari SQL `DELETE` yang benar-benar menghapus row.

## Tabel konten website

| Tabel | Isi |
| --- | --- |
| `SponsoredBrand` | Brand sponsor, prioritas, dan periode aktif |
| `Banner` | Banner yang terkait ke brand, kategori teks, gambar, dan periode |
| `Project` | Portofolio proyek ACSA |
| `ProjectProduct` | Penghubung banyak proyek dengan banyak produk |
| `ProjectImages` | URL gambar proyek |
| `Article` | Nama, deskripsi, kategori, dan waktu artikel |
| `ArticleImages` | URL gambar artikel |
| `Company` | Nama, deskripsi, kontak, alamat, tautan peta, dan logo ACSA |
| `SocialMedia` | Nama platform, icon, dan URL |
| `Staff` | Nama, peran, dan foto staf |

`ProjectProduct` mempunyai unique constraint gabungan. Produk yang sama tidak boleh dipasang dua kali pada proyek yang sama.

## Relasi yang menghapus turunan

Schema menyatakan `onDelete: Cascade` pada gambar proyek, penghubung produk proyek, dan gambar artikel. Menghapus project akan menghapus row `ProjectProduct` serta `ProjectImages`. Menghapus article akan menghapus `ArticleImages`.

Cascade database hanya menghapus row. File di Supabase Storage tidak otomatis ikut hilang kecuali service menghapus file terlebih dahulu. Periksa service sebelum mengandalkan penghapusan sebagai pembersihan Storage.

Relasi lain tidak menuliskan cascade. PostgreSQL dapat menolak penghapusan row induk yang masih dipakai. Soft delete pada product, brand, dan category membantu menghindari kerusakan riwayat.

## Schema dan migrasi

`prisma/schema.prisma` adalah bentuk data yang diharapkan kode saat ini. Folder `prisma/migrations` adalah riwayat SQL yang seharusnya membangun bentuk itu secara berurutan.

Keduanya pernah tidak cocok. Migrasi `20260909000000_sync_schema_for_handover` disiapkan untuk database tujuan dan belum diterapkan. SQL itu juga mengubah hubungan kategori produk lama. Baca isinya serta bandingkan dengan struktur Supabase aktif sebelum menjalankannya.

Jangan menjalankan migrasi handover ke database lama hanya karena `schema.prisma` terlihat benar. Database lama mungkin sudah mendapat kolom melalui `prisma db push` atau SQL manual. Menjalankan perubahan yang sama dua kali dapat gagal atau mengubah data yang tidak direncanakan.

## Pemeriksaan setelah impor

Untuk setiap tabel, catat jumlah row sumber dan tujuan. Lalu ambil beberapa sampel yang saling terhubung:

1. Satu user beserta cart, wishlist, dan order.
2. Satu produk beserta brand, category, tipe AC, gambar, diskon, dan review.
3. Satu proyek beserta gambar dan produk terkait.
4. Satu artikel beserta gambar.

Jumlah row yang sama belum membuktikan relasinya benar. Buka data melalui API. Uji juga membuat satu row baru untuk memastikan sequence integer sudah bergerak melewati ID tertinggi hasil impor.

## Data database dan file Storage

CSV hanya membawa teks pada kolom `image_url` atau `logo_url`. File gambarnya tetap berada di bucket Storage. Jika project ID atau nama bucket berubah, URL lama harus diganti setelah semua file disalin dengan path yang sama.

Simpan tiga hasil transfer sampai Nando menerima data: dump PostgreSQL, kumpulan CSV, dan salinan bucket. CSV dipakai untuk proses yang mudah diperiksa. Dump menjadi cadangan jika CSV kehilangan detail atau proses impor manual gagal.
