import { useEffect } from 'react'

interface PendingOrderModalProps {
  isOpen: boolean
  date: string
  time: string
  paymentMethod: string
  amount: number
  onClose: () => void
  onReturnHome: () => void
  onOpenOrderStatus: (path: '/information-order' | '/failed-order' | '/success-order') => void
}

const ADMIN_WA_URL = 'https://wa.me/6281234567890'
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"
const DEFAULT_TRANSACTION_ID = 'OBC-20260112-985A'
const NEXT_STEPS: string[] = [
  'E-tiket resmi akan dikirim via Email & WhatsApp begitu sukses.',
  'Halaman ini akan otomatis di-refresh real-time jika pembayaran terdeteksi.',
]

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function PendingOrderModal({
  isOpen,
  date,
  time,
  paymentMethod,
  amount,
  onClose,
  onReturnHome,
  onOpenOrderStatus,
}: PendingOrderModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const currentPaddingRight = Number.parseFloat(
      window.getComputedStyle(document.body).paddingRight,
    ) || 0

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#343133]/50 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-order-title"
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-[600px] rounded-2xl border border-[#D4D4D4] bg-white p-5 sm:p-8"
      >
        <div className="flex justify-center pt-2">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            className="motion-safe:animate-[spin_2s_linear_infinite]"
            role="img"
            aria-label="Memproses pembayaran"
          >
            <path
              d="M48.8 16 A24 24 0 1 1 36.2 5.4"
              stroke="#404F14"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="46" cy="9" r="3.5" fill="#265021" />
          </svg>
        </div>

        <h2
          id="pending-order-title"
          className={`${FONT_MONTSERRAT} mt-5 text-center text-xl font-bold leading-7 text-[#343133]`}
        >
          Menunggu Konfirmasi Pembayaran
        </h2>
        <p className="mx-auto mt-1 max-w-[340px] text-center font-heading text-xs leading-[18px] text-[#343133]">
          Kami sedang memverifikasi transaksi {paymentMethod} Anda. Mohon tunggu beberapa saat.
        </p>

        <hr className="mt-5 border-[#D4D4D4]" />

        <dl className="mt-5 space-y-2 rounded-lg bg-[#FDFCF7] px-3 py-3 font-heading text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#343133]">Status Transaksi</dt>
            <dd className="rounded bg-[#FDEBC8] px-2 py-1 text-[9px] font-bold leading-none text-[#D97706]">
              PENDING / VERIFIKASI
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#343133]">Tanggal</dt>
            <dd className="text-right font-bold text-[#121212]">{date}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#343133]">Waktu</dt>
            <dd className="font-bold text-[#121212]">{time}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#343133]">Metode Pembayaran</dt>
            <dd className="text-right font-bold text-[#121212]">{paymentMethod}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#343133]">Total Pembayaran</dt>
            <dd className="font-bold text-[#404F14]">{formatRupiah(amount)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#343133]">ID Transaksi</dt>
            <dd className="font-bold text-[#404F14]">{DEFAULT_TRANSACTION_ID}</dd>
          </div>
        </dl>

        <h3 className="mt-5 font-heading text-xs font-bold text-[#121212]">Langkah Selanjutnya:</h3>
        <ul className="mt-2 space-y-2 font-heading text-[11px] leading-4 text-[#343133]">
          {NEXT_STEPS.map((step) => (
            <li key={step}>
              <span aria-hidden="true">✓</span> {step}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onReturnHome}
            className="min-h-11 flex-1 cursor-pointer rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-3 font-heading text-[13px] font-bold text-[#404F14] transition-colors hover:bg-[#F5F4EA]"
          >
            Kembali ke Beranda
          </button>
          <a
            href={ADMIN_WA_URL}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#CDF178] px-3 text-center font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
          >
            Hubungi Bantuan WA
          </a>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-2 border-t border-[#E5E5E5] pt-3">
          <button
            type="button"
            onClick={() => onOpenOrderStatus('/information-order')}
            className="min-h-8 rounded-md border border-[#D4D4D4] px-2.5 font-heading text-[10px] font-semibold text-[#6F6B6E] transition-colors hover:bg-[#F5F4EA]"
          >
            Info Order
          </button>
          <button
            type="button"
            onClick={() => onOpenOrderStatus('/failed-order')}
            className="min-h-8 rounded-md border border-[#D4D4D4] px-2.5 font-heading text-[10px] font-semibold text-[#6F6B6E] transition-colors hover:bg-[#F5F4EA]"
          >
            Failed
          </button>
          <button
            type="button"
            onClick={() => onOpenOrderStatus('/success-order')}
            className="min-h-8 rounded-md border border-[#D4D4D4] px-2.5 font-heading text-[10px] font-semibold text-[#6F6B6E] transition-colors hover:bg-[#F5F4EA]"
          >
            Success
          </button>
        </div>
      </section>
    </div>
  )
}

export default PendingOrderModal