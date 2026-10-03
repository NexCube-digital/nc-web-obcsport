import { useState } from 'react'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type TransactionStatus = 'success' | 'failed' | 'pending'
type FilterType = 'all' | 'success' | 'pending'

interface Transaction {
  id: string
  code: string
  date: string
  facility: string
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

const FILTERS: FilterOption[] = [
  { id: 'all', label: 'Semua' },
  { id: 'success', label: 'Berhasil' },
  { id: 'pending', label: 'Menunggu' },
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

// Label dan warna badge per status (warna mengikuti desain)
const STATUS_BADGE: Record<TransactionStatus, { label: string; className: string }> = {
  success: { label: 'SUCCESS', className: 'bg-[#10B95B] text-white' },
  failed: { label: 'FAILED', className: 'bg-[#E53E3E] text-white' },
  pending: { label: 'Pending', className: 'bg-[#FFA31A] text-white' },
}

function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // Filter sesuai tombol: Semua / Berhasil / Menunggu
  const filteredTransactions = TRANSACTIONS.filter((trx) => {
    if (activeFilter === 'all') return true
    return trx.status === activeFilter
  })

  const handleDetail = (code: string) => {
    // TODO: arahkan ke halaman detail transaksi, mis. navigate(`/history/${code}`)
    console.log({ code })
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-6 pt-10 pb-16">
        {/* ================= Judul & filter ================= */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
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

        {/* ================= Tabel transaksi ================= */}
        <section className="mt-6 rounded-2xl border border-[#D4D4D4] bg-white px-6 pt-6 pb-12 overflow-x-auto">
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

      <Footer />
    </div>
  )
}

export default HistoryPage