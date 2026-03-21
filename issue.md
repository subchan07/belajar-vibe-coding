# Target: Implementasi Fitur Mendapatkan Data User Saat Ini (Current User)

Dokumen ini berisi spesifikasi dan tahapan-tahapan yang harus dilakukan untuk mengimplementasikan fitur pengambilan data user yang sedang login (Current User) berdasarkan token sesi.

## 1. Spesifikasi API

Buatkan endpoint API untuk mengambil data profil user yang sedang aktif mengirimkan request.

**Endpoint:** 
`GET /api/users/current`

**Headers:**
- `Authorization: Bearer <token>` 
  *(Keterangan: `<token>` adalah UUID yang didapatkan saat login dan tersimpan di tabel `sessions`)*

**Response Body (Success 200 OK):**
```json
{
    "data": {
        "id": 1,
        "name": "test",
        "email": "test@localhost",
        "created_at": "timestamp"
    }
}
```

**Response Body (Error 401 - Token tidak valid / tidak ada):**
```json
{
    "error": "Unauthorized"
}
```

## 2. Struktur Folder dan Penamaan File

Kode baru yang akan ditulis harus ditambahkan ke file yang sudah ada di dalam folder `src`:
- Direktori `src/routes/`: Routing API. Buka file `src/routes/users-routes.ts`.
- Direktori `src/services/`: Logic bisnis dan database. Buka file `src/services/users-service.ts`.

## 3. Tahapan Implementasi

Untuk mengimplementasikan fitur ini, ikuti petunjuk langkah demi langkah berikut ini:

1. **Buat Service Layer (Update `src/services/users-service.ts`):**
   - Tambahkan fungsi baru bernama `getCurrentUser(token: string)`.
   - Di dalam fungsi ini, lakukan query ke database (tabel `sessions`) untuk mencari session berdasarkan `token` yang diberikan. Lakukan operasi `join` dengan tabel `users` (berdasarkan `user_id`) untuk mendapatkan detail user di waktu yang sama, atau query manual ke tabel `users` jika query JOIN dirasa menyulitkan.
   - Periksa apakah token ditemukan di database (session masih valid). 
   - Jika token tidak ditemukan, lempar/kembalikan error "Unauthorized".
   - Jika token ditemukan, ambil data user yang berelasi dengan token tersebut. 
   - Hapus atribut `password` dari object user sebelum dikembalikan (demi keamanan) atau cukup lemparkan properti `id`, `name`, `email`, dan `created_at`.
   - Kembalikan data user tersebut sebagai respon sukses `{ data: { id, name, email, created_at } }`.

2. **Buat Middleware/Eksekusi Router Layer (Update `src/routes/users-routes.ts`):**
   - Tambahkan sub-route `app.get('/current', ...)` atau `app.get('/users/current', ...)` (bergantung cara Anda mendefinisikan prefix).
   - Di dalam fungsi handler, ambil header `Authorization` dari request (`headers.authorization`).
   - Lakukan pengecekan:
     - Apakah header `Authorization` ada?
     - Apakah berformat `Bearer <token>`?
   - Jika format tidak valid atau header kosong, atur response HTTP Status Code menjadi `401 Unauthorized` dan kembalikan response JSON `{"error": "Unauthorized"}`.
   - Ekstrak nilai `<token>`.
   - Panggil class `UsersService.getCurrentUser(token)` dan taruh di dalam blok `try...catch`.
   - Jika service melemparkan exception ("Unauthorized"), tangkap exception tersebut, set status `401`, dan return JSON error.
   - Jika berhasil, set status menjadi `200` dan kembalikan respon bersisi detail data user.

3. **Pengujian (Testing):**
   - Jalankan prose server (`bun run dev`).
   - Skenario pengujian (Gunakan Postman / cURL):
     - **Test 1 (Tanpa Header):** Lakukan `GET /api/users/current` tanpa mengirim header Authorization. Sistem harus merespon `{"error": "Unauthorized"}`.
     - **Test 2 (Token Salah):** Lakukan request dengan `Authorization: Bearer <TOKEN-SEMBARANG>`. Sistem harus merespon `{"error": "Unauthorized"}`.
     - **Test 3 (Sukses):** Temukan token dari endpoint Login. Lakukan request `GET` lagi dengan mengirimkan `Authorization: Bearer <TOKEN-ASLI>`. Sistem harus merespon data diri user dengan benar.
