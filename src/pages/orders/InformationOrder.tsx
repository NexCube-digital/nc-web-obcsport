import { memo, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, Download } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import { useIsMobile } from '../../hooks/useIsMobile'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
// Data yang dikirim dari PaymentPage lewat navigate('/pembayaran/qris', { state })
interface InformationState {
  total?: number
  transactionId?: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

// Fallback bila halaman dibuka tanpa state (sesuai desain)
const DEFAULT_TOTAL = 227000
const DEFAULT_TRANSACTION_ID = 'OBC-20260112-985A'

// TODO: hitung sisa waktu dari waktu kedaluwarsa transaksi yang dikirim API
const DEFAULT_SECONDS = 14 * 60 + 45

// TODO: kode verifikasi unik (3 digit terakhir nominal) sementara hardcode, ambil dari API.
// Jika total dari API sudah termasuk kode unik, hapus penambahan UNIQUE_CODE di mobileTotal.
const UNIQUE_CODE = 124

const PAYMENT_STEPS: string[] = [
  'Buka M-Banking (BCA, Mandiri) atau E-Wallet (GoPay, OVO).',
  'Pilih Scan QR dan arahkan kamera ke kode QR.',
  'Pastikan merchant bernama OBC SPORT CENTER dan bayar.',
]

// Petunjuk scan versi mobile (sesuai desain)
const MOBILE_STEPS: string[] = [
  'Buka aplikasi e-wallet Anda (GoPay, OVO, Dana) atau M-Banking.',
  'Pilih menu "Scan" atau "Bayar" lalu arahkan kamera ke QRIS.',
  'Pastikan nominal pembayaran sama persis dengan angka di atas.',
]

/* -------------------------------------------------------------------------
   Fungsi bantu
   ------------------------------------------------------------------------- */
const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

/**
 * Placeholder kode QR (pola acak tetap + 3 penanda sudut).
 * TODO: ganti dengan gambar / string QRIS asli dari API pembayaran.
 */
interface QrPlaceholderProps {
  className?: string
  svgRef?: React.Ref<SVGSVGElement>
}

const QR_SIZE = 25
const QR_CELLS: { x: number; y: number }[] = []
let qrSeed = 7
const isQrFinder = (x: number, y: number) =>
  (x < 8 && y < 8) ||
  (x >= QR_SIZE - 8 && y < 8) ||
  (x < 8 && y >= QR_SIZE - 8)

for (let y = 0; y < QR_SIZE; y += 1) {
  for (let x = 0; x < QR_SIZE; x += 1) {
    qrSeed = (qrSeed * 9301 + 49297) % 233280
    if (!isQrFinder(x, y) && qrSeed / 233280 > 0.5) QR_CELLS.push({ x, y })
  }
}

const QR_FINDERS = [
  [0, 0],
  [QR_SIZE - 7, 0],
  [0, QR_SIZE - 7],
]

function QrPlaceholder({
  className = 'h-[62px] w-[62px]',
  svgRef,
}: QrPlaceholderProps) {
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kode QRIS"
    >
      <rect width={QR_SIZE} height={QR_SIZE} fill="#fff" />
      {QR_CELLS.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#121212" />
      ))}
      {QR_FINDERS.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect x={fx} y={fy} width="7" height="7" fill="#121212" />
          <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="#fff" />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" fill="#121212" />
        </g>
      ))}
    </svg>
  )
}

const MemoQrPlaceholder = memo(QrPlaceholder)

function PaymentCountdown() {
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/failed-order', { replace: true })
      return
    }

    const timer = window.setTimeout(() => setSecondsLeft((previous) => previous - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft, navigate])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <>
      <span className="md:hidden">
        Selesaikan pembayaran dalam:{' '}
        <span className="font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} mins
        </span>
      </span>
      <span className="hidden md:inline">
        Batas Waktu: {minutes} Menit {String(seconds).padStart(2, '0')} Detik
      </span>
    </>
  )
}

function InformationOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const state = (location.state as InformationState | null) ?? {}

  const total = state.total ?? DEFAULT_TOTAL
  const transactionId = state.transactionId ?? DEFAULT_TRANSACTION_ID

  const [copied, setCopied] = useState(false)
  const mobileQrRef = useRef<SVGSVGElement>(null)

  // Total versi mobile: nominal + kode verifikasi unik (3 digit terakhir)
  const mobileTotal = total + UNIQUE_CODE

  /* ---------- Handler ---------- */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transactionId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard tidak tersedia, abaikan
    }
  }

  const handleRefresh = () => {
    // TODO: cek status pembayaran ke API. Sementara langsung ke halaman menunggu konfirmasi.
    navigate('/pembayaran/menunggu', { state: { transactionId } })
  }

  const handleDownloadQr = () => {
    // Unduh QR placeholder sebagai file SVG.
    // TODO: jika QRIS asli berupa URL gambar dari API, ganti dengan unduh dari URL tersebut
    const svg = mobileQrRef.current
    if (!svg) return
    const source = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `QRIS-${transactionId}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* ===================================================================
          TAMPILAN MOBILE (< md): tanpa navbar & footer, sesuai desain
          =================================================================== */}
      {isMobile && (
        <MobileHeader
          variant="title"
          title="Pembayaran QRIS"
          centerTitle
          showBottomNav={false}
        />
      )}
      {isMobile && <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white font-body text-[#343133] pb-24 overscroll-none">
        {/* Banner batas waktu */}
        <div
          role="timer"
          className="flex items-center justify-center gap-2 bg-[#FDF2F2] px-3 py-2 font-heading text-xs text-[#E02424]"
        >
          <Clock size={16} aria-hidden="true" />
          <PaymentCountdown />
        </div>

        <div className="min-h-0 px-3 pt-3">
          {/* Kartu QR */}
          <section className="flex flex-col items-center rounded-2xl border border-[#D4D4D4] bg-white px-3 pb-3 pt-4">
            <MemoQrPlaceholder className="h-[140px] w-[140px]" svgRef={mobileQrRef} />
            <button
              type="button"
              onClick={handleDownloadQr}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#404F14] bg-white px-3 py-1.5 font-heading text-[11px] font-bold text-[#404F14] cursor-pointer active:bg-[#F5FAF3]"
            >
              <Download size={14} aria-hidden="true" />
              Unduh Kode QR
            </button>
          </section>

          {/* Total nominal transfer */}
          <section className="mt-3 rounded-xl border border-[#D4D4D4] bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-heading text-xs text-[#6F6B6E]">Total Nominal Transfer</span>
              <span className={`${FONT_MONTSERRAT} text-lg font-bold text-[#121212]`}>
                {formatRupiah(mobileTotal)}
              </span>
            </div>
            <p className="mt-1 text-right font-heading text-[9px] leading-3 text-[#6F6B6E]">
              *Tiga digit terakhir{' '}
              <span className="font-bold">{String(UNIQUE_CODE).padStart(3, '0')}</span> adalah
              kode verifikasi unik order Anda.
            </p>
          </section>

          {/* Petunjuk scan */}
          <h2 className="mt-3 font-heading text-xs font-bold text-[#121212]">Petunjuk Scan QRIS:</h2>
          <ol className="mt-1 space-y-1 font-heading text-[11px] leading-4 text-[#6F6B6E]">
            {MOBILE_STEPS.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Tombol cek status (fixed di bawah) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D4D4D4] bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleRefresh}
            className="h-10 w-full rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] cursor-pointer"
          >
            Cek Status Pembayaran
          </button>
        </div>
      </div>}

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      {!isMobile && <div className="min-h-screen flex flex-col bg-white font-body text-[#343133]">
        <NavbarDashboard userName={USER_NAME} showDesktopNavigation={false} showMobileHeader={false} />

        <main className="mx-auto w-full max-w-[1248px] flex-1 px-6 pb-16 pt-6">
          <div className="text-center">
            <h1 className={`${FONT_MONTSERRAT} text-[26px] font-bold leading-9 text-[#343133]`}>
              Selesaikan Pembayaran QRIS
            </h1>
            <span
              className="mt-0.5 inline-block rounded-full border border-[#E02424] bg-[#FDF2F2] px-3 py-0.5 font-heading text-xs font-bold text-[#E02424]"
              role="timer"
            >
              <PaymentCountdown />
            </span>
          </div>

          {/* Kartu pembayaran: lebar 800px sesuai desain */}
          <section className="mx-auto mt-6 flex w-full max-w-[800px] flex-col gap-6 rounded-2xl border border-[#D4D4D4] bg-white p-8 sm:flex-row sm:items-start">
            {/* Kiri: QR */}
            <div className="flex shrink-0 flex-col items-center sm:w-[180px]">
              <div className="flex h-[180px] w-[180px] flex-col items-center justify-center rounded-2xl border border-[#D4D4D4] bg-white">
                <p className="font-heading text-[11px] font-bold text-[#265021]">[Scan QRIS]</p>
                <div className="mt-1 flex h-[100px] w-[100px] items-center justify-center bg-[#EEF0F3]">
                  <div className="bg-white p-1 shadow-sm">
                    <MemoQrPlaceholder />
                  </div>
                </div>
                <p className="mt-2 font-heading text-[8px] text-[#343133]">GPN - QRIS STANDAR</p>
              </div>
              <p className="mt-4 whitespace-nowrap font-heading text-xs text-[#343133]">
                Scan dengan M-Banking / E-Wallet
              </p>
            </div>

            {/* Kanan: detail */}
            <div className="min-w-0 flex-1">
              <p className="font-heading text-xs text-[#343133]">Total Pembayaran</p>
              <p className={`${FONT_MONTSERRAT} text-[28px] font-bold leading-9 text-[#404F14]`}>
                {formatRupiah(total)}
              </p>

              <p className="mt-4 font-heading text-xs text-[#343133]">ID Transaksi</p>
              <div className="mt-1 flex h-[38px] items-center justify-between rounded-md border border-[#D4D4D4] bg-[#FDFCF7] px-2.5">
                <span className="font-heading text-[13px] font-bold text-[#121212]">
                  {transactionId}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="cursor-pointer font-heading text-xs font-bold text-[#265021] hover:text-[#404F14]"
                >
                  {copied ? 'Tersalin' : 'Copy'}
                </button>
              </div>

              <h2 className="mt-4 font-heading text-xs font-bold text-[#121212]">Cara Bayar:</h2>
              <ol className="mt-1.5 space-y-1.5 font-heading text-[11px] leading-[14px] text-[#343133]">
                {PAYMENT_STEPS.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <button
            type="button"
            onClick={handleRefresh}
            className="mx-auto mt-6 block h-10 w-full max-w-[320px] cursor-pointer rounded-lg bg-[#CDF178] font-heading text-xs text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
          >
            Cek Status Pembayaran
          </button>
        </main>

        <DeferredFooter />
      </div>}
    </>
  )
}

export default InformationOrder