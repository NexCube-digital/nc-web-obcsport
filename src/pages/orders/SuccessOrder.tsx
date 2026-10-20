import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, CircleCheck } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import ScrollReveal from '../../components/animation/ScrollReveal'
import lapangF1 from '../../assets/layanan/Lapang F1.png'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getBookingDetails, type BookingDetails } from '../../services/bookingService'

const TestimonialModal = lazy(() => import('../../components/ui/TestimonialModal'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface SuccessState {
  bookingId?: string
  transactionNumber?: string
  paidAt?: string
  method?: string
  facility?: string
  schedule?: string
  duration?: string
  subtotal?: number
  serviceFee?: number
  promoLabel?: string
  promo?: number
  bookingCode?: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

// Fallback bila halaman dibuka tanpa state (sesuai desain)
const DEFAULTS = {
  transactionNumber: 'TX-88201992',
  paidAt: '12 Mar 2026, 08:32 WIB',
  method: 'QRIS Dinamis Otomatis',
  facility: 'Futsal Premium Hall A',
  schedule: 'Sabtu, 14 Mar (16:00 - 18:00)',
  duration: '2 Jam',
  subtotal: 250000,
  serviceFee: 2500,
  promoLabel: 'Promo Diskon Akhir Pekan',
  promo: 25000,
  bookingCode: 'OBC-FUT-9021',
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function SuccesOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const state = (location.state as SuccessState | null) ?? {}
  const bookingId = state.bookingId ?? new URLSearchParams(location.search).get('bookingId') ?? ''
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const reviewStorageKey = `obc:review:${bookingId}`
  const [reviewStatus, setReviewStatus] = useState(
    () => localStorage.getItem(reviewStorageKey) ?? 'unreviewed',
  )
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(
    () => localStorage.getItem(reviewStorageKey) !== 'reviewed',
  )
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      navigate('/home', { replace: true })
      return
    }
    let active = true
    getBookingDetails(bookingId)
      .then((details) => {
        if (!active) return
        if (details.status !== 'fully_paid' && details.status !== 'completed') {
          navigate('/information-order', { replace: true, state: { bookingId } })
          return
        }
        setBooking(details)
      })
      .catch(() => {
        if (active) navigate('/information-order', { replace: true, state: { bookingId } })
      })
    return () => { active = false }
  }, [bookingId, navigate])

  const latestPayment = booking?.payments[0]
  const method = latestPayment?.method === 'qris'
    ? 'QRIS'
    : latestPayment?.method === 'ewallet'
      ? 'E-Wallet'
      : latestPayment?.method === 'credit_card'
        ? 'Kartu kredit / debit'
        : latestPayment?.method === 'convenience_store'
          ? 'Gerai retail'
      : latestPayment?.method === 'bank_transfer'
        ? 'Virtual Account'
        : DEFAULTS.method
  const data = {
    ...DEFAULTS,
    ...state,
    ...(booking ? {
      transactionNumber: latestPayment?.midtransOrderId ?? booking.id,
      paidAt: booking.paidAt ? new Date(booking.paidAt).toLocaleString('id-ID') : DEFAULTS.paidAt,
      method,
      facility: booking.resource.name,
      schedule: `${booking.bookingDate} (${booking.startTime} - ${booking.endTime})`,
      duration: `${booking.durationMinutes / 60} Jam`,
      subtotal: booking.pricing.basePrice,
      serviceFee: booking.pricing.adminFee,
      promo: booking.pricing.discountAmount,
      bookingCode: booking.id.slice(-8).toUpperCase(),
    } : {}),
    bookingCode: booking?.id.slice(-8).toUpperCase() ?? state.bookingCode ?? DEFAULTS.bookingCode,
  }

  const total = booking?.pricing.totalPrice ?? data.subtotal + data.serviceFee - data.promo

  const handleDeferReview = () => {
    localStorage.setItem(reviewStorageKey, 'pending')
    setReviewStatus('pending')
    setIsTestimonialOpen(false)
  }

  const handleReviewSubmitted = () => {
    localStorage.setItem(reviewStorageKey, 'reviewed')
    setReviewStatus('reviewed')
  }

  const handleDownloadTicket = () => {
    // TODO: unduh e-ticket PDF dari API (services/ticketService.js)
  }

  if (!booking) return <div role="status" className="px-4 py-8 text-center text-sm text-[#6B6B6B]">Memuat status pembayaran...</div>

  return (
    <>
      {/* ===================================================================
          TAMPILAN MOBILE (< md): layout mengikuti desain mobile,
          isi & teks mengikuti versi PC.
          =================================================================== */}
      {isMobile && <MobileHeader variant="title" title="Pesanan Berhasil" showBottomNav={false} />}
      {isMobile && (
        <div
          className={`flex h-[calc(100dvh-4rem)] flex-col bg-white px-4 pb-5 pt-3 font-body text-[#343133] overscroll-contain ${
          isPaymentDetailsOpen ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
        >
        <ScrollReveal className="flex min-h-0 flex-1 flex-col">
        <div
          role="img"
          aria-label="Pembayaran berhasil"
          className="grid h-20 w-full place-items-center text-[#265021]"
        >
          <CircleCheck
            size={58}
            strokeWidth={1.8}
            aria-hidden="true"
            className="success-icon-pop"
          />
        </div>

        {/* Judul & deskripsi, rata tengah */}
        <div className="mt-3 text-center">
          <span className="inline-block rounded-full bg-[#E6F0E0] px-3 py-1.5 font-heading text-[10px] font-bold leading-none text-[#265021]">
            PEMBAYARAN DISETUJUI &amp; BERHASIL
          </span>
          <h1 className={`${FONT_MONTSERRAT} mt-2 text-lg font-bold leading-6 text-[#343133]`}>
            Selamat! Lapangan Anda Berhasil Dipesan
          </h1>
          <p className="mt-1.5 font-heading text-[11px] leading-4 text-[#343133]">
            E-ticket Anda telah aktif secara otomatis. Kode booking telah dikirimkan ke
            WhatsApp Anda. Silakan tunjukkan QR Code atau Kode Booking di bawah ini kepada
            petugas lapangan saat kedatangan.
          </p>
        </div>

        {/* Kode booking */}
        <div className="mt-3 rounded-xl border border-[#E5E5E5] bg-white p-2.5 text-center">
          <p className="font-heading text-[11px] uppercase leading-4 text-[#343133]">
            Kode Booking Utama
          </p>
          <p className={`${FONT_MONTSERRAT} text-[22px] font-bold leading-8 text-[#404F14]`}>
            {data.bookingCode}
          </p>
          <p className="font-heading text-[11px] leading-4 text-[#265021]">
            Tunjukkan QR Code ini di Kasir
          </p>
        </div>

        {reviewStatus === 'pending' && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#D4D4D4] bg-[#FDFCF7] p-4">
            <p className="text-sm font-heading font-semibold text-[#343133]">Ulasan Anda masih tertunda</p>
            <button
              type="button"
              onClick={() => setIsTestimonialOpen(true)}
              className="shrink-0 font-heading text-sm font-bold text-[#404F14] underline underline-offset-2"
            >
              Tulis ulasan
            </button>
          </div>
        )}

        {/* Rincian pembayaran */}
        <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className={`${FONT_MONTSERRAT} text-sm font-semibold leading-5 text-[#343133]`}>
              Rincian Pembayaran
            </h2>
            <button
              type="button"
              onClick={() => setIsPaymentDetailsOpen((open) => !open)}
              aria-expanded={isPaymentDetailsOpen}
              className="flex shrink-0 cursor-pointer items-center gap-1 font-heading text-[11px] font-bold text-[#404F14]"
            >
              {isPaymentDetailsOpen ? 'Ringkas' : 'Lihat selengkapnya'}
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`transition-transform ${isPaymentDetailsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {isPaymentDetailsOpen && <>
          <dl className="mt-3 space-y-2 font-heading text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Nomor Transaksi</dt>
              <dd className="text-right font-bold text-[#121212]">{data.transactionNumber}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Waktu Pembayaran</dt>
              <dd className="text-right font-bold text-[#121212]">{data.paidAt}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Metode Pembayaran</dt>
              <dd className="text-right font-bold text-[#404F14]">{data.method}</dd>
            </div>
          </dl>

          <hr className="my-2 border-[#D4D4D4]" />

          <dl className="space-y-2 font-heading text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#343133]">Fasilitas / Lapangan</dt>
              <dd className="text-right font-bold text-[#121212]">{data.facility}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#343133]">Jadwal Main</dt>
              <dd className="text-right font-bold text-[#121212]">{data.schedule}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Durasi Sewa</dt>
              <dd className="text-right font-bold text-[#121212]">{data.duration}</dd>
            </div>
          </dl>

          <hr className="my-2.5 border-[#D4D4D4]" />

          <dl className="space-y-2 font-heading text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Subtotal Sewa</dt>
              <dd className="text-[#343133]">{formatRupiah(data.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">Biaya Layanan &amp; Pajak</dt>
              <dd className="text-[#343133]">{formatRupiah(data.serviceFee)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="font-bold text-[#265021]">{data.promoLabel}</dt>
              <dd className="shrink-0 font-bold text-[#265021]">- {formatRupiah(data.promo)}</dd>
            </div>
          </dl>
          </>}

          <hr className="my-2.5 border-[#D4D4D4]" />

          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-bold text-[#121212]">Total Terbayar</span>
            <span className={`${FONT_MONTSERRAT} text-xl font-bold text-[#404F14]`}>
              {formatRupiah(total)}
            </span>
          </div>
        </section>

        {/* Tombol, menempel di bawah layar */}
        <div className="mt-auto space-y-2 pt-4">
          <button
            type="button"
            onClick={handleDownloadTicket}
            className="h-10 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E]"
          >
            Unduh E-Ticket (PDF)
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="h-10 w-full cursor-pointer rounded-xl border border-[#404F14] bg-white font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#F5FAF3]"
          >
            Kembali ke Beranda
          </button>
        </div>
        </ScrollReveal>
        </div>
      )}

        {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}

      {!isMobile && (
        <div className="min-h-screen flex flex-col bg-white font-body text-[#343133]">
        <NavbarDashboard showDesktopNavigation={false} showMobileHeader={false} />

        <main className="mx-auto flex w-full max-w-[1068px] flex-1 items-center px-6 py-12">
          <ScrollReveal className="w-full">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_480px]">
            {/* ================= Kiri: konfirmasi ================= */}
            <div>
              <span className="inline-block rounded-full bg-[#E6F0E0] px-3 py-2 font-heading text-[11px] font-bold leading-none text-[#265021]">
                PEMBAYARAN DISETUJUI &amp; BERHASIL
              </span>

              <h1
                className={`${FONT_MONTSERRAT} mt-5 text-[38px] font-bold leading-[48px] text-[#343133]`}
              >
                Selamat! Lapangan Anda Berhasil Dipesan
              </h1>

              <p className="mt-5 font-heading text-[15px] leading-6 text-[#343133]">
                E-ticket Anda telah aktif secara otomatis. Kode booking telah dikirimkan ke
                WhatsApp Anda. Silakan tunjukkan QR Code atau Kode Booking di bawah ini kepada
                petugas lapangan saat kedatangan.
              </p>

              {/* Kode booking */}
              <div className="mt-5 flex items-center gap-5 rounded-xl border border-[#E5E5E5] bg-white p-4">
                <img
                  src={lapangF1}
                  alt={data.facility}
                  className="h-[78px] w-[172px] shrink-0 rounded-lg object-cover"
                />
                <div>
                  <p className="font-heading text-[11px] uppercase leading-4 text-[#343133]">
                    Kode Booking Utama
                  </p>
                  <p className={`${FONT_MONTSERRAT} text-[22px] font-bold leading-8 text-[#404F14]`}>
                    {data.bookingCode}
                  </p>
                  <p className="font-heading text-[11px] leading-4 text-[#265021]">
                    Tunjukkan QR Code ini di Kasir
                  </p>
                </div>
              </div>

              {reviewStatus === 'pending' && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#D4D4D4] bg-[#FDFCF7] p-4">
                  <p className="text-sm font-heading font-semibold text-[#343133]">Ulasan Anda masih tertunda</p>
                  <button
                    type="button"
                    onClick={() => setIsTestimonialOpen(true)}
                    className="shrink-0 font-heading text-sm font-bold text-[#404F14] underline underline-offset-2"
                  >
                    Tulis ulasan
                  </button>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleDownloadTicket}
                  className="h-9 w-[249px] max-w-full cursor-pointer rounded-lg bg-[#CDF178] font-heading text-xs text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
                >
                  Unduh E-Ticket (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="h-[45px] w-[192px] cursor-pointer rounded-lg border border-[#404F14] bg-white font-heading text-sm font-bold text-[#404F14] transition-colors hover:bg-[#F5FAF3]"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>

            {/* ================= Kanan: rincian pembayaran ================= */}
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <h2 className={`${FONT_MONTSERRAT} text-xl font-semibold leading-7 text-[#343133]`}>
                Rincian Pembayaran
              </h2>

              <dl className="mt-3 space-y-2.5 font-heading text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Nomor Transaksi</dt>
                  <dd className="font-bold text-[#121212]">{data.transactionNumber}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Waktu Pembayaran</dt>
                  <dd className="font-bold text-[#121212]">{data.paidAt}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Metode Pembayaran</dt>
                  <dd className="font-bold text-[#404F14]">{data.method}</dd>
                </div>
              </dl>

              <hr className="my-2.5 border-[#D4D4D4]" />

              <dl className="space-y-2.5 font-heading text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Fasilitas / Lapangan</dt>
                  <dd className="font-bold text-[#121212]">{data.facility}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Jadwal Main</dt>
                  <dd className="font-bold text-[#121212]">{data.schedule}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Durasi Sewa</dt>
                  <dd className="font-bold text-[#121212]">{data.duration}</dd>
                </div>
              </dl>

              <hr className="my-2.5 border-[#D4D4D4]" />

              <dl className="space-y-2.5 font-heading text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Subtotal Sewa</dt>
                  <dd className="text-[#343133]">{formatRupiah(data.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">Biaya Layanan &amp; Pajak</dt>
                  <dd className="text-[#343133]">{formatRupiah(data.serviceFee)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-bold text-[#265021]">{data.promoLabel}</dt>
                  <dd className="font-bold text-[#265021]">- {formatRupiah(data.promo)}</dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />

              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold text-[#121212]">Total Terbayar</span>
                <span className={`${FONT_MONTSERRAT} text-[22px] font-bold text-[#404F14]`}>
                  {formatRupiah(total)}
                </span>
              </div>
            </section>
          </div>
          </ScrollReveal>
        </main>

        <DeferredFooter />
        </div>
      )}

      {isTestimonialOpen && (
        <Suspense fallback={null}>
          <TestimonialModal
            isOpen
            onClose={() => setIsTestimonialOpen(false)}
            onDefer={handleDeferReview}
            facilityName={data.facility}
            dateLabel={data.schedule}
            onSubmit={handleReviewSubmitted}
          />
        </Suspense>
      )}
    </>
  )
}

export default SuccesOrder