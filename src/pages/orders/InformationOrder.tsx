import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavbarDashboard from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

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

const PAYMENT_STEPS: string[] = [
  'Buka M-Banking (BCA, Mandiri) atau E-Wallet (GoPay, OVO).',
  'Pilih Scan QR dan arahkan kamera ke kode QR.',
  'Pastikan merchant bernama OBC SPORT CENTER dan bayar.',
]

/* -------------------------------------------------------------------------
   Fungsi bantu
   ------------------------------------------------------------------------- */
const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

/**
 * Placeholder kode QR (pola acak tetap + 3 penanda sudut).
 * TODO: ganti dengan gambar / string QRIS asli dari API pembayaran.
 */
function QrPlaceholder() {
  const size = 25
  const cells: { x: number; y: number }[] = []
  let seed = 7
  const isFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (seed * 9301 + 49297) % 233280
      if (!isFinder(x, y) && seed / 233280 > 0.5) cells.push({ x, y })
    }
  }

  const finders = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-[62px] w-[62px]"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Kode QRIS"
    >
      <rect width={size} height={size} fill="#fff" />
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#121212" />
      ))}
      {finders.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect x={fx} y={fy} width="7" height="7" fill="#121212" />
          <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="#fff" />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" fill="#121212" />
        </g>
      ))}
    </svg>
  )
}

function InformationOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as InformationState | null) ?? {}

  const total = state.total ?? DEFAULT_TOTAL
  const transactionId = state.transactionId ?? DEFAULT_TRANSACTION_ID

  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS)
  const [copied, setCopied] = useState(false)

  // Hitung mundur; saat habis, arahkan ke halaman gagal
  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/pembayaran/gagal', { replace: true })
      return
    }
    const timer = window.setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft, navigate])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

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

  return (
    <div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      <main className="mx-auto w-full max-w-[1248px] flex-1 px-6 pb-16 pt-6">
        <div className="text-center">
          <h1 className={`${FONT_MONTSERRAT} text-[26px] font-bold leading-9 text-[#343133]`}>
            Selesaikan Pembayaran QRIS
          </h1>
          <span
            className="mt-0.5 inline-block rounded-full border border-[#E02424] bg-[#FDF2F2] px-3 py-0.5 font-heading text-xs font-bold text-[#E02424]"
            role="timer"
          >
            Batas Waktu: {minutes} Menit {String(seconds).padStart(2, '0')} Detik
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
                  <QrPlaceholder />
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
          Refresh page
        </button>
      </main>

      <Footer />
    </div>
  )
}

export default InformationOrder