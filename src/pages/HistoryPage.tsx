import { useState } from 'react'
import NavbarDashboard from '../components/layout/Navbar'
import MobileHeader from '../components/layout/MobileHeader'
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

      <div className="md:hidden">
        <MobileHeader variant="title" title="Riwayat Transaksi" />
      </div>

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

    </div>
  )
}

export default HistoryPage