import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import { getBookings, type BookingSummary } from '../../services/bookingService'
import { getApiErrorMessage } from '../../services/apiService'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type TransactionStatus = 'success' | 'failed' | 'pending'
type FilterType = 'all' | 'success' | 'pending' | 'failed'
const PAGE_SIZE = 10

interface Transaction {
  id: string
  code: string
  paymentMethod: string | null
  date: string
  facility: string
  total: string
  status: TransactionStatus
}

interface MobileTransaction {
  id: string
  paymentMethod: string | null
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
// Filter tampilan desktop
const FILTERS: FilterOption[] = [
  { id: 'all', label: 'Semua' },
  { id: 'success', label: 'Berhasil' },
  { id: 'pending', label: 'Menunggu' },
  { id: 'failed', label: 'Gagal' },
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

function toTransactionStatus(status: string): TransactionStatus {
  if (status === 'fully_paid' || status === 'completed') return 'success'
  if (status === 'cancelled' || status === 'expired' || status === 'refunded') return 'failed'
  return 'pending'
}

function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function mapBooking(booking: BookingSummary): { desktop: Transaction; mobile: MobileTransaction } {
  const status = toTransactionStatus(booking.status)
  const date = new Date(`${booking.bookingDate}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const startTime = minutesToTime(booking.startMinute)
  const endTime = minutesToTime(booking.endMinute)
  const code = `BOOK-${booking.id.slice(-8).toUpperCase()}`

  return {
    desktop: {
      id: booking.id,
      code,
      paymentMethod: booking.latestPayment?.method ?? null,
      date,
      facility: booking.resource.name,
      total: booking.totalPriceFormatted,
      status,
    },
    mobile: {
      id: booking.id,
      paymentMethod: booking.latestPayment?.method ?? null,
      date,
      title: `${booking.resource.name} - ${booking.sportType}`,
      time: `${startTime} - ${endTime} (${(booking.endMinute - booking.startMinute) / 60} Jam)`,
      total: booking.totalPriceFormatted,
      status,
    },
  }
}

function HistoryPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [mobileTransactions, setMobileTransactions] = useState<MobileTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadBookings = (showError: boolean) => {
      getBookings({ page: 1, limit: 100 })
        .then(({ bookings }) => {
          if (!active) return
          const mapped = bookings.map(mapBooking)
          setTransactions(mapped.map((item) => item.desktop))
          setMobileTransactions(mapped.map((item) => item.mobile))
        })
        .catch((error: unknown) => {
          if (active && showError) {
            toast.error(getApiErrorMessage(error, 'Riwayat booking tidak dapat dimuat.'))
          }
        })
        .finally(() => { if (active) setIsLoading(false) })
    }

    loadBookings(true)
    const refreshTimer = window.setInterval(() => loadBookings(false), 30_000)

    return () => {
      active = false
      window.clearInterval(refreshTimer)
    }
  }, [])

  // Filter sesuai tombol (desktop: Semua / Berhasil / Menunggu)
  const filteredTransactions = transactions.filter((trx) => {
    if (activeFilter === 'all') return true
    return trx.status === activeFilter
  })

  // Filter untuk kartu mobile (Semua / Aktif / Selesai / Gagal)
  const filteredMobile = mobileTransactions.filter((trx) => {
    if (activeFilter === 'all') return true
    return trx.status === activeFilter
  })
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const displayedPage = Math.min(currentPage, totalPages)
  const pageStart = (displayedPage - 1) * PAGE_SIZE
  const currentTransactions = filteredTransactions.slice(pageStart, pageStart + PAGE_SIZE)
  const currentMobileTransactions = filteredMobile.slice(pageStart, pageStart + PAGE_SIZE)

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  // True jika user memang belum punya transaksi sama sekali (bukan karena filter)
  const hasNoTransactions = transactions.length === 0 && !isLoading
  const hasNoMobileTransactions = mobileTransactions.length === 0 && !isLoading

  const handleDetail = (transaction: Pick<Transaction, 'id' | 'status' | 'paymentMethod'>) => {
    if (transaction.status === 'pending' && transaction.paymentMethod === 'credit_card') {
      navigate(`/credit-card-payment?bookingId=${encodeURIComponent(transaction.id)}`, {
        state: { bookingId: transaction.id },
      })
      return
    }

    const pathByStatus: Record<TransactionStatus, string> = {
      pending: '/information-order',
      success: '/success-order',
      failed: '/failed-order',
    }

    navigate(`${pathByStatus[transaction.status]}?bookingId=${encodeURIComponent(transaction.id)}`, {
      state: { bookingId: transaction.id },
    })
  }

  return (
    /*
      Layout flex-kolom setinggi layar:
      - <main> memakai flex-1 sehingga mengisi sisa ruang
      - footer otomatis menempel di dasar halaman walau konten sedikit
    */
    <div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
      {/* Navbar desktop (di mobile diganti header + bottom nav) */}
      <div className="hidden shrink-0 md:block">
        <NavbarDashboard />
      </div>

      <div className="md:hidden">
        <MobileHeader variant="title" title="Riwayat Transaksi" />
      </div>

      {isLoading && <p role="status" className="mx-auto mt-6 text-sm text-[#6F6B6E]">Memuat riwayat booking...</p>}
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
                  onClick={() => handleFilterChange(filter.id)}
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
                  onClick={() => handleFilterChange(filter.id)}
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
          <DeferredSection placeholderClassName="mt-4 min-h-[420px]">
          {filteredMobile.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {currentMobileTransactions.map((trx) => {
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
                    <button
                      type="button"
                      onClick={() => handleDetail(trx)}
                      className="mt-3 w-full rounded-lg border border-[#404F14] py-2 font-heading text-xs font-bold text-[#404F14]"
                    >
                      Detail
                    </button>
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
          </DeferredSection>
        </div>

        {/* ================= Tabel transaksi (desktop) ================= */}
        <DeferredSection placeholderClassName="hidden min-h-[320px] md:block">
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
              {currentTransactions.map((trx) => {
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
                        onClick={() => handleDetail(trx)}
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
        </DeferredSection>

        {filteredTransactions.length > 0 && totalPages > 1 && (
          <nav
            aria-label="Pagination riwayat transaksi"
            className="mt-5 flex items-center justify-center gap-4 pb-4"
          >
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, displayedPage - 1))}
              disabled={displayedPage === 1}
              aria-label="Halaman sebelumnya"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4D4D4] text-[#404F14] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span aria-live="polite" className="font-heading text-sm text-[#343133]">
              Halaman {displayedPage} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, displayedPage + 1))}
              disabled={displayedPage === totalPages}
              aria-label="Halaman berikutnya"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4D4D4] text-[#404F14] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </nav>
        )}
      </main>

      {/* Footer selalu menempel di dasar halaman */}
      <div className="mt-auto w-full">
        <DeferredFooter />
      </div>
        
    </div>
  )
}

export default HistoryPage