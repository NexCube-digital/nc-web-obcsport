import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import ScrollReveal from '../../components/animation/ScrollReveal'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getBookingDetails, type BookingDetails } from '../../services/bookingService'
import { getApiErrorMessage } from '../../services/apiService'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
// Data yang dikirim dari PaymentPage lewat navigate('/pembayaran/qris', { state })
interface InformationState {
  bookingId?: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function PaymentCountdown({ expiresAt }: { expiresAt?: string }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 0,
  )

  useEffect(() => {
    if (!expiresAt) return
    const timer = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [expiresAt])

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
  const bookingId = state.bookingId ?? new URLSearchParams(location.search).get('bookingId') ?? ''
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [copied, setCopied] = useState(false)
  const payment = booking?.payments[0]
  const total = payment?.amount ?? booking?.pricing.totalPrice ?? 0
  const transactionId = payment?.midtransOrderId ?? booking?.id ?? bookingId
  const expiresAt = payment?.expiredAt ?? booking?.lockedUntil ?? undefined
  const redirectUrl = payment?.redirectUrl

  useEffect(() => {
    if (!bookingId) {
      navigate('/home', { replace: true })
      return
    }

    let active = true
    let timeout: number | undefined
    const refresh = async () => {
      try {
        const latest = await getBookingDetails(bookingId)
        if (!active) return
        setBooking(latest)
        setErrorMessage('')

        if (latest.status === 'fully_paid' || latest.status === 'completed') {
          navigate('/success-order', { replace: true, state: { bookingId } })
          return
        }
        if (['cancelled', 'expired', 'refunded'].includes(latest.status)) {
          navigate('/failed-order', { replace: true, state: { bookingId } })
          return
        }
      } catch (error) {
        if (active) setErrorMessage(getApiErrorMessage(error, 'Status pembayaran tidak dapat dimuat.'))
      }

      if (active) timeout = window.setTimeout(() => void refresh(), 4000)
    }

    void refresh()
    return () => {
      active = false
      if (timeout) window.clearTimeout(timeout)
    }
  }, [bookingId, navigate])

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

  const handleRefresh = async () => {
    if (!bookingId) return
    setIsChecking(true)
    try {
      const latest = await getBookingDetails(bookingId)
      setBooking(latest)
      setErrorMessage('')
      if (latest.status === 'fully_paid' || latest.status === 'completed') {
        navigate('/success-order', { replace: true, state: { bookingId } })
      } else if (['cancelled', 'expired', 'refunded'].includes(latest.status)) {
        navigate('/failed-order', { replace: true, state: { bookingId } })
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Status pembayaran tidak dapat dimuat.'))
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <>
      {/* ===================================================================
          TAMPILAN MOBILE (< md): tanpa navbar & footer, sesuai desain
          =================================================================== */}
      {isMobile && (
        <MobileHeader
          variant="title"
          title="Status Pembayaran"
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
            <PaymentCountdown expiresAt={expiresAt} />
        </div>

        <ScrollReveal className="min-h-0 flex-1 overflow-y-auto">
        <div className="min-h-0 px-3 pt-3">
          {/* Kartu QR */}
          <section className="flex flex-col items-center rounded-2xl border border-[#D4D4D4] bg-white px-3 pb-3 pt-4">
            <div className="flex h-[140px] w-[140px] flex-col items-center justify-center rounded-xl bg-[#F1F4EA] text-center">
              <Clock size={28} className="text-[#404F14]" aria-hidden="true" />
              <span className="mt-2 font-heading text-xs font-bold text-[#404F14]">
                {booking?.status ?? 'Memuat status'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => redirectUrl && window.location.assign(redirectUrl)}
              disabled={!redirectUrl}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#404F14] bg-white px-3 py-1.5 font-heading text-[11px] font-bold text-[#404F14] cursor-pointer active:bg-[#F5FAF3]"
            >
              Buka Pembayaran Midtrans
            </button>
          </section>

          {/* Total nominal transfer */}
          <section className="mt-3 rounded-xl border border-[#D4D4D4] bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
                            <span className="font-heading text-xs text-[#6F6B6E]">Total Pembayaran</span>
              <span className={`${FONT_MONTSERRAT} text-lg font-bold text-[#121212]`}>
                {formatRupiah(mobileTotal)}
              </span>
            </div>
            <p className="mt-1 text-right font-heading text-[9px] leading-3 text-[#6F6B6E]">
              Status diperbarui otomatis dari notifikasi pembayaran Midtrans.
            </p>
          </section>

          {/* Petunjuk scan */}
          <h2 className="mt-3 font-heading text-xs font-bold text-[#121212]">Status Pembayaran</h2>
          {errorMessage && <p role="alert" className="mt-1 text-xs text-red-700">{errorMessage}</p>}
          <p className="mt-1 font-heading text-[11px] leading-4 text-[#6F6B6E]">
            {isChecking ? 'Memeriksa status...' : 'Halaman ini akan berpindah otomatis setelah Midtrans mengonfirmasi pembayaran.'}
          </p>
        </div>
          </ScrollReveal>

        {/* Tombol cek status (fixed di bawah) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D4D4D4] bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking}
            className="h-10 w-full rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] cursor-pointer"
          >
            {isChecking ? 'Memeriksa...' : 'Cek Status Pembayaran'}
          </button>
        </div>
      </div>}

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      {!isMobile && <div className="min-h-screen flex flex-col bg-white font-body text-[#343133]">
        <NavbarDashboard userName={USER_NAME} showDesktopNavigation={false} showMobileHeader={false} />

        <main className="mx-auto w-full max-w-[1248px] flex-1 px-6 pb-16 pt-6">
          <ScrollReveal className="w-full">
          <div className="text-center">
            <h1 className={`${FONT_MONTSERRAT} text-[26px] font-bold leading-9 text-[#343133]`}>
              Status Pembayaran
            </h1>
            <span
              className="mt-0.5 inline-block rounded-full border border-[#E02424] bg-[#FDF2F2] px-3 py-0.5 font-heading text-xs font-bold text-[#E02424]"
              role="timer"
            >
              <PaymentCountdown expiresAt={expiresAt} />
            </span>
          </div>

          {/* Kartu pembayaran: lebar 800px sesuai desain */}
          <section className="mx-auto mt-6 flex w-full max-w-[800px] flex-col gap-6 rounded-2xl border border-[#D4D4D4] bg-white p-8 sm:flex-row sm:items-start">
            {/* Kiri: status Midtrans */}
            <div className="flex shrink-0 flex-col items-center sm:w-[180px]">
              <div className="flex h-[180px] w-[180px] flex-col items-center justify-center rounded-2xl border border-[#D4D4D4] bg-white">
                <Clock size={38} className="text-[#404F14]" aria-hidden="true" />
                <p className="mt-3 max-w-[150px] text-center font-heading text-xs font-bold text-[#404F14]">
                  {booking?.status ?? 'Memuat status'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => redirectUrl && window.location.assign(redirectUrl)}
                disabled={!redirectUrl}
                className="mt-4 cursor-pointer font-heading text-xs font-bold text-[#265021] underline underline-offset-2 disabled:opacity-50"
              >
                Lanjutkan di Midtrans
              </button>
              <p className="mt-2 text-center font-heading text-[10px] text-[#6F6B6E]">
                Pembayaran diproses oleh Midtrans
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

              <h2 className="mt-4 font-heading text-xs font-bold text-[#121212]">Status Transaksi</h2>
              <p className="mt-1.5 font-heading text-[11px] leading-[14px] text-[#343133]">
                {errorMessage || (isChecking ? 'Memeriksa status pembayaran...' : 'Status diperbarui otomatis setelah notifikasi Midtrans diterima.')}
              </p>
            </div>
          </section>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking}
            className="mx-auto mt-6 block h-10 w-full max-w-[320px] cursor-pointer rounded-lg bg-[#CDF178] font-heading text-xs text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
          >
            {isChecking ? 'Memeriksa...' : 'Cek Status Pembayaran'}
          </button>
          </ScrollReveal>
        </main>

        <DeferredFooter />
      </div>}
    </>
  )
}

export default InformationOrder