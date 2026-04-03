# Implementasi Endpoint "Get All Users" (Admin Only)

Saat ini, sistem belum memiliki endpoint untuk mengambil semua data pengguna. Untuk memenuhi kebutuhan tersebut, kita akan menambahkan endpoint baru di `AuthModule`. Idealnya, manajemen pengguna dipisahkan ke modul `UsersModule`, namun untuk saat ini, demi kecepatan, kita akan menambahkannya di `AuthModule` (sejalan dengan file `auth.controller.ts` dan `auth.service.ts` yang sudah ada).

## User Review Required

> [!IMPORTANT]  
> Endpoints untuk **Users** biasanya dipisahkan menjadi `UsersModule` dan diletakkan di `/users` daripada `/auth`. Apakah Anda ingin saya membuat modul khusus `UsersModule` atau cukup menambahkannya di endpoint `/auth/users`? Rencana di bawah ini mengasumsikan kita menggunakan `/auth/users` untuk kemudahan, tapi saya merekomendasikan `UsersModule`.

## Proposed Changes

### 1. Modifikasi AuthService

#### [MODIFY] [auth.service.ts](file:///c:/Users/Yuzuriha/Downloads/Yuzuriha/p.koding/acsa-project/backend/acsa-backend/src/auth/auth.service.ts)
Saya akan menambahkan satu method baru:
- `findAllUsers()`: Method ini akan mengambil seluruh data dari tabel `user` menggunakan Prisma, namun kita akan secara eksplisit melakukan *select* field apa saja yang ingin dikembalikan agar `password` (hash) tidak ikut terekspos.

### 2. Modifikasi AuthController

#### [MODIFY] [auth.controller.ts](file:///c:/Users/Yuzuriha/Downloads/Yuzuriha/p.koding/acsa-project/backend/acsa-backend/src/auth/auth.controller.ts)
Saya akan menambahkan rute (endpoint) baru untuk list data *user*:
- **Method:** `GET /auth/users`
- **Guards:** Menggunakan `@UseGuards(JwtGuard, RolesGuard)` untuk memastikan *request* valid.
- **Roles:** Mendekorasi rute dengan `@Roles('admin')` agar hanya user yang field `role` di databasenya berstatus `admin` yang bisa mengaksesnya.

## Open Questions

- Apakah Anda tetap ingin meletakkannya di `AuthModule` (`/auth/users`), atau ingin memisahkan manajemen user menjadi `UsersModule` (`/users`)? (Banyak developer lebih memilih `/users`).
- Apakah Anda memerlukan pagination untuk endpoint ini (karena jika user sudah mencapai ribuan, akan berat menarik semua data sekaligus)?

## Verification Plan

### Test Akses
1. Login sebagai `user` biasa, ambil JWT-nya, coba akses `GET /auth/users`. Harus menemui respon HTTP 403 Forbidden.
2. Login sebagai `admin`, ambil JWT-nya, coba akses `GET /auth/users`. Harus mengembalikan data array JSON daftar pengguna.
