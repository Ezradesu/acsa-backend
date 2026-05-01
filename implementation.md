# Rencana Kerja: Fitur Filter & Sort untuk Product

## Halo!
Ide yang sangat bagus! Fitur filter dan sorting memang sangat krusial untuk e-commerce agar pembeli bisa mencari barang dengan mudah.

Kabar baiknya: Filter berdasarkan **Brand**, **Category**, dan **Type** ternyata **sudah ada** di kodemu! Kita tinggal menambahkan filter untuk **Price Range** (harga) dan fitur **Sorting** (pengurutan).

Berikut adalah langkah-langkah sistematis yang akan kita lakukan:

---

## Langkah 1: Tambahkan Parameter Baru di DTO
Kita perlu memberi tahu sistem bahwa sekarang API kita menerima parameter baru untuk harga dan pengurutan.

### File yang Diubah: `src/products/dto/query-product.dto.ts`
Kita akan menambahkan 4 properti opsional baru ke dalam class `QueryProductDto`:
1. `min_price`: Harga minimal (angka)
2. `max_price`: Harga maksimal (angka)
3. `sortBy`: Kolom yang mau diurutkan (pilihannya: `'price'` atau `'date'`)
4. `sortOrder`: Urutannya (pilihannya: `'asc'` untuk dari bawah ke atas, atau `'desc'` untuk dari atas ke bawah)

---

## Langkah 2: Ubah Logika Pencarian di Service
Sekarang kita akan menerapkan logika filter dan sorting-nya ke database melalui Prisma.

### File yang Diubah: `src/products/products.service.ts`
Di dalam method `findAll`:

**A. Menerapkan Filter Harga:**
Kita akan cek apakah `min_price` atau `max_price` dikirimkan. Jika iya, kita tambahkan ke pencarian database (`where` object) dengan logika:
- `gte` (greater than or equal) untuk `min_price`
- `lte` (less than or equal) untuk `max_price`

**B. Menerapkan Sorting Dinamis:**
Saat ini, kodemu mengurutkan secara statis berdasarkan tanggal terbaru (`orderBy: { created_at: 'desc' }`). Kita akan ubah ini menjadi dinamis:
- Jika `sortBy` adalah `'price'`, maka `orderBy: { price: sortOrder }`
- Jika `sortBy` adalah `'date'`, maka `orderBy: { created_at: sortOrder }`
- Jika tidak ada parameter sort yang dikirim, kita biarkan defaultnya yang terbaru (`created_at: 'desc'`).

---

## Alur Penggunaan (API Flow)
Setelah kita selesai memprogram ini, Frontend (atau kamu saat testing di Postman) bisa menggunakannya seperti ini:

**1. Filter by Price Range (contoh: harga 50.000 sampai 150.000)**
```http
GET /products?min_price=50000&max_price=150000
```

**2. Sort Termurah ke Termahal (Price Ascending)**
```http
GET /products?sortBy=price&sortOrder=asc
```

**3. Sort Terbaru ke Terlama (Date Descending) - *Ini adalah defaultnya***
```http
GET /products?sortBy=date&sortOrder=desc
```

**4. Kombinasi Semuanya! (Contoh: Baju, Brand Nike, Harga di atas 100rb, Termurah)**
```http
GET /products?id_category=1&id_brand=5&min_price=100000&sortBy=price&sortOrder=asc
```

---

> **Tindakan Selanjutnya**: Jika kamu menyetujui rencana sistematis di atas, silakan balas dengan **"Lanjutkan"** atau **"Approve"**, dan aku akan langsung menulis kodenya!
