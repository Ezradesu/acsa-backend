# Inventaris API ACSA Backend

Semua URL di bawah memakai prefix `/api`. `Publik` berarti tidak memerlukan JWT. `Login` berarti header `Authorization: Bearer <token>` wajib ada. `Admin` berarti token juga harus berasal dari pengguna dengan role `admin`.

Daftar ini berasal dari controller per 9 September 2026. Jumlahnya 104 endpoint. Request dan contoh response tetap perlu dicocokkan melalui pengujian karena controller hanya menunjukkan pintu masuk.

## Pemeriksaan aplikasi

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api` | Publik | Memeriksa proses NestJS hidup |
| GET | `/api/health` | Publik | Healthcheck container API |

## Autentikasi dan pengguna

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Publik | Membuat akun dan mengirim email verifikasi |
| POST | `/api/auth/login` | Publik | Memeriksa email, password, verifikasi, lalu membuat JWT |
| GET | `/api/auth/verify-email?token=...` | Publik | Memakai token verifikasi email |
| POST | `/api/auth/resend-verification` | Publik | Mengirim ulang email verifikasi |
| GET | `/api/auth/me` | Login | Membaca profil dari token aktif |
| GET | `/api/auth/users` | Admin | Membaca seluruh pengguna tanpa hash password |
| PUT | `/api/users/:id` | Login | Mengubah profil sendiri; admin dapat mengubah profil mana pun |
| DELETE | `/api/users/:id` | Admin | Menghapus pengguna |

`PUT /api/users/:id` tidak menerima perubahan role melalui DTO. Pengelolaan role admin belum mempunyai endpoint tersendiri.

## Produk

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/products` | Publik | Daftar produk, filter, search, sort, dan pagination |
| GET | `/api/products/:id` | Publik | Detail satu produk |
| POST | `/api/products` | Admin | Membuat produk |
| PUT | `/api/products/:id` | Admin | Mengubah produk |
| DELETE | `/api/products/:id` | Admin | Soft delete produk |
| POST | `/api/products/:id/images` | Admin | Mengunggah maksimal 10 file pada field `files` |
| DELETE | `/api/products/:id/images/:imageId` | Admin | Menghapus row dan file gambar produk |

Query daftar produk tersedia di `QueryProductDto`: `search`, `id_brand`, `id_category`, `id_ac_type`, `freon_type`, `model_code`, `series_name`, `page`, `limit`, `min_price`, `max_price`, `sortBy`, `sortOrder`, dan `includeDeleted`. Periksa cara array dikirim melalui Postman saat membuat contoh `id_brand` atau `id_category`.

## Brand, kategori, dan tipe AC

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/brands` | Publik | Daftar brand |
| GET | `/api/brands/:id` | Publik | Detail brand |
| POST | `/api/brands` | Admin | Membuat brand |
| PUT | `/api/brands/:id` | Admin | Mengubah brand |
| DELETE | `/api/brands/:id` | Admin | Menghapus atau menandai brand sesuai service |
| POST | `/api/brands/:id/image` | Admin | Mengunggah logo pada field `file` |
| GET | `/api/categories` | Publik | Daftar kategori |
| GET | `/api/categories/:id` | Publik | Detail kategori |
| POST | `/api/categories` | Admin | Membuat kategori |
| PUT | `/api/categories/:id` | Admin | Mengubah kategori |
| DELETE | `/api/categories/:id` | Admin | Menghapus atau menandai kategori sesuai service |
| GET | `/api/ac-types` | Publik | Daftar tipe AC |
| GET | `/api/ac-types/:id` | Publik | Detail tipe AC |
| POST | `/api/ac-types` | Admin | Membuat tipe AC |
| PATCH | `/api/ac-types/:id` | Admin | Mengubah sebagian data tipe AC |
| DELETE | `/api/ac-types/:id` | Admin | Menghapus tipe AC |

## Keranjang dan wishlist

Semua endpoint pada dua kelompok ini memakai ID pengguna dari JWT. Pemanggil tidak mengirim `userId` sendiri.

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/cart` | Login | Membaca keranjang sendiri |
| POST | `/api/cart/items` | Login | Menambah produk ke keranjang |
| PUT | `/api/cart/items/:id` | Login | Mengubah jumlah item |
| DELETE | `/api/cart/items/:id` | Login | Menghapus satu item |
| DELETE | `/api/cart/clear` | Login | Mengosongkan keranjang |
| GET | `/api/wishlist` | Login | Membaca wishlist sendiri |
| POST | `/api/wishlist/items` | Login | Menambah produk |
| DELETE | `/api/wishlist/items/:id` | Login | Menghapus satu item |

## Pesanan dan Midtrans

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/orders` | Login | Pengguna membaca order sendiri; admin membaca semua |
| GET | `/api/orders/:id` | Login | Membaca order sendiri atau order apa pun untuk admin |
| POST | `/api/orders` | Login | Membuat order, mengurangi stok, dan meminta Snap token |
| PUT | `/api/orders/:id/status` | Admin | Mengubah status operasional order |
| DELETE | `/api/orders/:id/cancel` | Login | Membatalkan order pending dan mengembalikan stok |
| POST | `/api/orders/payment/webhook` | Publik dengan signature | Menerima notifikasi Midtrans |

Letakkan route literal `payment/webhook` dalam Postman secara jelas. Controller mendaftarkan `GET :id` lebih dulu, tetapi method HTTP berbeda sehingga webhook POST tidak tertangkap sebagai detail order.

## Review

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/products/:productId/reviews` | Publik | Membaca review produk |
| POST | `/api/products/:productId/reviews` | Login | Membuat review sebagai pengguna aktif |
| PUT | `/api/products/:productId/reviews/:id` | Login | Mengubah review sesuai pemeriksaan pemilik atau admin di service |
| DELETE | `/api/products/:productId/reviews/:id` | Login | Menghapus review sesuai pemeriksaan pemilik atau admin di service |

## Diskon dan produk pilihan

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/discounts` | Publik | Membaca semua diskon |
| GET | `/api/discounts/active` | Publik | Membaca diskon pada periode aktif |
| GET | `/api/discounts/:id` | Publik | Detail diskon |
| POST | `/api/discounts` | Admin | Membuat diskon |
| PUT | `/api/discounts/:id` | Admin | Mengubah diskon |
| DELETE | `/api/discounts/:id` | Admin | Menghapus diskon |
| GET | `/api/featured-products` | Publik | Membaca semua penempatan produk pilihan |
| GET | `/api/featured-products/active` | Publik | Membaca penempatan aktif |
| GET | `/api/featured-products/:id` | Publik | Detail penempatan |
| POST | `/api/featured-products` | Admin | Membuat penempatan |
| PUT | `/api/featured-products/:id` | Admin | Mengubah penempatan |
| DELETE | `/api/featured-products/:id` | Admin | Menghapus penempatan |

## Brand sponsor dan banner

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/sponsored-brands` | Publik | Membaca semua brand sponsor |
| GET | `/api/sponsored-brands/active` | Publik | Membaca brand sponsor aktif |
| GET | `/api/sponsored-brands/:id` | Publik | Detail brand sponsor |
| POST | `/api/sponsored-brands` | Admin | Membuat brand sponsor |
| PUT | `/api/sponsored-brands/:id` | Admin | Mengubah brand sponsor |
| DELETE | `/api/sponsored-brands/:id` | Admin | Menghapus brand sponsor |
| GET | `/api/banners` | Publik | Membaca semua banner |
| GET | `/api/banners/active` | Publik | Membaca banner aktif |
| GET | `/api/banners/:id` | Publik | Detail banner |
| POST | `/api/banners` | Admin | Membuat banner |
| PUT | `/api/banners/:id` | Admin | Mengubah banner |
| DELETE | `/api/banners/:id` | Admin | Menghapus banner |
| POST | `/api/banners/:id/image` | Admin | Mengunggah gambar pada field `file` |

## Proyek dan artikel

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/projects` | Publik | Daftar proyek |
| GET | `/api/projects/:id` | Publik | Detail proyek |
| POST | `/api/projects` | Admin | Membuat proyek |
| PUT | `/api/projects/:id` | Admin | Mengubah proyek |
| DELETE | `/api/projects/:id` | Admin | Menghapus proyek |
| POST | `/api/projects/:id/images` | Admin | Mengunggah maksimal 10 file pada field `files` |
| DELETE | `/api/projects/:id/images/:imageId` | Admin | Menghapus gambar proyek |
| GET | `/api/articles` | Publik | Daftar artikel |
| GET | `/api/articles/:id` | Publik | Detail artikel |
| POST | `/api/articles` | Admin | Membuat artikel |
| PUT | `/api/articles/:id` | Admin | Mengubah artikel |
| DELETE | `/api/articles/:id` | Admin | Menghapus artikel |
| POST | `/api/articles/:id/images` | Admin | Mengunggah maksimal 10 file pada field `files` |
| DELETE | `/api/articles/:id/images/:imageId` | Admin | Menghapus gambar artikel |

## Profil perusahaan, media sosial, dan staf

| Method | URL | Akses | Kegunaan |
| --- | --- | --- | --- |
| GET | `/api/company` | Publik | Membaca profil ACSA |
| PUT | `/api/company` | Admin | Mengubah profil ACSA |
| POST | `/api/company/logo` | Admin | Mengunggah logo pada field `file` |
| GET | `/api/social-media` | Publik | Daftar tautan media sosial |
| GET | `/api/social-media/:id` | Publik | Detail tautan |
| POST | `/api/social-media` | Admin | Membuat tautan |
| PUT | `/api/social-media/:id` | Admin | Mengubah tautan |
| DELETE | `/api/social-media/:id` | Admin | Menghapus tautan |
| GET | `/api/staff` | Publik | Daftar staf |
| GET | `/api/staff/:id` | Publik | Detail staf |
| POST | `/api/staff` | Admin | Membuat staf |
| PUT | `/api/staff/:id` | Admin | Mengubah staf |
| DELETE | `/api/staff/:id` | Admin | Menghapus staf |
| POST | `/api/staff/:id/image` | Admin | Mengunggah foto pada field `file` |

## Variabel Postman yang disarankan

Collection jangan menyimpan token aktif atau kunci layanan. Gunakan variabel berikut:

| Variabel | Contoh aman |
| --- | --- |
| `base_url` | `http://localhost:3000/api` |
| `access_token` | kosong pada file yang dibagikan |
| `user_id` | UUID data uji |
| `product_id` | UUID produk uji |
| `brand_id`, `category_id`, `ac_type_id` | ID integer data uji |
| `order_id` | UUID order sandbox |
| `image_id`, `review_id` | ID integer hasil request sebelumnya |

Simpan contoh response setelah endpoint diuji pada lingkungan ACSA. Jangan membuat contoh sukses berdasarkan tebakan. Untuk endpoint admin yang mengubah data, gunakan record khusus uji dan catat cara membersihkannya.
