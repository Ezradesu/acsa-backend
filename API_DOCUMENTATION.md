# ACSA Backend - API Documentation

Dokumentasi API untuk project ACSA Backend yang dibangun menggunakan NestJS.

---

## Table of Contents

1. [Informasi Umum](#informasi-umum)
2. [Autentikasi](#autentikasi)
3. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Authentication](#authentication)
   - [Categories](#categories)
   - [Brands](#brands)
   - [Products](#products)
   - [Cart](#cart)
   - [Wishlist](#wishlist)
   - [Orders](#orders)
   - [Discounts](#discounts)
   - [Reviews](#reviews)
   - [Featured Products](#featured-products)
   - [Sponsored Brands](#sponsored-brands)
   - [Banners](#banners)
   - [Projects](#projects)
   - [Articles](#articles)
   - [Company](#company)
   - [Social Media](#social-media)
   - [Staff](#staff)

---

## Informasi Umum

| Informasi | Detail |
|-----------|--------|
| **Base URL** | `http://localhost:3000/api` |
| **Framework** | NestJS |
| **Database** | PostgreSQL (via Prisma) |
| **File Storage** | Supabase Storage |
| **Payment Gateway** | Midtrans |

### Format Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Ya (untuk JSON) | `application/json` |
| `Authorization` | Ya (untuk protected routes) | `Bearer <JWT_TOKEN>` |
| `Content-Type` | Ya (untuk upload file) | `multipart/form-data` |

### Response Format

Semua response menggunakan format JSON dengan struktur berikut:

**Success Response:**
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## Autentikasi

API ini menggunakan **JWT (JSON Web Token)** untuk autentikasi. Token harus disertakan di header `Authorization` dengan format `Bearer <token>` untuk mengakses endpoint yang dilindungi.

### Role-Based Access

| Role | Deskripsi |
|------|-----------|
| `user` | User biasa, dapat mengakses endpoint publik dan endpoint user-specific |
| `admin` | Administrator, memiliki akses penuh ke semua endpoint termasuk manajemen konten |

---

## Endpoints

---

### Health Check

#### GET `/api/`

Endpoint untuk mengecek kesehatan server.

**Tujuan:** Memastikan server API berjalan dengan baik.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada
- **Body:** Tidak ada

**Response:**
```json
"Hello World!"
```

---

### Authentication

---

#### POST `/api/auth/register`

**Tujuan:** Mendaftarkan user baru ke dalam sistem.

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | Ya | Nama depan user |
| `last_name` | string | Ya | Nama belakang user |
| `email` | string | Ya | Email user (harus unik) |
| `password` | string | Ya | Password (minimal 8 karakter) |
| `address` | string | Tidak | Alamat lengkap user |
| `rt` | string | Tidak | Nomor RT |
| `rw` | string | Tidak | Nomor RW |
| `zip_code` | string | Tidak | Kode pos |

**Request Body Example:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "address": "Jl. Contoh No. 123",
  "rt": "001",
  "rw": "005",
  "zip_code": "12345"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

---

#### POST `/api/auth/login`

**Tujuan:** Melakukan autentikasi user dan mendapatkan JWT token.

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Ya | Email user |
| `password` | string | Ya | Password user |

**Request Body Example:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "user"
    }
  }
}
```

---

#### GET `/api/auth/me`

**Tujuan:** Mendapatkan informasi profil user yang sedang login berdasarkan JWT token.

**Request:**
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "address": "Jl. Contoh No. 123",
    "rt": "001",
    "rw": "005",
    "zip_code": "12345"
  }
}
```

---

#### GET `/api/auth/users`

**Tujuan:** Mendapatkan daftar semua user yang terdaftar di sistem (hanya untuk admin).

**Request:**
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "user"
    },
    {
      "id": "uuid",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@acsa.com",
      "role": "admin"
    }
  ]
}
```

---

### Categories

---

#### GET `/api/categories`

**Tujuan:** Mendapatkan daftar semua kategori produk yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Elektronik",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Fashion",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET `/api/categories/:id`

**Tujuan:** Mendapatkan detail kategori produk berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID kategori yang ingin diambil |

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "Elektronik",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/categories`

**Tujuan:** Membuat kategori produk baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Ya | Nama kategori |

**Request Body Example:**
```json
{
  "name": "Elektronik"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Category created successfully",
  "data": {
    "id": "uuid",
    "name": "Elektronik",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/categories/:id`

**Tujuan:** Mengupdate data kategori produk yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID kategori yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Tidak | Nama kategori baru |

**Request Body Example:**
```json
{
  "name": "Elektronik & Gadgets"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Category updated successfully",
  "data": {
    "id": "uuid",
    "name": "Elektronik & Gadgets",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/categories/:id`

**Tujuan:** Menghapus kategori produk (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID kategori yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Category deleted successfully"
}
```

---

### Brands

---

#### GET `/api/brands`

**Tujuan:** Mendapatkan daftar semua brand/merek produk yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Samsung",
      "image_url": "https://storage.supabase.com/brands/samsung.png",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET `/api/brands/:id`

**Tujuan:** Mendapatkan detail brand/merek berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID brand yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "Samsung",
    "image_url": "https://storage.supabase.com/brands/samsung.png",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/brands`

**Tujuan:** Membuat brand/merek baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Ya | Nama brand/merek |
| `image_url` | string | Tidak | URL gambar/brand logo |

**Request Body Example:**
```json
{
  "name": "Samsung",
  "image_url": "https://storage.supabase.com/brands/samsung.png"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Brand created successfully",
  "data": {
    "id": "uuid",
    "name": "Samsung",
    "image_url": "https://storage.supabase.com/brands/samsung.png",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/brands/:id`

**Tujuan:** Mengupdate data brand/merek yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID brand yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Tidak | Nama brand baru |
| `image_url` | string | Tidak | URL gambar/brand logo baru |

**Request Body Example:**
```json
{
  "name": "Samsung Electronics",
  "image_url": "https://storage.supabase.com/brands/samsung-new.png"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Brand updated successfully",
  "data": {
    "id": "uuid",
    "name": "Samsung Electronics",
    "image_url": "https://storage.supabase.com/brands/samsung-new.png",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/brands/:id`

**Tujuan:** Menghapus brand/merek (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID brand yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Brand deleted successfully"
}
```

---

#### POST `/api/brands/:id/image`

**Tujuan:** Mengupload gambar/logo untuk brand (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID brand yang ingin diupload gambarnya |

- **Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Ya | File gambar (PNG, JPG, JPEG) |

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Brand image uploaded successfully",
  "data": {
    "image_url": "https://storage.supabase.com/brands/uploaded-image.png"
  }
}
```

---

### Products

---

#### GET `/api/products`

**Tujuan:** Mendapatkan daftar produk dengan opsi filter dan pencarian.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | Tidak | - | Kata kunci pencarian (nama produk) |
| `id_brand` | uuid | Tidak | - | Filter berdasarkan ID brand |
| `id_category` | uuid | Tidak | - | Filter berdasarkan ID kategori |
| `type` | string | Tidak | - | Tipe produk |
| `pk` | string | Tidak | - | Primary key/identifier tambahan |
| `page` | integer | Tidak | 1 | Nomor halaman untuk pagination |
| `limit` | integer | Tidak | 10 | Jumlah item per halaman |

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Samsung Galaxy S24",
        "price": 15000000,
        "quantity": 50,
        "description": "Smartphone flagship Samsung",
        "type": "Electronics",
        "brand": {
          "id": "uuid",
          "name": "Samsung"
        },
        "categories": [
          {
            "id": "uuid",
            "name": "Elektronik"
          }
        ],
        "images": [
          {
            "id": "uuid",
            "url": "https://storage.supabase.com/products/image1.png"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

#### GET `/api/products/:id`

**Tujuan:** Mendapatkan detail produk berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID produk yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "Samsung Galaxy S24",
    "price": 15000000,
    "quantity": 50,
    "description": "Smartphone flagship Samsung",
    "type": "Electronics",
    "pk": "SGS24-001",
    "brand": {
      "id": "uuid",
      "name": "Samsung",
      "image_url": "https://storage.supabase.com/brands/samsung.png"
    },
    "categories": [
      {
        "id": "uuid",
        "name": "Elektronik"
      }
    ],
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.supabase.com/products/image1.png",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/products`

**Tujuan:** Membuat produk baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_brand` | uuid | Ya | ID brand/merek produk |
| `name` | string | Ya | Nama produk |
| `price` | number | Ya | Harga produk (dalam Rupiah) |
| `quantity` | number | Ya | Stok/jumlah produk tersedia |
| `description` | string | Tidak | Deskripsi produk |
| `type` | string | Tidak | Tipe/kategori produk |
| `pk` | string | Tidak | Primary key/identifier produk |
| `category_ids` | uuid[] | Tidak | Array ID kategori produk |

**Request Body Example:**
```json
{
  "id_brand": "uuid-brand",
  "name": "Samsung Galaxy S24",
  "price": 15000000,
  "quantity": 50,
  "description": "Smartphone flagship Samsung dengan fitur terbaru",
  "type": "Electronics",
  "pk": "SGS24-001",
  "category_ids": ["uuid-category-1", "uuid-category-2"]
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "name": "Samsung Galaxy S24",
    "price": 15000000,
    "quantity": 50,
    "description": "Smartphone flagship Samsung dengan fitur terbaru",
    "type": "Electronics",
    "pk": "SGS24-001",
    "brand": {
      "id": "uuid",
      "name": "Samsung"
    },
    "categories": [
      {
        "id": "uuid",
        "name": "Elektronik"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/products/:id`

**Tujuan:** Mengupdate data produk yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID produk yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_brand` | uuid | Tidak | ID brand/merek produk |
| `name` | string | Tidak | Nama produk |
| `price` | number | Tidak | Harga produk |
| `quantity` | number | Tidak | Stok/jumlah produk |
| `description` | string | Tidak | Deskripsi produk |
| `type` | string | Tidak | Tipe produk |
| `pk` | string | Tidak | Primary key produk |
| `category_ids` | uuid[] | Tidak | Array ID kategori |

**Request Body Example:**
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "price": 18000000,
  "quantity": 30
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Product updated successfully",
  "data": {
    "id": "uuid",
    "name": "Samsung Galaxy S24 Ultra",
    "price": 18000000,
    "quantity": 30,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/products/:id`

**Tujuan:** Menghapus produk (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID produk yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Product deleted successfully"
}
```

---

#### POST `/api/products/:id/images`

**Tujuan:** Mengupload gambar produk (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID produk yang ingin diupload gambarnya |

- **Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | file[] | Ya | Array file gambar (maksimal 10 file) |

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Product images uploaded successfully",
  "data": {
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.supabase.com/products/image1.png"
      },
      {
        "id": "uuid",
        "url": "https://storage.supabase.com/products/image2.png"
      }
    ]
  }
}
```

---

#### DELETE `/api/products/:id/images/:imageId`

**Tujuan:** Menghapus gambar produk (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID produk |
| `imageId` | uuid | ID gambar yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Product image deleted successfully"
}
```

---

### Cart

---

#### GET `/api/cart`

**Tujuan:** Mendapatkan isi keranjang belanja user yang sedang login.

**Request:**
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Samsung Galaxy S24",
          "price": 15000000,
          "image_url": "https://storage.supabase.com/products/image1.png"
        },
        "quantity": 2,
        "subtotal": 30000000
      }
    ],
    "total": 30000000,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/cart/items`

**Tujuan:** Menambahkan produk ke keranjang belanja user.

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_product` | uuid | Ya | ID produk yang ingin ditambahkan |
| `quantity` | number | Ya | Jumlah produk (minimal 1) |

**Request Body Example:**
```json
{
  "id_product": "uuid-product",
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Item added to cart successfully",
  "data": {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Samsung Galaxy S24",
      "price": 15000000
    },
    "quantity": 2,
    "subtotal": 30000000
  }
}
```

---

#### PUT `/api/cart/items/:id`

**Tujuan:** Mengupdate jumlah produk di keranjang belanja.

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID item cart yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quantity` | number | Ya | Jumlah produk baru (minimal 1) |

**Request Body Example:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cart item updated successfully",
  "data": {
    "id": "uuid",
    "quantity": 3,
    "subtotal": 45000000
  }
}
```

---

#### DELETE `/api/cart/items/:id`

**Tujuan:** Menghapus item dari keranjang belanja.

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID item cart yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Item removed from cart successfully"
}
```

---

#### DELETE `/api/cart/clear`

**Tujuan:** Mengosongkan seluruh keranjang belanja user.

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Cart cleared successfully"
}
```

---

### Wishlist

---

#### GET `/api/wishlist`

**Tujuan:** Mendapatkan daftar wishlist/favorit user yang sedang login.

**Request:**
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Samsung Galaxy S24",
        "price": 15000000,
        "image_url": "https://storage.supabase.com/products/image1.png"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST `/api/wishlist/items`

**Tujuan:** Menambahkan produk ke daftar wishlist/favorit user.

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_product` | uuid | Ya | ID produk yang ingin ditambahkan ke wishlist |

**Request Body Example:**
```json
{
  "id_product": "uuid-product"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Item added to wishlist successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "product_id": "uuid-product",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/wishlist/items/:id`

**Tujuan:** Menghapus produk dari daftar wishlist/favorit.

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID item wishlist yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Item removed from wishlist successfully"
}
```

---

### Orders

---

#### GET `/api/orders`

**Tujuan:** Mendapatkan daftar pesanan. User biasa melihat pesanan mereka sendiri, admin dapat melihat semua pesanan.

**Request:**
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | Tidak | Filter berdasarkan status order |

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-2024-001",
      "status": "processing",
      "total": 15000000,
      "items": [
        {
          "id": "uuid",
          "product": {
            "id": "uuid",
            "name": "Samsung Galaxy S24",
            "price": 15000000
          },
          "quantity": 1
        }
      ],
      "payment_status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET `/api/orders/:id`

**Tujuan:** Mendapatkan detail pesanan berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID order yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "order_number": "ORD-2024-001",
    "status": "processing",
    "total": 15000000,
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Samsung Galaxy S24",
          "price": 15000000,
          "image_url": "https://storage.supabase.com/products/image1.png"
        },
        "quantity": 1,
        "subtotal": 15000000
      }
    ],
    "shipping_address": {
      "address": "Jl. Contoh No. 123",
      "rt": "001",
      "rw": "005",
      "zip_code": "12345"
    },
    "payment_status": "pending",
    "payment_url": "https://app.midtrans.com/snap/v1/...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/orders`

**Tujuan:** Membuat pesanan baru.

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | Ya | Array item pesanan |
| `items[].id_product` | uuid | Ya | ID produk |
| `items[].quantity` | number | Ya | Jumlah produk |

**Request Body Example:**
```json
{
  "items": [
    {
      "id_product": "uuid-product-1",
      "quantity": 2
    },
    {
      "id_product": "uuid-product-2",
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "order_number": "ORD-2024-001",
    "status": "pending",
    "total": 30000000,
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid-product-1",
        "quantity": 2
      }
    ],
    "payment_url": "https://app.midtrans.com/snap/v1/...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/orders/:id/status`

**Tujuan:** Mengupdate status pesanan (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID order yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Ya | Status baru order |

**Status Options:**
- `pending` - Menunggu pembayaran
- `processing` - Sedang diproses
- `shipped` - Dikirim
- `delivered` - Terkirim
- `cancelled` - Dibatalkan

**Request Body Example:**
```json
{
  "status": "processing"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Order status updated successfully",
  "data": {
    "id": "uuid",
    "status": "processing",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/orders/:id/cancel`

**Tujuan:** Membatalkan pesanan.

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID order yang ingin dibatalkan |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Order cancelled successfully"
}
```

---

#### POST `/api/orders/payment/webhook`

**Tujuan:** Endpoint webhook untuk menerima notifikasi pembayaran dari Midtrans.

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `X-Midtrans-Signature` (untuk verifikasi)
- **Body:** Payload dari Midtrans (format JSON sesuai dokumentasi Midtrans)

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Webhook received successfully"
}
```

---

### Discounts

---

#### GET `/api/discounts`

**Tujuan:** Mendapatkan daftar semua diskon yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Samsung Galaxy S24"
      },
      "price": 12000000,
      "original_price": 15000000,
      "discount_amount": 3000000,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "is_active": true
    }
  ]
}
```

---

#### GET `/api/discounts/active`

**Tujuan:** Mendapatkan daftar diskon yang sedang aktif (berdasarkan tanggal).

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Samsung Galaxy S24"
      },
      "price": 12000000,
      "original_price": 15000000,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  ]
}
```

---

#### GET `/api/discounts/:id`

**Tujuan:** Mendapatkan detail diskon berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID diskon yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Samsung Galaxy S24",
      "price": 15000000
    },
    "price": 12000000,
    "original_price": 15000000,
    "discount_amount": 3000000,
    "discount_percentage": 20,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### POST `/api/discounts`

**Tujuan:** Membuat diskon baru untuk produk (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_product` | uuid | Ya | ID produk yang akan didiskon |
| `price` | number | Ya | Harga setelah diskon |
| `start_date` | date | Ya | Tanggal mulai diskon (YYYY-MM-DD) |
| `end_date` | date | Ya | Tanggal akhir diskon (YYYY-MM-DD) |

**Request Body Example:**
```json
{
  "id_product": "uuid-product",
  "price": 12000000,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Discount created successfully",
  "data": {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Samsung Galaxy S24"
    },
    "price": 12000000,
    "original_price": 15000000,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### PUT `/api/discounts/:id`

**Tujuan:** Mengupdate data diskon yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID diskon yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `price` | number | Tidak | Harga setelah diskon |
| `start_date` | date | Tidak | Tanggal mulai diskon |
| `end_date` | date | Tidak | Tanggal akhir diskon |

**Request Body Example:**
```json
{
  "price": 11000000,
  "end_date": "2024-02-28"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Discount updated successfully",
  "data": {
    "id": "uuid",
    "price": 11000000,
    "end_date": "2024-02-28",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/discounts/:id`

**Tujuan:** Menghapus diskon (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID diskon yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Discount deleted successfully"
}
```

---

### Reviews

---

#### GET `/api/products/:productId/reviews`

**Tujuan:** Mendapatkan daftar review untuk produk tertentu.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | uuid | ID produk yang ingin dilihat reviewnya |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe"
      },
      "rating": 5,
      "comment": "Produk sangat bagus, pengiriman cepat!",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST `/api/products/:productId/reviews`

**Tujuan:** Membuat review untuk produk yang telah dibeli.

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | uuid | ID produk yang akan direview |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | number | Ya | Rating (1-5) |
| `comment` | string | Tidak | Komentar review |

**Request Body Example:**
```json
{
  "rating": 5,
  "comment": "Produk sangat bagus, pengiriman cepat!"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Review created successfully",
  "data": {
    "id": "uuid",
    "product_id": "uuid-product",
    "user_id": "uuid-user",
    "rating": 5,
    "comment": "Produk sangat bagus, pengiriman cepat!",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/products/:productId/reviews/:id`

**Tujuan:** Mengupdate review yang sudah dibuat (hanya pemilik review atau admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | uuid | ID produk |
| `id` | uuid | ID review yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | number | Tidak | Rating baru (1-5) |
| `comment` | string | Tidak | Komentar baru |

**Request Body Example:**
```json
{
  "rating": 4,
  "comment": "Produk bagus, tapi pengiriman agak lama."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Review updated successfully",
  "data": {
    "id": "uuid",
    "rating": 4,
    "comment": "Produk bagus, tapi pengiriman agak lama.",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/products/:productId/reviews/:id`

**Tujuan:** Menghapus review (hanya pemilik review atau admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | uuid | ID produk |
| `id` | uuid | ID review yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Review deleted successfully"
}
```

---

### Featured Products

---

#### GET `/api/featured-products`

**Tujuan:** Mendapatkan daftar semua produk unggulan (featured products).

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Samsung Galaxy S24",
        "price": 15000000,
        "image_url": "https://storage.supabase.com/products/image1.png"
      },
      "priority": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "is_active": true
    }
  ]
}
```

---

#### GET `/api/featured-products/active`

**Tujuan:** Mendapatkan daftar produk unggulan yang sedang aktif.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Samsung Galaxy S24",
        "price": 15000000
      },
      "priority": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  ]
}
```

---

#### GET `/api/featured-products/:id`

**Tujuan:** Mendapatkan detail produk unggulan berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID featured product |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Samsung Galaxy S24",
      "price": 15000000,
      "description": "Smartphone flagship Samsung"
    },
    "priority": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### POST `/api/featured-products`

**Tujuan:** Menambahkan produk ke daftar produk unggulan (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_product` | uuid | Ya | ID produk yang akan dijadikan featured |
| `priority` | number | Ya | Prioritas tampilan (angka lebih kecil = lebih prioritas) |
| `start_date` | date | Ya | Tanggal mulai (YYYY-MM-DD) |
| `end_date` | date | Ya | Tanggal akhir (YYYY-MM-DD) |

**Request Body Example:**
```json
{
  "id_product": "uuid-product",
  "priority": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Featured product created successfully",
  "data": {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Samsung Galaxy S24"
    },
    "priority": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### PUT `/api/featured-products/:id`

**Tujuan:** Mengupdate produk unggulan yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID featured product yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `priority` | number | Tidak | Prioritas baru |
| `start_date` | date | Tidak | Tanggal mulai baru |
| `end_date` | date | Tidak | Tanggal akhir baru |

**Request Body Example:**
```json
{
  "priority": 2,
  "end_date": "2024-02-28"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Featured product updated successfully",
  "data": {
    "id": "uuid",
    "priority": 2,
    "end_date": "2024-02-28",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/featured-products/:id`

**Tujuan:** Menghapus produk dari daftar unggulan (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID featured product yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Featured product deleted successfully"
}
```

---

### Sponsored Brands

---

#### GET `/api/sponsored-brands`

**Tujuan:** Mendapatkan daftar semua brand yang disponsori.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "brand": {
        "id": "uuid",
        "name": "Samsung",
        "image_url": "https://storage.supabase.com/brands/samsung.png"
      },
      "priority": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "is_active": true
    }
  ]
}
```

---

#### GET `/api/sponsored-brands/active`

**Tujuan:** Mendapatkan daftar brand yang disponsori dan sedang aktif.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "brand": {
        "id": "uuid",
        "name": "Samsung",
        "image_url": "https://storage.supabase.com/brands/samsung.png"
      },
      "priority": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  ]
}
```

---

#### GET `/api/sponsored-brands/:id`

**Tujuan:** Mendapatkan detail brand yang disponsori berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID sponsored brand |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "brand": {
      "id": "uuid",
      "name": "Samsung",
      "image_url": "https://storage.supabase.com/brands/samsung.png"
    },
    "priority": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### POST `/api/sponsored-brands`

**Tujuan:** Menambahkan brand ke daftar sponsored brands (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_brand` | uuid | Ya | ID brand yang akan disponsori |
| `priority` | number | Ya | Prioritas tampilan |
| `start_date` | date | Ya | Tanggal mulai (YYYY-MM-DD) |
| `end_date` | date | Ya | Tanggal akhir (YYYY-MM-DD) |

**Request Body Example:**
```json
{
  "id_brand": "uuid-brand",
  "priority": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Sponsored brand created successfully",
  "data": {
    "id": "uuid",
    "brand": {
      "id": "uuid",
      "name": "Samsung"
    },
    "priority": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### PUT `/api/sponsored-brands/:id`

**Tujuan:** Mengupdate sponsored brand yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID sponsored brand yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `priority` | number | Tidak | Prioritas baru |
| `start_date` | date | Tidak | Tanggal mulai baru |
| `end_date` | date | Tidak | Tanggal akhir baru |

**Request Body Example:**
```json
{
  "priority": 2,
  "end_date": "2024-02-28"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Sponsored brand updated successfully",
  "data": {
    "id": "uuid",
    "priority": 2,
    "end_date": "2024-02-28",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/sponsored-brands/:id`

**Tujuan:** Menghapus brand dari daftar sponsored (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID sponsored brand yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Sponsored brand deleted successfully"
}
```

---

### Banners

---

#### GET `/api/banners`

**Tujuan:** Mendapatkan daftar semua banner yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "brand": {
        "id": "uuid",
        "name": "Samsung"
      },
      "name": "Promo Samsung Galaxy S24",
      "category": "promotion",
      "image_url": "https://storage.supabase.com/banners/banner1.png",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "is_active": true
    }
  ]
}
```

---

#### GET `/api/banners/active`

**Tujuan:** Mendapatkan daftar banner yang sedang aktif.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "brand": {
        "id": "uuid",
        "name": "Samsung"
      },
      "name": "Promo Samsung Galaxy S24",
      "category": "promotion",
      "image_url": "https://storage.supabase.com/banners/banner1.png",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  ]
}
```

---

#### GET `/api/banners/:id`

**Tujuan:** Mendapatkan detail banner berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID banner yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "brand": {
      "id": "uuid",
      "name": "Samsung",
      "image_url": "https://storage.supabase.com/brands/samsung.png"
    },
    "name": "Promo Samsung Galaxy S24",
    "category": "promotion",
    "image_url": "https://storage.supabase.com/banners/banner1.png",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### POST `/api/banners`

**Tujuan:** Membuat banner baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_brand` | uuid | Ya | ID brand yang terkait dengan banner |
| `name` | string | Ya | Nama/judul banner |
| `category` | string | Tidak | Kategori banner (misal: promotion, sale, new) |
| `start_date` | date | Ya | Tanggal mulai (YYYY-MM-DD) |
| `end_date` | date | Ya | Tanggal akhir (YYYY-MM-DD) |

**Request Body Example:**
```json
{
  "id_brand": "uuid-brand",
  "name": "Promo Samsung Galaxy S24",
  "category": "promotion",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Banner created successfully",
  "data": {
    "id": "uuid",
    "brand": {
      "id": "uuid",
      "name": "Samsung"
    },
    "name": "Promo Samsung Galaxy S24",
    "category": "promotion",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_active": true
  }
}
```

---

#### PUT `/api/banners/:id`

**Tujuan:** Mengupdate banner yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID banner yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_brand` | uuid | Tidak | ID brand baru |
| `name` | string | Tidak | Nama banner baru |
| `category` | string | Tidak | Kategori baru |
| `start_date` | date | Tidak | Tanggal mulai baru |
| `end_date` | date | Tidak | Tanggal akhir baru |

**Request Body Example:**
```json
{
  "name": "Promo Samsung Galaxy S24 - Extended",
  "end_date": "2024-02-28"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Banner updated successfully",
  "data": {
    "id": "uuid",
    "name": "Promo Samsung Galaxy S24 - Extended",
    "end_date": "2024-02-28",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/banners/:id`

**Tujuan:** Menghapus banner (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID banner yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Banner deleted successfully"
}
```

---

#### POST `/api/banners/:id/image`

**Tujuan:** Mengupload gambar untuk banner (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID banner yang ingin diupload gambarnya |

- **Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Ya | File gambar banner |

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Banner image uploaded successfully",
  "data": {
    "image_url": "https://storage.supabase.com/banners/uploaded-image.png"
  }
}
```

---

### Projects

---

#### GET `/api/projects`

**Tujuan:** Mendapatkan daftar semua proyek/portofolio yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Samsung Galaxy S24"
      },
      "name": "Proyek Implementasi Samsung S24",
      "description": "Deskripsi proyek",
      "date": "2024-01-01",
      "location": "Jakarta",
      "category": "implementation",
      "images": [
        {
          "id": "uuid",
          "url": "https://storage.supabase.com/projects/image1.png"
        }
      ]
    }
  ]
}
```

---

#### GET `/api/projects/:id`

**Tujuan:** Mendapatkan detail proyek berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID proyek yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Samsung Galaxy S24"
    },
    "name": "Proyek Implementasi Samsung S24",
    "description": "Deskripsi lengkap proyek",
    "date": "2024-01-01",
    "location": "Jakarta",
    "category": "implementation",
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.supabase.com/projects/image1.png"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/projects`

**Tujuan:** Membuat proyek/portofolio baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_product` | uuid | Ya | ID produk yang terkait dengan proyek |
| `name` | string | Ya | Nama proyek |
| `description` | string | Tidak | Deskripsi proyek |
| `date` | date | Tidak | Tanggal proyek (YYYY-MM-DD) |
| `location` | string | Tidak | Lokasi proyek |
| `category` | string | Tidak | Kategori proyek |

**Request Body Example:**
```json
{
  "id_product": "uuid-product",
  "name": "Proyek Implementasi Samsung S24",
  "description": "Implementasi Samsung Galaxy S24 untuk enterprise",
  "date": "2024-01-01",
  "location": "Jakarta",
  "category": "implementation"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "name": "Proyek Implementasi Samsung S24",
    "description": "Implementasi Samsung Galaxy S24 untuk enterprise",
    "date": "2024-01-01",
    "location": "Jakarta",
    "category": "implementation",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/projects/:id`

**Tujuan:** Mengupdate proyek yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID proyek yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_product` | uuid | Tidak | ID produk baru |
| `name` | string | Tidak | Nama proyek baru |
| `description` | string | Tidak | Deskripsi baru |
| `date` | date | Tidak | Tanggal baru |
| `location` | string | Tidak | Lokasi baru |
| `category` | string | Tidak | Kategori baru |

**Request Body Example:**
```json
{
  "name": "Proyek Implementasi Samsung S24 - Updated",
  "description": "Deskripsi yang lebih lengkap"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid",
    "name": "Proyek Implementasi Samsung S24 - Updated",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/projects/:id`

**Tujuan:** Menghapus proyek (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID proyek yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Project deleted successfully"
}
```

---

#### POST `/api/projects/:id/images`

**Tujuan:** Mengupload gambar untuk proyek (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID proyek yang ingin diupload gambarnya |

- **Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | file[] | Ya | Array file gambar (maksimal 10 file) |

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Project images uploaded successfully",
  "data": {
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.supabase.com/projects/image1.png"
      }
    ]
  }
}
```

---

#### DELETE `/api/projects/:id/images/:imageId`

**Tujuan:** Menghapus gambar proyek (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID proyek |
| `imageId` | uuid | ID gambar yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Project image deleted successfully"
}
```

---

### Articles

---

#### GET `/api/articles`

**Tujuan:** Mendapatkan daftar semua artikel yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Cara Memilih Smartphone yang Tepat",
      "description": "Panduan lengkap memilih smartphone",
      "category": "tutorial",
      "images": [
        {
          "id": "uuid",
          "url": "https://storage.supabase.com/articles/image1.png"
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET `/api/articles/:id`

**Tujuan:** Mendapatkan detail artikel berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID artikel yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "Cara Memilih Smartphone yang Tepat",
    "description": "Panduan lengkap memilih smartphone sesuai kebutuhan dan budget Anda",
    "category": "tutorial",
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.supabase.com/articles/image1.png"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/articles`

**Tujuan:** Membuat artikel baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Ya | Judul artikel |
| `description` | string | Tidak | Isi/deskripsi artikel |
| `category` | string | Tidak | Kategori artikel |

**Request Body Example:**
```json
{
  "name": "Cara Memilih Smartphone yang Tepat",
  "description": "Panduan lengkap memilih smartphone sesuai kebutuhan dan budget Anda",
  "category": "tutorial"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Article created successfully",
  "data": {
    "id": "uuid",
    "name": "Cara Memilih Smartphone yang Tepat",
    "description": "Panduan lengkap memilih smartphone sesuai kebutuhan dan budget Anda",
    "category": "tutorial",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/articles/:id`

**Tujuan:** Mengupdate artikel yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID artikel yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Tidak | Judul artikel baru |
| `description` | string | Tidak | Deskripsi baru |
| `category` | string | Tidak | Kategori baru |

**Request Body Example:**
```json
{
  "name": "Cara Memilih Smartphone yang Tepat di 2024",
  "description": "Panduan lengkap dan terbaru"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Article updated successfully",
  "data": {
    "id": "uuid",
    "name": "Cara Memilih Smartphone yang Tepat di 2024",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/articles/:id`

**Tujuan:** Menghapus artikel (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID artikel yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Article deleted successfully"
}
```

---

#### POST `/api/articles/:id/images`

**Tujuan:** Mengupload gambar untuk artikel (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID artikel yang ingin diupload gambarnya |

- **Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | file[] | Ya | Array file gambar (maksimal 10 file) |

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Article images uploaded successfully",
  "data": {
    "images": [
      {
        "id": "uuid",
        "url": "https://storage.supabase.com/articles/image1.png"
      }
    ]
  }
}
```

---

#### DELETE `/api/articles/:id/images/:imageId`

**Tujuan:** Menghapus gambar artikel (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID artikel |
| `imageId` | uuid | ID gambar yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Article image deleted successfully"
}
```

---

### Company

---

#### GET `/api/company`

**Tujuan:** Mendapatkan informasi perusahaan/organisasi.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "ACSA Company",
    "description": "Deskripsi perusahaan",
    "email": "info@acsa.com",
    "phone": "+62 812 3456 7890",
    "location": "Jakarta, Indonesia",
    "location_url": "https://maps.google.com/...",
    "logo_url": "https://storage.supabase.com/company/logo.png",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/company`

**Tujuan:** Mengupdate informasi perusahaan (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `logo_url` | string | Tidak | URL logo perusahaan |
| `name` | string | Tidak | Nama perusahaan |
| `description` | string | Tidak | Deskripsi perusahaan |
| `email` | string | Tidak | Email perusahaan |
| `phone` | string | Tidak | Nomor telepon perusahaan |
| `location` | string | Tidak | Alamat lokasi perusahaan |
| `location_url` | string | Tidak | URL maps lokasi perusahaan |

**Request Body Example:**
```json
{
  "name": "ACSA Company Indonesia",
  "email": "contact@acsa.co.id",
  "phone": "+62 812 3456 7890",
  "location": "Jakarta Selatan, Indonesia"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Company information updated successfully",
  "data": {
    "id": "uuid",
    "name": "ACSA Company Indonesia",
    "email": "contact@acsa.co.id",
    "phone": "+62 812 3456 7890",
    "location": "Jakarta Selatan, Indonesia",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/company/logo`

**Tujuan:** Mengupload logo perusahaan (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `logo` | file | Ya | File gambar logo |

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Company logo uploaded successfully",
  "data": {
    "logo_url": "https://storage.supabase.com/company/new-logo.png"
  }
}
```

---

### Social Media

---

#### GET `/api/social-media`

**Tujuan:** Mendapatkan daftar semua link social media yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Instagram",
      "icon": "instagram",
      "url": "https://instagram.com/acsa",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET `/api/social-media/:id`

**Tujuan:** Mendapatkan detail social media berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID social media yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "Instagram",
    "icon": "instagram",
    "url": "https://instagram.com/acsa",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/social-media`

**Tujuan:** Menambahkan link social media baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Ya | Nama platform social media |
| `icon` | string | Tidak | Nama icon (untuk UI) |
| `url` | string | Ya | URL link social media |

**Request Body Example:**
```json
{
  "name": "Instagram",
  "icon": "instagram",
  "url": "https://instagram.com/acsa"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Social media created successfully",
  "data": {
    "id": "uuid",
    "name": "Instagram",
    "icon": "instagram",
    "url": "https://instagram.com/acsa",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/social-media/:id`

**Tujuan:** Mengupdate link social media yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID social media yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Tidak | Nama platform baru |
| `icon` | string | Tidak | Icon baru |
| `url` | string | Tidak | URL baru |

**Request Body Example:**
```json
{
  "url": "https://instagram.com/acsa_official"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Social media updated successfully",
  "data": {
    "id": "uuid",
    "url": "https://instagram.com/acsa_official",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/social-media/:id`

**Tujuan:** Menghapus link social media (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID social media yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Social media deleted successfully"
}
```

---

### Staff

---

#### GET `/api/staff`

**Tujuan:** Mendapatkan daftar semua staff/tim yang tersedia.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "CEO",
      "image_url": "https://storage.supabase.com/staff/john.png",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET `/api/staff/:id`

**Tujuan:** Mendapatkan detail staff berdasarkan ID.

**Request:**
- **Method:** `GET`
- **Headers:** Tidak ada (public endpoint)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID staff yang ingin diambil |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "role": "CEO",
    "image_url": "https://storage.supabase.com/staff/john.png",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST `/api/staff`

**Tujuan:** Menambahkan staff/tim baru (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Ya | Nama staff |
| `role` | string | Tidak | Role/jabatan staff |

**Request Body Example:**
```json
{
  "name": "John Doe",
  "role": "CEO"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Staff created successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "role": "CEO",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### PUT `/api/staff/:id`

**Tujuan:** Mengupdate staff yang sudah ada (hanya untuk admin).

**Request:**
- **Method:** `PUT`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID staff yang ingin diupdate |

- **Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Tidak | Nama baru |
| `role` | string | Tidak | Role/jabatan baru |

**Request Body Example:**
```json
{
  "name": "John Doe Jr.",
  "role": "Founder & CEO"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Staff updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe Jr.",
    "role": "Founder & CEO",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### DELETE `/api/staff/:id`

**Tujuan:** Menghapus staff (hanya untuk admin).

**Request:**
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID staff yang ingin dihapus |

**Body:** Tidak ada

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Staff deleted successfully"
}
```

---

#### POST `/api/staff/:id/image`

**Tujuan:** Mengupload gambar/foto staff (hanya untuk admin).

**Request:**
- **Method:** `POST`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <JWT_TOKEN>` (Admin required)
- **Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID staff yang ingin diupload gambarnya |

- **Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | Ya | File gambar/foto staff |

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "message": "Staff image uploaded successfully",
  "data": {
    "image_url": "https://storage.supabase.com/staff/uploaded-image.png"
  }
}
```

---

## Ringkasan Endpoint

| Module | Total Endpoints | Public | Auth Required | Admin Only |
|--------|-----------------|--------|---------------|------------|
| Health Check | 1 | 1 | 0 | 0 |
| Auth | 4 | 2 | 2 | 1 |
| Categories | 5 | 2 | 3 | 3 |
| Brands | 6 | 2 | 4 | 4 |
| Products | 7 | 2 | 5 | 5 |
| Cart | 5 | 0 | 5 | 0 |
| Wishlist | 3 | 0 | 3 | 0 |
| Orders | 6 | 1 | 5 | 1 |
| Discounts | 6 | 3 | 3 | 3 |
| Reviews | 4 | 1 | 3 | 0 |
| Featured Products | 6 | 3 | 3 | 3 |
| Sponsored Brands | 6 | 3 | 3 | 3 |
| Banners | 7 | 3 | 4 | 4 |
| Projects | 7 | 2 | 5 | 5 |
| Articles | 7 | 2 | 5 | 5 |
| Company | 3 | 1 | 2 | 2 |
| Social Media | 5 | 2 | 3 | 3 |
| Staff | 6 | 2 | 4 | 4 |

**Total: ~94 endpoints**

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request berhasil |
| `201 Created` | Resource berhasil dibuat |
| `400 Bad Request` | Request tidak valid (validasi gagal) |
| `401 Unauthorized` | Token tidak valid atau tidak ada |
| `403 Forbidden` | User tidak memiliki akses (role tidak sesuai) |
| `404 Not Found` | Resource tidak ditemukan |
| `409 Conflict` | Resource sudah ada (duplicate) |
| `500 Internal Server Error` | Error dari server |

---

## Contact

Untuk pertanyaan lebih lanjut mengenai API ini, silakan hubungi tim developer ACSA.
