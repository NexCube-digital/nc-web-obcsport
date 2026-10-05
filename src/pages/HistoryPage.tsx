import { useState } from 'react'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

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

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/historyService.js)
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

/* -------------------------------------------------------------------------
   Ikon (inline SVG)
   ------------------------------------------------------------------------- */
const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const IconHome = () => (
  <svg {...iconProps}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
)
const IconCalendar = () => (
  <svg {...iconProps}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
)
const IconAward = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="9" r="6" />
    <path d="m8.5 14 -1.5 8 5-3 5 3-1.5-8" />
    <path d="m9.5 9 1.8 1.8L14.5 7.5" />
  </svg>
)
const IconClock = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
const IconHelp = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
  </svg>
)
const IconBack = () => (
  <svg {...iconProps} width={26} height={26} strokeWidth={2.4}>
    <path d="M19 12H5M11 5l-7 7 7 7" />
  </svg>
)

// TODO: sesuaikan href dengan route aplikasi (react-router)
const BOTTOM_NAV = [
  { id: 'home', label: 'Home', href: '/', Icon: IconHome },
  { id: 'event', label: 'Sewa Event', href: '/sewa-event', Icon: IconCalendar },
  { id: 'membership', label: 'Membership', href: '/membership', Icon: IconAward },
  { id: 'riwayat', label: 'Riwayat', href: '/riwayat', Icon: IconClock },
  { id: 'help', label: 'Help/QnA', href: '/help', Icon: IconHelp },
]

function HistoryPage() {
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

  const handleDetail = (code: string) => {
    // TODO: arahkan ke halaman detail transaksi, mis. navigate(`/history/${code}`)
    console.log({ code })
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      {/* Navbar desktop (di mobile diganti header + bottom nav) */}
      <div className="hidden md:block">
        <NavbarDashboard userName={USER_NAME} />
      </div>

      {/* ================= Header mobile ================= */}
      <header className="md:hidden flex items-center gap-3 px-5 pt-6">
        <button
          type="button"
          aria-label="Kembali"
          onClick={() => window.history.back()}
          className="text-[#404F14] cursor-pointer"
        >
          <IconBack />
        </button>
        <h1 className="font-heading font-bold text-xl text-[#404F14]">
          Riwayat Transaksi
        </h1>
      </header>

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-5 pt-1 pb-32 md:px-6 md:pt-10 md:pb-16">
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
        <div className="hidden md:flex md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl text-[#343133]">
              Riwayat Transaksi Pemesanan
            </h1>
            <p className="mt-1 text-sm text-[#343133]">
              Pantau seluruh riwayat transaksi sewa lapangan dan membership akademi Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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

                    <h2 className="mt-3 font-heading font-bold text-base text-[#121212]">
                      {trx.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#6F6B6E]">Waktu: {trx.time}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-[#6F6B6E]">Total Pembayaran</span>
                      <span className="font-heading font-bold text-base text-[#404F14]">
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
              <h2 className="font-heading font-bold text-xl text-[#404F14]">
                Belum Ada Transaksi
              </h2>
              <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-[#6F6B6E]">
                Anda belum melakukan pemesanan lapangan apapun. Cari lapangan dan
                mulai latihan sehat bersama kami sekarang!
              </p>
              {/* TODO: sesuaikan href dengan halaman pencarian lapangan */}
              <a
                href="/"
                className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-[#404F14] px-8 text-sm font-heading font-bold text-white"
              >
                Cari Lapangan Sekarang
              </a>
            </div>
          )}
        </div>

        {/* ================= Tabel transaksi (desktop) ================= */}
        <section className="hidden md:block mt-6 rounded-2xl border border-[#D4D4D4] bg-white px-6 pt-6 pb-12 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#D4D4D4]">
                <th className="pb-4 text-xs font-heading font-bold text-[#343133] w-[170px]">
                  KODE BOOKING
                </th>
                <th className="pb-4 text-xs font-heading font-bold text-[#343133] w-[170px]">
                  TANGGAL TRANSAKSI
                </th>
                <th className="pb-4 text-xs font-heading font-bold text-[#343133]">
                  LAPANGAN / FASILITAS
                </th>
                <th className="pb-4 text-xs font-heading font-bold text-[#343133] w-[170px]">
                  TOTAL BAYAR
                </th>
                <th className="pb-4 text-xs font-heading font-bold text-[#343133] w-[170px]">
                  STATUS
                </th>
                <th className="pb-4 text-xs font-heading font-bold text-[#343133] w-[100px] text-center">
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
                        className={`inline-block rounded px-2 py-1 text-[10px] leading-none font-heading font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="pt-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleDetail(trx.code)}
                        className="text-xs font-heading font-bold text-[#404F14] underline underline-offset-2 cursor-pointer hover:text-[#004000]"
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

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* ================= Bottom navigation (mobile) ================= */}
      <nav
        aria-label="Navigasi utama"
        className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[#E5E5E5] bg-white"
      >
        <ul className="flex items-stretch justify-between px-2 pt-3 pb-5">
          {BOTTOM_NAV.map(({ id, label, href, Icon }) => {
            const isActive = id === 'riwayat'
            return (
              <li key={id} className="flex-1">
                <a
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center gap-1 text-[11px] ${
                    isActive
                      ? 'font-heading font-bold text-[#404F14]'
                      : 'text-[#6F6B6E]'
                  }`}
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default HistoryPage