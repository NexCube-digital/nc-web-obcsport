import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import NavbarDashboard from '../components/layout/Navbar'
import MobileHeader from '../components/layout/MobileHeader'
import Footer from '../components/layout/LandingFooter'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type TransactionStatus = 'success' | 'failed' | 'pending'
type FilterType = 'all' | 'success' | 'pending' | 'failed'

interface Transaction {
  id: string
  code: string
  date: string
  facility: string
  total: string
  status: TransactionStatus
}

interface MobileTransaction {
  id: string
  date: string
  title: string
  time: string
  total: string
  status: TransactionStatus
}

interface FilterOption {
  id: FilterType
  label: string
}

interface Facility {
  id: string
  name: string
  price: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/historyService.js)
   Untuk melihat empty state, kosongkan TRANSACTIONS & MOBILE_TRANSACTIONS ([]).
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// Filter tampilan desktop
const FILTERS: FilterOption[] = [
  { id: 'all', label: 'Semua' },
  { id: 'success', label: 'Berhasil' },
  { id: 'pending', label: 'Menunggu' },
]

// Filter tampilan mobile (sesuai desain mobile)
const MOBILE_FILTERS: FilterOption[] = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Aktif' },
  { id: 'success', label: 'Selesai' },
  { id: 'failed', label: 'Gagal' },
]

// Daftar lapangan di panel "Pesan Lapangan Sekarang" (empty state desktop)
// TODO: ganti dengan data dari API / services/facilityService.js
const FACILITIES: Facility[] = [
  { id: 'futsal-premium', name: 'Lapangan Futsal Premium', price: 'Mulai Rp 125.000 / Jam' },
  { id: 'badminton-vip', name: 'Badminton VIP Court', price: 'Mulai Rp 80.000 / Jam' },
  { id: 'billiard-premium', name: 'Meja Billiard Premium', price: 'Mulai Rp 60.000 / Jam' },
]

// TODO: isi dari API / services/historyService.js
const TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    code: 'OBC-FUT-9021',
    date: '12 Mar 2026',
    facility: 'Futsal Premium Hall A',
    total: 'Rp 250.000',
    status: 'success',
  },
  {
    id: 'trx-2',
    code: 'OBC-BAD-1120',
    date: '11 Mar 2026',
    facility: 'Badminton VIP Court',
    total: 'Rp 160.000',
    status: 'failed',
  },
  {
    id: 'trx-3',
    code: 'OBC-BIL-2321',
    date: '05 Mar 2026',
    facility: 'Billiard Premium Table',
    total: 'Rp 120.000',
    status: 'pending',
  },
  {
    id: 'trx-4',
    code: 'OBC-FUT-8812',
    date: '28 Feb 2026',
    facility: 'Futsal Premium Hall A',
    total: 'Rp 250.000',
    status: 'success',
  },
]

// Data kartu transaksi tampilan mobile (sesuai desain mobile)
// TODO: isi dari API / services/historyService.js
const MOBILE_TRANSACTIONS: MobileTransaction[] = [
  {
    id: 'm-1',
    date: '28 Sep 2024',
    title: 'Futsal Lapangan 1 (Interlock)',
    time: '08:00 - 10:00 (2 Jam)',
    total: 'Rp 280.000',
    status: 'success',
  },
  {
    id: 'm-2',
    date: '28 Sep 2024',
    title: 'Badminton Lapangan 3',
    time: '16:00 - 17:00 (1 Jam)',
    total: 'Rp 125.000',
    status: 'pending',
  },
  {
    id: 'm-3',
    date: '25 Sep 2024',
    title: 'Billiard Meja 2',
    time: '19:00 - 21:00 (2 Jam)',
    total: 'Rp 150.000',
    status: 'failed',
  },
]

// Label dan warna badge per status (tabel desktop)
const STATUS_BADGE: Record<TransactionStatus, { label: string; className: string }> = {
  success: { label: 'SUCCESS', className: 'bg-[#10B95B] text-white' },
  failed: { label: 'FAILED', className: 'bg-[#E53E3E] text-white' },
  pending: { label: 'Pending', className: 'bg-[#FFA31A] text-white' },
}

// Badge outline untuk kartu mobile
const MOBILE_STATUS_BADGE: Record<TransactionStatus, { label: string; className: string }> = {
  success: { label: 'Sukses', className: 'border-[#10B95B] text-[#10B95B]' },
  pending: { label: 'Pending', className: 'border-[#E53E3E] text-[#E53E3E]' },
  failed: { label: 'Gagal', className: 'border-[#6F6B6E] text-[#6F6B6E]' },
}

function HistoryPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // Filter sesuai tombol (desktop: Semua / Berhasil / Menunggu)
  const filteredTransactions = TRANSACTIONS.filter((trx) => {
    if (activeFilter === 'all') return true
    return trx.status === activeFilter
  })

  // Filter untuk kartu mobile (Semua / Aktif / Selesai / Gagal)
  const filteredMobile = MOBILE_TRANSACTIONS.filter((trx) => {
    if (activeFilter === 'all') return true
    return trx.status === activeFilter
  })

  // True jika user memang belum punya transaksi sama sekali (bukan karena filter)
  const hasNoTransactions = TRANSACTIONS.length === 0
  const hasNoMobileTransactions = MOBILE_TRANSACTIONS.length === 0

  const handleDetail = (code: string) => {
    // TODO: arahkan ke halaman detail transaksi, mis. navigate(`/history/${code}`)
    console.log({ code })
  }

  return (
    /*
      Layout flex-kolom setinggi layar:
      - <main> memakai flex-1 sehingga mengisi sisa ruang
      - footer otomatis menempel di dasar halaman walau konten sedikit
    */
    <div className="flex min-h-screen flex-col bg-white font-body text-[#343133] md:h-screen">
      {/* Navbar desktop (di mobile diganti header + bottom nav) */}
      <div className="hidden shrink-0 md:block">
        <NavbarDashboard userName={USER_NAME} />
      </div>

      <div className="md:hidden">
        <MobileHeader variant="title" title="Riwayat Transaksi" />
      </div>

      {/* ============================================================
          DESKTOP: kondisi kosong (belum ada transaksi sama sekali)
          ============================================================ */}
      {hasNoTransactions && (
        <main className="hidden flex-1 items-center bg-[#FFFEF7] md:flex">
          <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
            {/* ---- Kolom kiri: ilustrasi + teks ---- */}
            <div className="mx-auto w-full max-w-[520px] lg:mx-0">
              {/* TODO: ganti dengan ilustrasi asli, sementara pakai placeholder logo + angka */}
              <div className="flex h-[220px] w-full max-w-[380px] flex-col items-center justify-center rounded-3xl bg-[#F1F4EA] lg:h-[260px]">
                <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-[#004000]">
                  <div className="flex h-[38px] w-[38px] translate-x-[4px] translate-y-[5px] items-center justify-center rounded-full bg-[#004000] font-heading text-base font-bold text-white">
                    8
                  </div>
                </div>
                <p className="mt-4 font-heading text-lg font-bold text-[#004000]">
                  OBC Sport Center
                </p>
              </div>

              <h1 className="mt-8 font-heading text-3xl font-bold leading-tight text-[#343133] lg:text-[40px] lg:leading-[1.15]">
                Belum Ada Jadwal
                <br />
                Lapangan Aktif
              </h1>
              <p className="mt-3 max-w-[500px] text-base leading-relaxed text-[#4B484A]">
                Anda belum memiliki transaksi booking aktif saat ini. Jelajahi
                ketersediaan lapangan premium kami dan mulailah berolahraga
                bersama komunitas OBC hari ini!
              </p>
            </div>

            {/* ---- Kolom kanan: pesan lapangan cepat ---- */}
            <section className="mx-auto w-full max-w-[480px] rounded-3xl border border-[#D9D9D9] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] lg:mx-0 lg:ml-auto">
              <h2 className="font-heading text-xl font-bold text-[#343133]">
                Pesan Lapangan Sekarang
              </h2>

              <div className="mt-6 space-y-3.5">
                {FACILITIES.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-heading text-sm font-bold text-[#343133]">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#6F6B6E]">{item.price}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/booking/${item.id}`)} // TODO: sesuaikan ke route booking sebenarnya
                      className="flex shrink-0 cursor-pointer items-center gap-1 font-heading text-xs font-bold text-[#004000] hover:opacity-80"
                    >
                      Booking
                      <Zap size={12} strokeWidth={1.5} className="fill-[#FFE680] text-[#F5C518]" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate('/fasilitas')} // TODO: sesuaikan ke route daftar fasilitas
                className="mt-6 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-[#CDF074] px-6 text-[13px] font-normal text-[#343133] transition-colors hover:bg-[#BFE45F] sm:w-[306px]"
              >
                Cari Lapangan Lain
              </button>
            </section>
          </div>
        </main>
      )}

      {/* ============================================================
          Konten utama: mobile + desktop (saat ada data)
          ============================================================ */}
      <main
        className={`mx-auto min-h-0 w-full max-w-[1248px] flex-1 px-5 pt-1 pb-32 md:px-6 md:pt-8 md:pb-8 ${
          hasNoTransactions ? 'md:hidden' : 'md:flex md:flex-col'
        }`}
      >
        {/* ================= Judul & filter (mobile) ================= */}
        <div className="md:hidden">
          <p className="text-sm text-[#6F6B6E]">Daftar pemesanan lapangan Anda</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {MOBILE_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`shrink-0 rounded-full border px-5 py-2 text-xs font-heading font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#404F14] border-[#404F14] text-white'
                      : 'bg-white border-[#D4D4D4] text-[#6F6B6E]'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ================= Judul & filter (desktop) ================= */}
        <div className="hidden gap-4 md:flex md:flex-col lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#343133] lg:text-3xl">
              Riwayat Transaksi Pemesanan
            </h1>
            <p className="mt-1 text-sm text-[#343133]">
              Pantau seluruh riwayat transaksi sewa lapangan dan membership akademi Anda.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-heading font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#404F14] border-[#404F14] text-white'
                      : 'bg-white border-[#404F14] text-[#404F14] hover:bg-[#F5FAF3]'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ================= Kartu transaksi (mobile) ================= */}
        <div className="md:hidden">
          {filteredMobile.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {filteredMobile.map((trx) => {
                const badge = MOBILE_STATUS_BADGE[trx.status]
                return (
                  <li
                    key={trx.id}
                    className="rounded-xl border border-[#E5E5E5] bg-white px-3.5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-heading font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-[#6F6B6E]">{trx.date}</span>
                    </div>

                    <h2 className="mt-3 font-heading text-base font-bold text-[#121212]">
                      {trx.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#6F6B6E]">Waktu: {trx.time}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-[#6F6B6E]">Total Pembayaran</span>
                      <span className="font-heading text-base font-bold text-[#404F14]">
                        {trx.total}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            /* Kondisi kosong mobile */
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
              <h2 className="font-heading text-xl font-bold text-[#404F14]">
                {hasNoMobileTransactions ? 'Belum Ada Transaksi' : 'Tidak Ada Hasil'}
              </h2>
              <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-[#6F6B6E]">
                {hasNoMobileTransactions
                  ? 'Anda belum melakukan pemesanan lapangan apapun. Cari lapangan dan mulai latihan sehat bersama kami sekarang!'
                  : 'Belum ada transaksi untuk filter ini. Coba pilih filter lain.'}
              </p>
              {/* TODO: sesuaikan href dengan halaman pencarian lapangan */}
              {hasNoMobileTransactions && (
                <a
                  href="/"
                  className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-[#404F14] px-8 text-sm font-heading font-bold text-white"
                >
                  Cari Lapangan Sekarang
                </a>
              )}
            </div>
          )}
        </div>

        {/* ================= Tabel transaksi (desktop) ================= */}
        <section className="mt-6 hidden min-h-0 overflow-auto rounded-2xl border border-[#D4D4D4] bg-white px-4 pb-6 md:block lg:px-6">
          <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="w-[160px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                  KODE BOOKING
                </th>
                <th className="w-[160px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                  TANGGAL TRANSAKSI
                </th>
                <th className="sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                  LAPANGAN / FASILITAS
                </th>
                <th className="w-[150px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                  TOTAL BAYAR
                </th>
                <th className="w-[130px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                  STATUS
                </th>
                <th className="w-[90px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-center text-xs font-heading font-bold text-[#343133]">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((trx) => {
                const badge = STATUS_BADGE[trx.status]
                return (
                  <tr key={trx.id}>
                    <td className="pt-6 text-sm font-heading font-bold text-[#404F14]">
                      {trx.code}
                    </td>
                    <td className="pt-6 text-sm text-[#6F6B6E]">{trx.date}</td>
                    <td className="pt-6 text-sm font-heading font-bold text-[#343133]">
                      {trx.facility}
                    </td>
                    <td className="pt-6 text-sm font-heading font-bold text-[#343133]">
                      {trx.total}
                    </td>
                    <td className="pt-6">
                      <span
                        className={`inline-block rounded px-2 py-1 text-[10px] font-heading font-bold leading-none ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="pt-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleDetail(trx.code)}
                        className="cursor-pointer text-xs font-heading font-bold text-[#404F14] underline underline-offset-2 hover:text-[#004000]"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Kondisi kosong saat filter tidak menemukan data */}
          {filteredTransactions.length === 0 && (
            <p className="pt-6 text-sm text-[#6F6B6E]">
              Belum ada transaksi untuk filter ini.
            </p>
          )}
        </section>
      </main>

      {/* Footer selalu menempel di dasar halaman (mt-auto) */}
      <div className="mt-auto hidden shrink-0 md:block">
        <Footer />
      </div>
    </div>
  )
}

export default HistoryPage