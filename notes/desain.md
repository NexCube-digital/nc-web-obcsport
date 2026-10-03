# Design System & Brand Guideline — OBC Sport
**Onny Barber Center (OBC) Sport Facility & Event Space Booking**

Dokumen ini merupakan panduan resmi desain antarmuka (*UI/UX Design Guideline*) dan identitas visual untuk platform **OBC Sport**, disusun berdasarkan **Brand Guideline Resmi OBC** serta kebutuhan sistem pada [PRD OBC Sport](file:///d:/NexCube%20Project/OBC%20PROJECT/sport-obc/notes/prd.md).

---

## 1. Brand Identity & Karakter Visual

- **Nama Brand**: O.B.C (Onny Barber Center / OBC Sport)
- **Karakter Visual**: 
  - *Geometric, Rounded & Friendly* — Menghadirkan kesan ramah, mudah diakses oleh komunitas olahraga dan warga.
  - *Structured, Clean & Professional* — Menjaga keteraturan data jadwal, slot waktu, tarif, dan proses transaksi.
  - *Earthy, Sporty & Natural* — Palet hijau tua dan zaitun yang mencerminkan suasana lapangan semi-outdoor dan ruang terbuka hijau.
- **Elemen Identitas Logo**:
  - **Emblem Bunga Sepatu (Hibiscus Flower)**: Simbol warna merah cerah (*Carmine/Ruby Red*).
  - **Wordmark O.B.C**: Tipografi tegas dengan lekukan geometris tebal berwarna hijau tua (*Deep Forest Green*), aksen gunting/barber pole di dalam huruf.
  - **Sub-label**: Banner kapsul (*pill shape*) bertuliskan *"onny barber center"*.
- **Variasi Penggunaan Logo**:
  1. **Primary Full Color**: Emblem bunga merah (`#BF0021`) + teks OBC hijau tua (`#004000`) di atas latar krem / putih (`#FFFFF7` / `#FFFFFF`).
  2. **Monochrome White**: Logo putih utuh di atas latar hijau tua (`#004000`) atau charcoal (`#343133`).
  3. **White Outline**: Logo garis luar putih di atas latar hijau zaitun (`#404F14`) atau hijau tua (`#004000`).
  4. **Emblem Only**: Bunga sepatu merah (`#BF0021`) untuk favicon, avatar, atau app icon ringkas.

---

## 2. Palet Warna Resmi (Color Palette)

Palet warna utama diambil langsung dari Brand Guideline resmi OBC (5 warna inti) ditambah warna aksen merah dari emblem bunga logo:

| Swatch | Nama Warna | Kode HEX | RGB | Peran & Penggunaan Utama |
| :---: | :--- | :---: | :---: | :--- |
| ![#343133](https://via.placeholder.com/20/343133/000000?text=+) | **Dark Charcoal** | `#343133` | `rgb(52, 49, 51)` | Teks utama (*body text*), heading gelap, footer gelap, border kontras tinggi, elemen netral gelap. |
| ![#004000](https://via.placeholder.com/20/004000/000000?text=+) | **Deep Forest Green** | `#004000` | `rgb(0, 64, 0)` | **Warna Brand Utama**. Header navbar, tombol utama (Primary CTA), hero background, indikator slot *Tersedia*. |
| ![#404F14](https://via.placeholder.com/20/404F14/000000?text=+) | **Olive / Moss Green** | `#404F14` | `rgb(64, 79, 20)` | **Warna Brand Sekunder**. Badge cabang olahraga, secondary button, card highlight, status sewa gedung. |
| ![#FFFFF7](https://via.placeholder.com/20/FFFFF7/000000?text=+) | **Warm Ivory / Cream** | `#FFFFF7` | `rgb(255, 255, 247)` | **Latar Belakang Utama**. Menghilangkan silau cahaya layar, memberi kesan ramah, hangat, dan natural. |
| ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/000000?text=+) | **Pure White** | `#FFFFFF` | `rgb(255, 255, 255)` | Latar card formulir, container modal/dialog, input form, teks kontras di atas latar gelap. |
| ![#BF0021](https://via.placeholder.com/20/BF0021/000000?text=+) | **Hibiscus Carmine Red** *(Logo Accent)* | `#BF0021` | `rgb(191, 0, 33)` | **Warna Aksen & Aksi**. Badge promo diskon (*Membership 20%*), status slot *Terisi/Booked*, tag urgensi, notifikasi peringatan. |

### Warna Tambahan (Supporting & Neutral Tints)

Untuk fleksibilitas antarmuka pengguna:
- **Warm Muted Cream** (`#F0F0D4`): Digunakan untuk section pembeda (alternating section background) seperti pada banner panduan brand.
- **Muted Text / Secondary Label** (`#6F6B6E`): Untuk teks subjudul, timestamp, deskripsi sekunder.
- **Border / Divider Neutral** (`#E2DFD2`): Garis pemisah antar kolom jadwal, border card ringan.
- **Surface Hover Light** (`#F4F4E6`): State hover untuk list item dan baris kalender slot.

---

## 3. Tipografi (Typography Guideline)

Kombinasi 2 jenis font resmi yang saling melengkapi:

### 3.1. Font Utama: Poppins
> *"Poppins punya bentuk yang geometric, rounded, dan friendly"*

- **Karakter**: Geometris, sudut membulat ramah, modern, mudah terbaca dari jauh.
- **Penerapan**:
  - Judul Halaman (H1, H2, H3)
  - Tombol Call-to-Action (CTA) & Tombol Navigasi
  - Badge & Tag Kategori (Futsal, Badminton, Biliard, Tenis Meja)
  - Angka nominal harga & diskon promosi
- **Bobot (Weights)**:
  - `Regular (400)`: Teks tombol sekunder
  - `Medium (500)`: Sub-heading & filter pill
  - `SemiBold (600)`: Judul card, label harga, status badge
  - `Bold (700)`: Headline hero, penekanan angka promo

### 3.2. Font Pendukung: Montserrat
> *"Lebih terasa structured, clean, dan professional"*

- **Karakter**: Tegas, proporsional, bersih, sangat stabil untuk tata letak data padat.
- **Penerapan**:
  - Paragraf isi (*body text*) & deskripsi fasilitas
  - Form label, placeholder, dan input text
  - Kalender, tabel slot jam operasional (07.00 - 24.00)
  - Detail rincian pembayaran DP 50% & Syarat Ketentuan (S&K)
- **Bobot (Weights)**:
  - `Regular (400)`: Teks paragraf, rincian biaya
  - `Medium (500)`: Label formulir, header tabel data
  - `SemiBold (600)`: Ringkasan total invoice, teks peringatan

### 3.3. Skala Tipografi (Type Scale)

| Elemen | Ukuran (Desktop / Mobile) | Line Height | Font Family & Weight | Tracking (Letter Spacing) |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `56px` / `36px` | `1.1` | Poppins Bold (700) | `-0.02em` |
| **H1 (Page Title)** | `40px` / `28px` | `1.2` | Poppins SemiBold (600) | `-0.01em` |
| **H2 (Section Heading)** | `30px` / `22px` | `1.25` | Poppins SemiBold (600) | Normal |
| **H3 (Card Title)** | `20px` / `18px` | `1.3` | Poppins Medium (500) | Normal |
| **Body Large (Intro)** | `18px` / `16px` | `1.6` | Montserrat Regular (400) | Normal |
| **Body Base (Regular)** | `15px` / `14px` | `1.6` | Montserrat Regular (400) | Normal |
| **Small / Caption** | `13px` / `12px` | `1.5` | Montserrat Medium (500) | `+0.01em` |
| **Kicker / Overline** | `11px` / `10px` | `1.2` | Poppins SemiBold (600) | `+0.12em` (Uppercase) |

---

## 4. Sistem Status & Token Interaktif (Booking OBC Sport)

Berdasarkan aturan bisnis di [PRD OBC Sport](file:///d:/NexCube%20Project/OBC%20PROJECT/sport-obc/notes/prd.md), berikut panduan warna untuk komponen interaktif dan status slot:

### 4.1. Status Slot Lapangan / Meja

| Status Slot | Latar Belakang (*Bg*) | Border | Warna Teks / Icon | Keterangan & Aksi Pengguna |
| :--- | :---: | :---: | :---: | :--- |
| **Tersedia (Available)** | `#FFFFFF` (Hover: `#004000`) | `#004000` | `#004000` (Hover: `#FFFFFF`) | Slot siap dipilih pengguna untuk booking per jam. |
| **Dipilih (Selected)** | `#004000` | `#004000` | `#FFFFF7` | Slot aktif yang sedang dipilih user dalam sesi ini. |
| **Terisi / Booked** | `#FDECEE` | `#F5C2C7` | `#BF0021` | Slot sudah dibayar (DP Paid / Lunas), tidak dapat diklik. |
| **Event Gedung (Locked)** | `#EBEEDC` | `#C8D1A8` | `#404F14` | Lapang F1/F2 terkunci karena disewa untuk Wedding / Gathering. |
| **Maintenance / Tutup** | `#E9E7E0` | `#D5D1C5` | `#8A8780` | Jadwal perawatan lapangan oleh admin. |

### 4.2. Fitur Khusus OBC Sport

1. **Sports Membership (4x Pertemuan Berulang - Diskon 20%)**:
   - Card Banner: Background `#004000` dengan aksen border tipis `#404F14`.
   - Badge Promo: `#BF0021` (Merah Bunga Logo) dengan teks putih tebal *"HEMAT 20%"*.
   - Nilai Jual: Tampilan perbandingan harga coret (*strikethrough price*) dengan warna `#8A8780` dan harga diskon dengan warna `#FFFFF7` / `#004000`.

2. **Sewa Gedung / Event Space (Lapang F1 & F2)**:
   - Header Section: `#404F14` (Olive) dengan sentuhan hangat.
   - Flow Status Tag:
     - `Pending Nego`: Kuning Mustard (`#D4A017`)
     - `Invoice Issued`: Biru Slate (`#2A5C8A`)
     - `DP Paid / Locked`: Hijau Brand (`#004000`)

3. **Skema Pembayaran (Midtrans DP 50%)**:
   - Kotak Info DP: Latar `#F7F7EE` dengan border kiri tebal 4px berwarna `#004000`.
   - Rincian: Subtotal, Diskon (jika ada), Biaya Transaksi Midtrans, **Wajib Bayar Sekarang (DP 50%)**, Sisa Pelunasan di Lokasi.

---

## 5. Panduan Komponen UI (Component Guidelines)

### 5.1. Tombol (Buttons)
- **Primary Button**:
  - Normal: Background `#004000`, Teks `#FFFFF7`, Font Poppins SemiBold, Radius `8px` atau `100px` (pill).
  - Hover: Background `#002D00`, scale `1.02`.
- **Secondary / Accent Button**:
  - Normal: Background `#404F14`, Teks `#FFFFF7`, Font Poppins Medium.
  - Hover: Background `#323E10`.
- **High-Alert / Urgent Action**:
  - Normal: Background `#BF0021`, Teks `#FFFFFF`.
  - Hover: Background `#9E001B`.
- **Outline Button**:
  - Normal: Background transparan, Border 1.5px `#004000`, Teks `#004000`.
  - Hover: Background `#004000`, Teks `#FFFFF7`.

### 5.2. Card Fasilitas (Facility Cards)
- Background: `#FFFFFF`
- Border: `1px solid #E2DFD2`
- Border Radius: `16px`
- Shadow: `0 4px 16px rgba(52, 49, 51, 0.06)`
- Padding: `24px`
- Badge Cabang Olahraga: Background `#EBEEDC`, Teks `#404F14`, Font Poppins Medium (11px, Uppercase).

### 5.3. Formulir & Input
- Input Field: Background `#FFFFFF`, Border `1px solid #D5D1C5`, Border Radius `8px`, Font Montserrat Regular.
- Focus State: Border `2px solid #004000`, Box-shadow `0 0 0 3px rgba(0, 64, 0, 0.12)`.
- Label: Font Montserrat Medium, Warna `#343133`, 13px.

---

## 6. Snippet Kode Implementasi (CSS & Tailwind CSS v4)

### 6.1. CSS Variables (`src/index.css`)

```css
:root {
  /* Brand Primary Colors */
  --obc-charcoal: #343133;
  --obc-green-deep: linear-gradient(90deg, #265021 0%, #404F14 100%);
  --obc-green-olive: #404F14;
  --obc-ivory: #FFFFF7;
  --obc-white: #FFFFFF;
  --obc-red-carmine: #BF0021;

  /* Semantic UI Tokens */
  --color-bg-base: var(--obc-ivory);
  --color-bg-surface: var(--obc-white);
  --color-bg-muted: #F0F0D4;
  --color-text-main: var(--obc-charcoal);
  --color-text-muted: #6F6B6E;
  --color-border: #E2DFD2;

  --color-primary: var(--obc-green-deep);
  --color-primary-hover: #002D00;
  --color-secondary: var(--obc-green-olive);
  --color-accent-red: var(--obc-red-carmine);

  /* Typography */
  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Montserrat', sans-serif;
}
```

### 6.2. Tailwind CSS v4 Theme Configuration

Jika menggunakan `@theme` di Tailwind CSS v4:

```css
@theme {
  --color-obc-charcoal: #343133;
  --color-obc-green: #004000;
  --color-obc-olive: #404F14;
  --color-obc-ivory: #FFFFF7;
  --color-obc-red: #BF0021;
  --color-obc-cream: #F0F0D4;

  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Montserrat', sans-serif;
}
```

---

## 7. Checklist Penerapan Desain
- [x] Ekstraksi 5 kode warna resmi dari Brand Guideline: `#343133`, `#004000`, `#404F14`, `#FFFFF7`, `#FFFFFF`.
- [x] Ekstraksi warna aksen emblem bunga logo: `#BF0021`.
- [x] Pemetaan 2 jenis font: **Poppins** (Headings, buttons, badges) dan **Montserrat** (Body text, UI data, form).
- [x] Pemetaan status interaktif slot lapangan (Tersedia, Terisi, Event Gedung, Maintenance).
- [x] Integrasi styling dengan fitur PRD (Booking Lapang F1/F2, Tenis Meja, Biliard, Sepak Bola, Sports Membership 20%, Sewa Gedung, DP 50%).
- [x] Snippet konfigurasi CSS Variables dan Tailwind CSS v4.

background: linear-gradient(90deg, #265021 0%, #404F14 100%);
background: #FDFCF7;
background: var(--OBC-Text-Dark, #343133);
background: var(--OBC-Secondary-Green, #404F14);
background: var(--OBC-Element, #CDF178);
background: #FDF2F2;
background: linear-gradient(90deg, #004000 0%, #404F14 100%);
background: var(--OBC-Primary-Green, #004000);
background: #9AAD3E;
