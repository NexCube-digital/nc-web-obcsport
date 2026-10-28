import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { DirectPaymentInfo } from '../../services/paymentService'

export interface PendingBookingItem {
  id: string
  name: string
  date: string
  time: string
}

interface PendingOrderModalProps {
  date: string
  time: string
  paymentMethod: string
  amount: number
  transactionId: string
  paymentInfo?: DirectPaymentInfo | null
  paymentUrl?: string
  bookings?: PendingBookingItem[]
  onReturnHome: () => void
  onOpenOrderStatus: () => void
  onContinuePayment?: () => void
}

const ADMIN_WA_URL = 'https://wa.me/6281234567890'
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"
const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function PendingOrderModal({
  date,
  time,
  paymentMethod,
  amount,
  transactionId,
  paymentInfo,
  paymentUrl,
  bookings = [],
  onReturnHome,
  onOpenOrderStatus,
  onContinuePayment,
}: PendingOrderModalProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedValue(value)
      window.setTimeout(() => setCopiedValue(null), 1500)
    } catch {
      // Clipboard tidak tersedia, abaikan
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#343133]/55 p-0 sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-order-title"
        className="flex h-full w-full max-w-[620px] flex-col overflow-hidden bg-white px-4 py-3 sm:h-auto sm:max-h-[calc(100dvh-32px)] sm:rounded-2xl sm:border sm:border-[#D4D4D4] sm:px-7 sm:py-5"
      >
        <header className="shrink-0 text-center">
          <div className="flex justify-center">
            <svg width="42" height="42" viewBox="0 0 56 56" fill="none" role="img" aria-label="Memproses pembayaran" className="motion-safe:animate-[spin_2s_linear_infinite]">
              <path d="M48.8 16 A24 24 0 1 1 36.2 5.4" stroke="#404F14" strokeWidth="5" strokeLinecap="round" />
              <circle cx="46" cy="9" r="3.5" fill="#265021" />
            </svg>
          </div>
          <h2 id="pending-order-title" className={`${FONT_MONTSERRAT} mt-2 text-lg font-bold leading-6 text-[#343133] sm:text-xl`}>
            Menunggu Konfirmasi Pembayaran
          </h2>
          <p className="mx-auto mt-1 max-w-[340px] font-heading text-[11px] leading-4 text-[#343133] sm:text-xs">
            Kami sedang memverifikasi transaksi {paymentMethod} Anda.
          </p>
        </header>

        <hr className="my-3 shrink-0 border-[#D4D4D4]" />

        <main className="min-h-0 flex-1 overflow-hidden">
          <dl className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-x-3 gap-y-1.5 rounded-lg bg-[#FDFCF7] px-3 py-2.5 font-heading text-[11px] sm:gap-y-2 sm:px-4 sm:py-3 sm:text-xs">
            <dt className="text-[#343133]">Status Transaksi</dt>
            <dd className="justify-self-end rounded bg-[#FDEBC8] px-2 py-1 text-[9px] font-bold leading-none text-[#D97706]">PENDING / VERIFIKASI</dd>
            <dt className="text-[#343133]">Tanggal</dt>
            <dd className="text-right font-bold text-[#121212]">{date}</dd>
            <dt className="text-[#343133]">Waktu</dt>
            <dd className="text-right font-bold text-[#121212]">{time}</dd>
            <dt className="text-[#343133]">Metode Pembayaran</dt>
            <dd className="text-right font-bold text-[#121212]">{paymentMethod}</dd>
            <dt className="text-[#343133]">Total Pembayaran</dt>
            <dd className="text-right font-bold text-[#404F14]">{formatRupiah(paymentInfo?.grossAmount ?? amount)}</dd>
            <dt className="text-[#343133]">ID Transaksi</dt>
            <dd className="break-all text-right font-bold text-[#404F14]">{transactionId || paymentInfo?.orderId}</dd>
          </dl>

          {bookings.length > 0 && (
            <section className="mt-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 sm:mt-3 sm:px-4 sm:py-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-[11px] font-bold text-[#121212] sm:text-xs">Pesanan dalam transaksi</h3>
                <span className="rounded-full bg-[#E6F0E0] px-2 py-1 text-[10px] font-bold text-[#404F14]">{bookings.length} booking</span>
              </div>
              <div className="mt-2 max-h-[96px] space-y-1.5 overflow-y-auto">
                {bookings.map((booking, index) => (
                  <div key={booking.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md bg-[#FDFCF7] px-2.5 py-2">
                    <div className="min-w-0"><p className="truncate text-[11px] font-bold text-[#121212]">{index + 1}. {booking.name}</p><p className="mt-0.5 text-[10px] text-[#6F6B6E]">{booking.date}</p></div>
                    <p className="shrink-0 text-[10px] font-bold text-[#404F14]">{booking.time}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 sm:mt-3 sm:px-4 sm:py-3">
            <h3 className="font-heading text-[11px] font-bold text-[#121212] sm:text-xs">Instruksi Pembayaran</h3>
            <div className="mt-1.5 space-y-1.5">
              {paymentInfo?.vaNumber && (
                <PaymentCode label={`Nomor Virtual Account ${paymentInfo.bankName ?? ''}`.trim()} value={paymentInfo.vaNumber} onCopy={handleCopy} copied={copiedValue === paymentInfo.vaNumber} />
              )}
              {paymentInfo?.billerCode && (
                <PaymentCode label="Kode Perusahaan" value={paymentInfo.billerCode} onCopy={handleCopy} copied={copiedValue === paymentInfo.billerCode} />
              )}
              {paymentInfo?.billKey && (
                <PaymentCode label="Kode Pembayaran" value={paymentInfo.billKey} onCopy={handleCopy} copied={copiedValue === paymentInfo.billKey} />
              )}
              {paymentInfo?.paymentCode && (
                <PaymentCode label={`Kode Pembayaran ${paymentInfo.storeName ?? ''}`.trim()} value={paymentInfo.paymentCode} onCopy={handleCopy} copied={copiedValue === paymentInfo.paymentCode} />
              )}
              {paymentInfo?.qrUrl && (
                <img src={paymentInfo.qrUrl} alt="QR pembayaran" className="mx-auto max-h-[min(16dvh,120px)] max-w-full object-contain sm:max-h-[min(18dvh,150px)]" />
              )}
              {!paymentInfo && paymentUrl && (
                <p className="text-[10px] leading-4 text-[#6F6B6E]">Lanjutkan ke halaman penyedia pembayaran untuk menyelesaikan transaksi.</p>
              )}
              {!paymentInfo && !paymentUrl && (
                <p className="text-[10px] leading-4 text-[#6F6B6E]">Detail status dan instruksi tersedia di informasi pembayaran.</p>
              )}
            </div>
          </section>
        </main>

        <footer className="mt-2 grid shrink-0 grid-cols-2 gap-2 sm:mt-3 sm:flex sm:justify-center">
          {(paymentUrl || paymentInfo?.deeplinkUrl) && onContinuePayment && (
            <button type="button" onClick={onContinuePayment} className="min-h-9 rounded-lg bg-[#354B24] px-3 font-heading text-[11px] font-bold text-white sm:min-h-10 sm:min-w-40 sm:text-xs">
              Lanjutkan Pembayaran
            </button>
          )}
          <button type="button" onClick={onOpenOrderStatus} className="min-h-9 rounded-lg bg-[#354B24] px-3 font-heading text-[11px] font-bold text-white sm:min-h-10 sm:min-w-40 sm:text-xs">
            Informasi Pembayaran
          </button>
          <button type="button" onClick={onReturnHome} className="min-h-9 rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-3 font-heading text-[11px] font-bold text-[#404F14] sm:min-h-10 sm:min-w-40 sm:text-xs">
            Kembali ke Beranda
          </button>
          <a href={ADMIN_WA_URL} target="_blank" rel="noreferrer" className="flex min-h-9 items-center justify-center rounded-lg bg-[#CDF178] px-3 text-center font-heading text-[11px] font-bold text-[#404F14] sm:min-h-10 sm:min-w-40 sm:text-xs">
            Bantuan WhatsApp
          </a>
        </footer>
      </section>
    </div>
  )
}

function PaymentCode({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value: string
  onCopy: (value: string) => void
  copied: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[#FDFCF7] px-2.5 py-2">
      <div className="min-w-0">
        <p className="text-[10px] text-[#6F6B6E]">{label}</p>
        <p className="break-all font-bold text-[#121212]">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value)}
        aria-label={copied ? 'Tersalin' : `Salin ${label}`}
        className="flex h-8 shrink-0 items-center gap-1 rounded-md bg-[#E6F0E0] px-2 font-heading text-xs font-bold text-[#404F14]"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Tersalin' : 'Salin'}
      </button>
    </div>
  )
}

export default PendingOrderModal