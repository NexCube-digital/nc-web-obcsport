# OBC Sport Center — Frontend Web Application

Frontend resmi **OBC Sport Center** untuk reservasi lapangan olahraga instan (Futsal, Badminton, Pickleball, Basket, Tenis Meja, Biliard), membership akademi, manajemen profil customer, dan pembayaran online Midtrans.

Dibangun dengan **React 19**, **TypeScript**, **Vite 8**, dan terintegrasi langsung dengan **OBC Group Monolith API** (`nc-api-obc-platform`).

---

## Update: 22 Oktober 2026 (Integrasi Backend Monolitik)

Seluruh modul autentikasi, profil pengguna, keranjang pesanan, ulasan, dan notifikasi telah terhubung langsung dengan backend monolitik `nc-api-obc-platform` tanpa lagi bergantung pada mock data statis.

### Fitur Terintegrasi:
1. **Autentikasi Customer**:
   - **Login & Register**: Form login dan registrasi terhubung ke endpoint `/api/v1/auth/customer/login` dan `/api/v1/auth/customer/register`.
   - **Google Sign-In**: Menggunakan Google Identity Services (GIS SDK di frontend) via `window.google.accounts.id` dan memverifikasi ID token ke `/api/v1/auth/customer/google` dengan auto-link akun.
   - **Lupa Kata Sandi**: Halaman `ForgetPassword.tsx` mengirim instruksi reset kata sandi ke email melalui endpoint `/api/v1/auth/customer/forgot-password`.
2. **Pengaturan Akun & Profil**:
   - `SettingPage.tsx` & `ProfilPage.tsx` mengambil data profil pengguna secara langsung via `GET /api/v1/customer/profile`.
   - Simpan perubahan profil (nama, username, bio) via `PUT /api/v1/customer/profile`.
   - Unggah foto profil / avatar melalui modal crop gambar via `POST /api/v1/customer/avatar`.
   - Pembaruan kata sandi akun dengan validasi sandi lama via `PUT /api/v1/customer/password`.
3. **Pusat Notifikasi**:
   - `NotificationPage.tsx` menampilkan daftar notifikasi aktual dari endpoint `GET /api/v1/customer/notifications`.
   - Aksi tandai sudah dibaca per item (`PATCH /api/v1/customer/notifications/{id}/read`) dan tandai semua (`PATCH /api/v1/customer/notifications/read-all`).
4. **Cart Booking & Batch Checkout**:
   - Service keranjang `src/services/cart.ts` menyimpan jadwal pesanan di `localStorage` (`obc_sport_cart`).
   - Mendukung penambahan beberapa sesi lapangan dan checkout batch.
5. **Feedback & Notifikasi UI**:
   - Terintegrasi secara global menggunakan `Toaster` dari library `sonner` untuk pesan error, sukses, dan status proses secara real-time.

---

## Struktur Folder Proyek

```
nc-web-obcsport/
├── public/                 # Aset statis & logo
├── src/
│   ├── assets/             # Gambar, ikon, & font Montserrat
│   ├── components/
│   │   ├── layout/         # Navbar, Footer, MobileHeader
│   │   └── ui/             # CartModal, ModalCheckout, TestimonialModal
│   ├── data/               # Data katalog fasilitas & referensi
│   ├── hooks/              # Custom React hooks (useIsMobile, dll)
│   ├── pages/
│   │   ├── account/        # SettingPage, NotificationPage, ProfileMobile
│   │   ├── auth/           # Login, Register, ForgetPassword, LandingPage
│   │   ├── orders/         # CheckoutPage, PaymentPage, SuccessOrder, FailedOrder
│   │   ├── HomePage.tsx    # Katalog utama sewa lapangan
│   │   ├── ProfilPage.tsx  # Halaman profil desktop
│   │   └── ...
│   ├── routes/             # AppRoutes konfigurasi React Router v7
│   ├── services/
│   │   ├── api.ts          # Axios client & method API OBC Platform
│   │   └── cart.ts         # Cart localStorage service
│   ├── utils/              # Helper auth, session token, formatters
│   ├── App.tsx             # Root component + Sonner Toaster
│   └── main.tsx            # Entrypoint Vite
├── index.html              # Template HTML + script Google GIS SDK
├── package.json
└── vite.config.ts
```

---

## Konfigurasi Lingkungan (`.env`)

Buat file `.env` di dalam root folder `nc-web-obcsport/`:

```env
# Alamat Backend API Monolith OBC Group
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Google OAuth Client ID (Google Cloud Console - Web Application)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Menjalankan Proyek

### 1. Instalasi Dependensi
Gunakan `pnpm` atau `npm`:

```bash
pnpm install
```

### 2. Development Server
Jalankan server pengembangan Vite:

```bash
pnpm run dev
```
Aplikasi dapat diakses melalui browser pada `http://localhost:5174` (atau port yang dialokasikan Vite).

### 3. Build Production
Untuk memastikan tidak ada kesalahan TypeScript dan menghasilkan bundle produksi:

```bash
pnpm run build
```
Output tersimpan di direktori `dist/` dan siap dideploy.

### 4. Preview Build Production
```bash
pnpm run preview
```
