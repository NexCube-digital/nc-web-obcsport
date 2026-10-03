




Product Requirement Document (PRD)
OBC Sport 
(Booking Fasilitas Olahraga)
Onny Barber Center (OBC) 


Versi 1.0 • 10 September 2026
Status: Draft - Pending Final Confirmation
Referensi: https://www.airbnb.co.id/

1. Overview
Platform booking online untuk penyewaan fasilitas olahraga OBC per jam, dengan sistem ketersediaan real-time berdasarkan resource fisik (lapangan/ruangan), bukan hanya jenis olahraga — karena satu lapangan bisa dipakai untuk beberapa cabang olahraga berbeda secara bergantian.
2. Latar Belakang & Kondisi Eksisting
OBC memiliki fasilitas sebagai berikut:
Resource
Cabang Olahraga yang Bisa Main
Kapasitas Slot Paralel
Lapang F1
Futsal, Badminton, Voli, Pickleball
1 (satu lapangan, satu waktu satu jenis olahraga)
Lapang F2
Basket, Sepak Bola
1 (satu lapangan, satu waktu satu jenis olahraga)
Ruang Tenis Meja
Tenis Meja
2 meja (bisa 2 booking paralel)
Ruang Biliard
Biliard
2 meja (bisa 2 booking paralel)

Catatan penting:
Lapang F1 dan Lapang F2 sebenarnya adalah lapangan futsal yang bisa dialihfungsikan menjadi gedung serbaguna (wedding, gathering, acara lain). Saat disewa sebagai gedung, lapangan tersebut tidak bisa di booking untuk olahraga di jam yang sama.
Karena satu Lapang menampung beberapa cabang olahraga, sistem harus mengunci resource lapangan, bukan hanya "jenis olahraga", supaya tidak terjadi double booking (misal Futsal dan Badminton pada Lapang A di jam yang sama).





3. Daftar Harga (Revisi — berdasarkan Price List Resmi)
Lapang F1 (Futsal 1 & Basket):
Jam
Harga/Jam
07.00–15.00
Rp125.000
15.00–18.00
Rp150.000
18.00–24.00
Rp175.000

Lapang F2 (Futsal 2):
Jam
Harga/Jam
07.00–15.00
Rp100.000
15.00–18.00
Rp125.000
18.00–24.00
Rp150.000

Sepak Bola (di Lapang F2): Paket flat Rp250.000 / 2 jam (bukan per jam biasa)
Badminton: 
Catatan: sudah termasuk 2 raket + 1 kok
Jam
Harga/Jam
07.00–16.00
Rp65.000/jam
16.00–24.00
Rp80.000/jam

Pickleball:


07.00–18.00
18.00–24.00
Weekday
Rp50.000/jam
Rp75.000/jam
Weekend
Rp75.000/jam
Rp50.000/jam



Tenis Meja (per meja): 
Catatan: sudah termasuk bet & bola
Paket
Harga
Paket Normal
Rp20.000/jam
Paket 2 Jam
Rp30.000/2 jam

Biliard (per meja): 
Paket
Harga
Paket Normal
Rp35.000/jam
Paket Rame
Rp50.000/2 jam

Voli: status belum jelas — akan dicek ulang ke OBC (belum ada di price list foto, sebelumnya Rp100rb/130rb per jam). Sementara ditandai "pending confirmation", belum masuk sistem dulu sampai dikonfirmasi.
Catatan: 
Weekday = Senin–Jumat, Weekend = Sabtu–Minggu. Hari libur nasional tetap mengikuti harga hari kerjanya masing-masing (contoh: libur nasional jatuh hari Selasa → tetap harga weekday), kecuali OBC menentukan lain di kemudian hari. 
4. Tujuan Produk
Memungkinkan pelanggan booking & bayar lapangan/ruangan secara online tanpa telepon manual.
Menghindari bentrok jadwal (double booking) antar cabang olahraga yang berbagi lapangan yang sama.
Memberi admin visibilitas penuh atas okupansi tiap resource (Lapang A, Lapang B, 2 meja tenis meja, 2 meja biliard).
Menyediakan satu sistem terpadu untuk booking olahraga dan booking Lapang F1/F2 sebagai gedung serbaguna (wedding/gathering), sehingga kedua jenis penggunaan lapangan saling terkunci otomatis tanpa risiko bentrok. 
Menyediakan skema membership yang memungkinkan pelanggan booking 4x pertemuan sekaligus dengan jadwal tetap (recurring) dan harga diskon, tanpa perlu booking ulang tiap minggu. 
5. User Roles
Role
Deskripsi
Guest/Customer
Browsing, cek jadwal, booking, bayar
Admin/Operator
Kelola jadwal, konfirmasi pembayaran manual (jika ada), blokir slot untuk maintenance/event, kelola harga
(Opsional) EO/Event Requester
Ajukan sewa gedung untuk acara non-olahraga
Event Requester (Penyewa Gedung)
Mengajukan & booking Lapang F1/F2 untuk acara non-olahraga (wedding, gathering, dll) langsung lewat sistem 

6. Functional Requirements
6.1 Katalog & Ketersediaan
Sistem harga sekarang bukan cuma weekday/weekend, tapi kombinasi:
Tiering jam (pagi/siang/malam) — berlaku untuk Lapang F1, F2, Badminton.
Weekday/weekend — hanya berlaku untuk Pickleball.
Paket flat per durasi tetap — Sepak Bola (2 jam), Tenis Meja (paket 2 jam), Biliard (paket 2 jam) — ini beda dari model "per jam" biasa, user harus bisa pilih antara harga normal per jam atau paket.
Tampilkan 8 cabang olahraga dengan harga weekday/weekend.
Kalender/slot per jam menunjukkan status: Tersedia / Terisi / Diblokir (event).
Saat user memilih cabang olahraga yang berbagi resource (misal Badminton), sistem otomatis mengecek ketersediaan Lapang A secara keseluruhan (lintas cabang olahraga di lapang tsb).
Tenis Meja & Biliard menampilkan ketersediaan per meja (Meja 1 / Meja 2).

Catatan: 
	Ini artinya kalkulasi harga saat booking jadi lebih kompleks: sistem harus cek tanggal → weekday/weekend (khusus Pickleball) → jam mulai & durasi → apply tiering harga per jam yang dilewati (misal booking Lapang F1 jam 14.00–16.00 kena 2 harga berbeda: 1 jam di tier 07-15 dan 1 jam di tier 15-18). 
6.2 Booking Flow
Pilih menu "Sewa Gedung/Event Space".
Pilih Lapang F1 atau F2.
Pilih tanggal & rentang jam (bisa multi-jam/multi-hari untuk event besar — perlu dikonfirmasi durasi maksimal event).
Isi detail acara (jenis acara, estimasi tamu, kontak).
Skema harga sewa gedung nego manual per acara — dihitung berbasis: jumlah jam sewa × tarif dasar + biaya tambahan (listrik, kebersihan, overhead lainnya sesuai skala acara). Tidak ada price list tetap/paket baku. Sistem tidak menampilkan harga otomatis untuk event — alur tetap: ajukan → admin hitung & follow up manual → invoice diterbitkan setelah nego selesai → DP 50% via Midtrans untuk lock slot.
Tidak ada durasi maksimal sewa — mengikuti kesepakatan per acara (bisa beberapa jam hingga 1 hari penuh, dihitung proporsional per jam).
DP 50% via Midtrans → konfirmasi otomatis, atau jika harga nego manual → admin follow up dulu sebelum invoice terbit.
Slot Lapang F1/F2 baru terkunci untuk olahraga setelah DP diterima (payment_status = DP Paid). Selama status masih "Pending Nego"/belum DP, slot tetap tersedia untuk dibooking olahraga — sistem perlu menampilkan warning ke admin bila ada event pending yang berpotensi bentrok, tapi tidak mengunci otomatis.




6.3 Pembayaran
Payment gateway: Midtrans.
DP wajib 50% dari total harga booking (baik olahraga maupun event), sisanya dibayar di tempat.
Biaya transaksi Midtrans dibebankan ke pelanggan (ditambahkan ke total tagihan saat checkout, bukan ditanggung OBC).
Refund: case by case — sistem menyediakan status "Refund Requested" yang masuk ke admin untuk diproses manual sesuai kebijakan yang berlaku saat itu (tidak ada refund otomatis/self-service di fase awal).
Minimal booking: 1 jam, tidak ada maksimal jam per transaksi (berlaku untuk booking olahraga; untuk event mengikuti poin di atas).
6.4 Admin Dashboard
Kalender master semua resource (Lapang A, Lapang B, Tenis Meja 1 & 2, Biliard 1 & 2).
CRUD jadwal manual (untuk booking via telepon/walk-in agar tetap sinkron).
Blokir slot untuk maintenance atau event gedung (wedding/gathering) — otomatis menutup semua cabang olahraga terkait lapang tersebut.
Laporan pendapatan per resource/per cabang olahraga.
Manajemen harga (jika sewaktu-waktu berubah).
6.5 Notifikasi
Reminder H-1 via WA/email.
Notifikasi ke admin saat ada booking baru.
6.6 Sports Membership (Fitur Baru)
Konsep dasar:
Pelanggan bayar di muka untuk 4x pertemuan pada cabang olahraga & jam yang sama, terjadwal berulang (misal tiap Selasa jam 19.00–20.00, selama 4 minggu).
Harga total = (harga normal per sesi × 4) × 80% (diskon 20%).
Setelah dibayar, ke-4 slot tersebut otomatis ter-booking dan terkunci atas nama pelanggan tsb (tidak perlu booking manual tiap minggu).
Flow:
Pelanggan pilih cabang olahraga, lapangan/meja, hari & jam tetap.
Sistem cek ketersediaan slot tsb untuk 4 minggu ke depan berturut-turut (hari yang sama, jam yang sama).
Jika salah satu dari 4 slot sudah terisi/bentrok → sistem tampilkan alternatif (geser jam/hari, atau skip minggu itu dan sistem cari slot pengganti — perlu keputusan bisnis, lihat Open Question).
Tampilkan total harga (sudah termasuk diskon 20%) & rincian 4 jadwal.
Bayar penuh di muka via Midtrans (kemungkinan tidak ada skema DP untuk membership, langsung full payment — perlu konfirmasi).
Setelah bayar, sistem generate 4 booking otomatis berstatus "Confirmed" & mengirim jadwal lengkap ke pelanggan.
Perbedaan dari booking reguler:


Booking Reguler
Sports Membership
Jumlah sesi
1x per transaksi
4x per transaksi
Harga
Normal (sesuai tiering)
Diskon 20% dari total 4 sesi
Pembayaran
DP 50% + pelunasan di tempat
Kemungkinan full payment di muka
Jadwal
Fleksibel, kapan saja
Tetap/recurring (hari & jam sama tiap minggu)
Reschedule
Bebas booking ulang
Perlu aturan reschedule khusus (lihat Open Question)




7. Data Model (High-Level)
Resource: id, nama (Lapang F1, Lapang F2, Ruang Tenis Meja, Ruang Biliard), jumlah unit paralel, is_event_capable (boolean — true untuk F1 & F2)
Booking: field payment_status (Unpaid → belum lock apapun, DP Paid → lock resource, Fully Paid, Refund Requested, Refunded). 
Event Block digabung ke dalam tabel Booking dengan booking_type = Event, tidak perlu tabel terpisah lagi karena sekarang bagian dari alur sistem yang sama.
Membership: id, customer_id, sport_id, resource_id, hari, jam, tanggal_mulai, jumlah_sesi (default 4), harga_total (setelah diskon), status (Active/Completed/Cancelled)
Booking: tambah field membership_id (nullable — untuk link 4 booking ke satu membership), booking_source (Regular / Membership)
jumlah_jam_sewa, biaya_dasar (jam × tarif), biaya_tambahan (listrik/kebersihan/overhead — bisa multiple line items), total_harga (dihitung manual oleh admin, bukan otomatis dari sistem)
Status alur khusus event: Pending Review → Nego → Invoice Issued → DP Paid → Confirmed → Completed
8. Non-Functional Requirements
Real-time availability check untuk hindari race condition (dua orang booking slot sama bersamaan).
Mobile-friendly (asumsi mayoritas booking dari HP).
Uptime tinggi terutama di jam ramai (sore-malam & weekend).
Keamanan data pelanggan & transaksi (HTTPS, enkripsi data sensitif).
9. Out of Scope (Fase Awal)
Sistem membership/loyalty program.
Booking OBC (terpisah, lihat PRD Compro).
Aplikasi mobile native (fase awal web-based/PWA dulu).
10. Metrik Sukses
Jumlah booking per bulan per cabang olahraga.
Tingkat okupansi tiap resource.
Conversion rate dari visit → booking selesai.
Pengurangan komplain akibat double booking (dibanding sistem manual sebelumnya).
11. UseCase

12. FlowChart
alur booking olahraga di OBC Sport 
alur Sports Membership (4x sesi dengan diskon 20%): 


alur pengajuan sewa gedung/event (Lapang F1/F2) 



Open Questions (perlu dikonfirmasi ke OBC)

Definisi weekday/weekend → Terjawab.
Kebijakan DP → Terjawab: 50%.
Kebijakan refund → Terjawab: case by case (manual).
Provider payment gateway → Terjawab: Midtrans, fee ke pelanggan.
Apakah booking gedung masuk sistem ini? → Terjawab: YA.
Min/maks durasi → Terjawab: min 1 jam, tanpa maksimal (untuk olahraga).
Saat pengajuan event masih berstatus "pending", apakah slot F1/F2 langsung terkunci untuk olahraga, atau baru terkunci setelah DP masuk? → Terjawab: setelah DP masuk
Apakah hari libur nasional yang jatuh di weekday tetap dihitung harga weekday, atau OBC mau kebijakan khusus? → Terjawab: Hari libur nasional tetap mengikuti harga hari kerjanya masing-masing (contoh: libur nasional jatuh hari Selasa → tetap harga weekday), kecuali OBC menentukan lain di kemudian hari.
Jam operasional harian (buka-tutup) untuk tiap resource — masih belum dijawab. → Terjawab: 07.00–24.00, buka setiap hari Weekday = Senin–Jumat, Weekend = Sabtu–Minggu. 
Baru: Apakah harga sewa gedung (event) pakai price list tetap (misal per hari/paket), atau nego manual per acara?
Baru: Apakah ada durasi maksimal untuk booking event (misal wedding bisa sewa 1 hari penuh — apakah dihitung per jam tetap atau paket harian)?
S&K membership: apa saja detail syarat & ketentuannya? (misal: berlaku untuk semua cabang olahraga atau tertentu saja, masa berlaku 4 sesi ini apakah harus habis dalam 4 minggu berturut-turut atau boleh fleksibel/jeda?)
Apakah membership pakai full payment (bukan DP 50% seperti booking reguler), atau tetap ada skema DP?
Reschedule policy: kalau pelanggan membership tidak bisa hadir di salah satu dari 4 jadwal, apakah bisa reschedule ke hari lain, atau hangus (no-show = hilang slot)?
Konflik jadwal 4 minggu ke depan: kalau salah satu dari 4 slot ternyata sudah dibooking orang lain (booking reguler) sebelum pelanggan membership pilih jadwal itu — sistem otomatis blokir opsi itu dari awal, atau ada mekanisme lain?
Apakah membership berlaku untuk semua 8 cabang olahraga, atau cuma yang disebut di promo (pickleball terlihat jadi fokus visual, tapi teks bilang generic "Sports Membership")?
Apakah ada limit berapa membership aktif yang bisa dimiliki satu pelanggan sekaligus (misal 1 pelanggan pegang 2 slot membership beda hari)?
