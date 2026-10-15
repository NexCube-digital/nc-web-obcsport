import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, CircleX } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import { useIsMobile } from '../../hooks/useIsMobile'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface FailedState {
  bookingCode?: string
  facility?: string
  schedule?: string
  total?: number
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// TODO: nomor WhatsApp admin sementara hardcode, ambil dari konfigurasi
const ADMIN_WA_URL = 'https://wa.me/6281234567890'

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

// Fallback bila halaman dibuka tanpa state (sesuai desain)
const DEFAULT_BOOKING_CODE = 'OBC-BAD-1120'
const DEFAULT_FACILITY = 'Badminton VIP Court'
const DEFAULT_SCHEDULE = 'Sabtu, 14 Mar (09:00 - 11:00)'
const DEFAULT_TOTAL = 160000

const TROUBLESHOOT_STEPS: string[] = [
  'Pastikan koneksi internet Anda stabil sebelum memindai QRIS.',
  'Selesaikan pembayaran dalam kurun waktu kurang dari 15 menit setelah QR dibuat.',
  'Apabila saldo Anda terpotong namun status belum berubah, hubungi Admin OBC via WhatsApp.',
]

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function FailedOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const state = (location.state as FailedState | null) ?? {}

  const bookingCode = state.bookingCode ?? DEFAULT_BOOKING_CODE
  const facility = state.facility ?? DEFAULT_FACILITY
  const schedule = state.schedule ?? DEFAULT_SCHEDULE
  const total = state.total ?? DEFAULT_TOTAL
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)

  return (
    <>
      {/* ===================================================================
          TAMPILAN MOBILE (< md): layout mengikuti desain mobile,
          isi & teks mengikuti versi PC.
          =================================================================== */}
      {isMobile && <MobileHeader variant="title" title="Pesanan Gagal" showBottomNav={false} />}
      {isMobile && (
        <div
          className={`flex h-[calc(100dvh-4rem)] flex-col bg-white px-4 pb-5 pt-3 font-body text-[#343133] overscroll-contain ${
          isOrderDetailsOpen ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
        >
        <div
          role="img"
          aria-label="Pembayaran gagal"
          className="grid h-20 w-full place-items-center text-[#E02424]"
        >
          <CircleX
            size={58}
            strokeWidth={1.8}
            aria-hidden="true"
            className="failed-icon-shake"
          />
        </div>

        {/* Judul & deskripsi, rata tengah */}
        <div className="mt-3 text-center">
          <span className="inline-block rounded-full bg-[#FDE8E8] px-3 py-1.5 font-heading text-[10px] font-bold leading-none text-[#E02424]">
            TRANSAKSI DITOLAK / GAGAL BAYAR
          </span>
          <h1 className={`${FONT_MONTSERRAT} mt-2 text-lg font-bold leading-6 text-[#343133]`}>
            Pemesanan Gagal: Waktu Pembayaran Habis
          </h1>
          <p className="mt-1.5 font-heading text-[11px] leading-4 text-[#343133]">
            Batas waktu pembayaran 15 menit menggunakan sistem otomatis QRIS atau Transfer
            Bank Anda telah berakhir. Jangan khawatir, saldo Anda tidak terpotong. Silakan
            ajukan ulang pemesanan jadwal lapangan Anda.
          </p>
        </div>

        {/* Kartu informasi pesanan gagal */}
        <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className={`${FONT_MONTSERRAT} text-sm font-semibold leading-5 text-[#343133]`}>
              Informasi Pesanan Gagal
            </h2>
            <button
              type="button"
              onClick={() => setIsOrderDetailsOpen((open) => !open)}
              aria-expanded={isOrderDetailsOpen}
              className="flex shrink-0 cursor-pointer items-center gap-1 font-heading text-[11px] font-bold text-[#404F14]"
            >
              {isOrderDetailsOpen ? 'Ringkas' : 'Lihat selengkapnya'}
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`transition-transform ${isOrderDetailsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {isOrderDetailsOpen && <>
          <dl className="mt-3 space-y-2 font-heading text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Kode Booking</dt>
              <dd className="font-bold text-[#E02424] line-through">{bookingCode}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Status Transaksi</dt>
              <dd className="rounded bg-[#E53E3E] px-2 py-1 text-[9px] font-bold leading-none text-white">
                EXPIRED
              </dd>
            </div>
          </dl>

          <hr className="my-3 border-[#D4D4D4]" />

          <dl className="space-y-2 font-heading text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#343133]">Fasilitas / Lapangan</dt>
              <dd className="text-right font-bold text-[#121212]">{facility}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#343133]">Jadwal Main</dt>
              <dd className="text-right font-bold text-[#121212]">{schedule}</dd>
            </div>
          </dl>
          </>}

          <hr className="my-2 border-[#D4D4D4]" />

          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-bold text-[#121212]">
              Total Harus Dibayar
            </span>
            <span className={`${FONT_MONTSERRAT} text-xl font-bold text-[#343133]`}>
              {formatRupiah(total)}
            </span>
          </div>
        </section>

        {/* Langkah penyelesaian masalah */}
        <h2 className="mt-3 font-heading text-[11px] font-bold text-[#121212]">
          Langkah Penyelesaian Masalah:
        </h2>
        <ol className="mt-1.5 space-y-1 font-heading text-[10px] leading-3.5 text-[#343133]">
          {TROUBLESHOOT_STEPS.map((step, index) => (
            <li key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>

        {/* Tombol, menempel di bawah layar */}
        <div className="mt-auto space-y-2 pt-4">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="h-10 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E]"
          >
            Coba Bayar Kembali
          </button>
          <a
            href={ADMIN_WA_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-full items-center justify-center rounded-xl border border-[#404F14] bg-white font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#F5FAF3]"
          >
            Hubungi Admin OBC
          </a>
        </div>
        </div>
      )}

        {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}

      {!isMobile && <div className="min-h-screen flex flex-col bg-white font-body text-[#343133]">
        <NavbarDashboard userName={USER_NAME} showDesktopNavigation={false} showMobileHeader={false} />

        <main className="mx-auto flex w-full max-w-[1068px] flex-1 items-center px-6 py-12">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_480px]">
            {/* ================= Kiri: penjelasan ================= */}
            <div>
              <span className="inline-block rounded-full bg-[#FDE8E8] px-3 py-2 font-heading text-[11px] font-bold leading-none text-[#E02424]">
                TRANSAKSI DITOLAK / GAGAL BAYAR
              </span>

              <h1
                className={`${FONT_MONTSERRAT} mt-6 text-[38px] font-bold leading-[48px] text-[#343133]`}
              >
                Pemesanan Gagal: Waktu Pembayaran Habis
              </h1>

              <p className="mt-6 font-heading text-[15px] leading-6 text-[#343133]">
                Batas waktu pembayaran 15 menit menggunakan sistem otomatis QRIS atau Transfer
                Bank Anda telah berakhir. Jangan khawatir, saldo Anda tidak terpotong. Silakan
                ajukan ulang pemesanan jadwal lapangan Anda.
              </p>

              <h2 className="mt-6 font-heading text-[13px] font-bold text-[#121212]">
                Langkah Penyelesaian Masalah:
              </h2>
              <ol className="mt-3 space-y-2.5 font-heading text-xs leading-[18px] text-[#343133]">
                {TROUBLESHOOT_STEPS.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="h-10 w-[306px] max-w-full cursor-pointer rounded-lg bg-[#CDF178] font-heading text-xs text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
                >
                  Coba Bayar Kembali
                </button>
                <a
                  href={ADMIN_WA_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-[46px] w-[194px] items-center justify-center rounded-lg border border-[#404F14] bg-white font-heading text-sm font-bold text-[#404F14] transition-colors hover:bg-[#F5FAF3]"
                >
                  Hubungi Admin OBC
                </a>
              </div>
            </div>

            {/* ================= Kanan: info pesanan gagal ================= */}
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <h2 className={`${FONT_MONTSERRAT} text-xl font-semibold leading-7 text-[#343133]`}>
                Informasi Pesanan Gagal
              </h2>

              <dl className="mt-3 space-y-2.5 font-heading text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Kode Booking</dt>
                  <dd className="font-bold text-[#E02424] line-through">{bookingCode}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Status Transaksi</dt>
                  <dd className="rounded bg-[#E53E3E] px-2 py-1 text-[9px] font-bold leading-none text-white">
                    EXPIRED
                  </dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />

              <dl className="space-y-2.5 font-heading text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Fasilitas / Lapangan</dt>
                  <dd className="font-bold text-[#121212]">{facility}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Jadwal Main</dt>
                  <dd className="font-bold text-[#121212]">{schedule}</dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-heading text-sm font-bold text-[#121212]">
                  Total Harus Dibayar
                </span>
                <span className={`${FONT_MONTSERRAT} text-[22px] font-bold text-[#343133]`}>
                  {formatRupiah(total)}
                </span>
              </div>
            </section>
          </div>
        </main>

        <DeferredFooter />
      </div>}
    </>
  )
}

export default FailedOrder