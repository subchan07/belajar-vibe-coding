# Belajar Vibe Coding

Proyek ini adalah implementasi backend API sederhana untuk manajemen pengguna (Autentikasi & Profil) yang dibangun menggunakan prinsip *Vibe Coding*. Aplikasi ini ditulis dalam TypeScript dengan ekosistem **Bun**.

## 🚀 Tech Stack & Libraries

Proyek ini memanfaatkan teknologi-teknologi modern yang dikhususkan untuk performa tinggi dengan *Developer Experience* (DX) yang sangat baik:

-   **Runtime:** [Bun](https://bun.sh/) - Runtime JS/TS all-in-one yang sangat cepat.
-   **Web Framework:** [ElysiaJS](https://elysiajs.com/) - Framework web ergonomis untuk Bun.
-   **Validation:** TypeBox (terintegrasi dengan Elysia `t`) - Untuk validasi skema request secara ketat.
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript headless yang ter-type aman.
-   **Database Access:** `mysql2` - Driver MySQL.
-   **Security:** `Bun.password` (Native bcrypt) untuk hashing password. Sistem sesi token manual berbasis UUID.
-   **Testing:** `bun:test` - Runner test asli (native) bawaan Bun.

---

## 🏗️ Arsitektur & Struktur Folder

Aplikasi memisahkan layer routing (HTTP) dengan layer logika bisnis (Service) untuk menjaga kebersihan kode dan penerapan konsep *Separation of Concerns*.

### Penamaan File (Naming Convention)
-   Gunakan nama entitas *plural* yang dipisah dengan strip untuk file (kebab-case). Contoh: `users-routes.ts`, `users-service.ts`.

### Struktur Folder
```text
belajar-vibe-coding/
├── src/
│   ├── db/                 # Layer Konektivitas Data
│   │   ├── index.ts        # Inisialisasi koneksi Drizzle ke MySQL
│   │   └── schema.ts       # Definisi skema tabel Drizzle ORM
│   ├── middlewares/        # Layer Middleware/Plugin Elysia
│   │   └── auth-middleware.ts  # Logika validasi dan ekstraksi Bearer Token
│   ├── routes/             # Layer Routing & Validasi Input (Controller)
│   │   └── users-routes.ts # Definisi endpoint API & type-checking Elysia
│   ├── services/           # Layer Logika Bisnis (Business Logic)
│   │   └── users-service.ts# Logika registrasi, login, query ke database, dll
│   └── index.ts            # Entry point aplikasi (Elysia Bootstrapper)
├── tests/                  # Layer Pengujian (Unit Tests)
│   └── users.test.ts       # Skenario pengujian untuk seluruh API (menggunakan bun test)
```

---

## 🗄️ Database Schema

Skema relasional yang digunakan terdiri dari dua tabel utama (*didukung oleh Drizzle ORM*):

### 1. Tabel `users`
Menyimpan data identitas pengguna.
-   `id`: serial (Primary Key)
-   `name`: varchar(255), not null
-   `email`: varchar(255), not null, unique
-   `password`: varchar(255), not null (Disimpan dalam bentuk *hashed*)
-   `created_at`: timestamp, default `now()`

### 2. Tabel `sessions`
Menyimpan token autentikasi aktif pengguna.
-   `id`: serial (Primary Key)
-   `token`: varchar(255), not null, unique (UUID)
-   `user_id`: bigint unsigned, foreign key ke `users.id`
-   `created_at`: timestamp, default `now()`

---

## 🔌 API Endpoints

Semua API di-\*prefix\* dengan `/api`.

1.  **Register User**
    -   **Endpoint:** `POST /api/users`
    -   **Body:** `{ "name": "...", "email": "...", "password": "..." }`
    -   **Response (Success):** `200 OK` `{"data": "OK"}`
2.  **Login User**
    -   **Endpoint:** `POST /api/users/login`
    -   **Body:** `{ "email": "...", "password": "..." }`
    -   **Response (Success):** `200 OK` `{"data": "uuid-token-string"}`
3.  **Get Current User** *(Protected)*
    -   **Endpoint:** `GET /api/users/current`
    -   **Headers:** `Authorization: Bearer <uuid-token-string>`
    -   **Response (Success):** `200 OK` `{"data": { "id": 1, "name": "...", "email": "...", "created_at": "..." }}`
4.  **Logout User** *(Protected)*
    -   **Endpoint:** `DELETE /api/users/logout`
    -   **Headers:** `Authorization: Bearer <uuid-token-string>`
    -   **Response (Success):** `200 OK` `{"data": "OK"}`

---

## 🛠️ Cara Setup Project

1.  **Clone Repository:** Pindah ke *branch* utama (main) dan sinkronkan dengan kode sumber terbaru.
2.  **Install Dependencies:**
    ```bash
    bun install
    ```
3.  **Setup Environment Variables:**
    Buat file `.env` di root direktori proyek, dan isikan *connection string* MySQL Anda:
    ```env
    DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
    ```
4.  **Replikasi Skema Database:**
    Proyek menggunakan Drizzle. Sinkronkan skema kode `schema.ts` Anda langsung ke database MySQL:
    ```bash
    bunx drizzle-kit push
    ```

---

## 💻 Cara Run Aplikasi

Aplikasi mendukung fitur *Hot Reloading* secara *out-of-the-box* melalui Bun.

Jalankan perintah berikut di terminal:
```bash
bun run dev
```
Atau menggunakan perintah standar Bun:
```bash
bun --watch src/index.ts
```
*Aplikasi Elysia akan menyala (biasanya di `http://localhost:3000`).*

---

## 🧪 Cara Test Aplikasi

Proyek ini dilengkapi dengan skenario *Unit Testing* internal komprehensif untuk memeriksa kestabilan API, validasi panjang string, duplikasi e-mail, autentikasi terotorisasi dan gagal (*Unauthorized*). Database akan di-*clear* pada setiap siklus awal iterasi test.

Untuk mengeksekusi tes, cukup jalankan:
```bash
bun test
```
*Ini akan otomatis mengeksekusi seluruh skenario di dalam folder `/tests` menggunakan kapabilitas lokal `bun:test`.*
