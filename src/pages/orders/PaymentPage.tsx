import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredSection from '../../components/layout/DeferredSection'
import DeferredFooter from '../../components/layout/DeferredFooter'
import ScrollReveal from '../../components/animation/ScrollReveal'
import { useIsMobile } from '../../hooks/useIsMobile'
import { createBooking, previewBookingPrice, type BookingPrice, type PaymentChannel } from '../../services/bookingService'
import { getApiErrorMessage } from '../../services/apiService'
import { isDirectChannel, openMidtransCheckout } from '../../services/paymentService'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type PaymentMethodId = PaymentChannel

// Metode pembayaran khusus tampilan mobile (lebih lengkap sesuai desain)
type MobileMethodId = PaymentChannel

interface PaymentMethod {
  id: PaymentMethodId
  badge: string
  name: string
  description: string
}

interface PaymentGroup {
  id: string
  label: string
  methods: PaymentMethod[]
}

interface MobileMethod {
  id: MobileMethodId
  badge: string
  name: string
  description: string
}

interface MobileMethodGroup {
  id: string
  label: string
  methods: MobileMethod[]
}

interface ExtraItem {
  id: string
  name: string
  price: number
}

// Data yang dikirim dari halaman DetailOrder lewat navigate('/checkout', { state })
interface CheckoutState {
  resourceId?: string
  sportType?: string
  bookingDate?: string
  facility?: { id: string; name: string; location?: { name: string; city: string; address: string } | null }
  date?: string
  time?: string
  endTime?: string
  total?: number
  durationMinutes?: number
  price?: { basePrice: number; discountAmount: number; adminFee: number; totalPrice: number }
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
const PROMO_CODE = 'Diskon'

// Fallback bila halaman dibuka tanpa state (sesuai desain)
const DEFAULT_DATE = 'Senin, 12 Januari 2026'
const DEFAULT_START = '08:00'
const DEFAULT_END = '10:00'
const DEFAULT_SUBTOTAL = 250000

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    id: 'instant',
    label: 'QRIS & E-WALLET',
    methods: [
      { id: 'qris', badge: 'QRIS', name: 'QRIS', description: 'Pembayaran dengan scan QR' },
      { id: 'gopay', badge: 'GOPAY', name: 'GoPay', description: 'Pembayaran instan' },
      { id: 'shopeepay', badge: 'SPAY', name: 'ShopeePay', description: 'Pembayaran instan' },
      // CATATAN: Core API Midtrans tidak mendukung OVO, jadi OVO tetap lewat Snap (modal)
      { id: 'ovo', badge: 'OVO', name: 'OVO', description: 'Pembayaran instan' },
      { id: 'dana', badge: 'DANA', name: 'DANA', description: 'Pembayaran instan' },
    ],
  },
  {
    id: 'card',
    label: 'KARTU',
    methods: [
      { id: 'credit_card', badge: 'CARD', name: 'Kartu kredit / debit', description: 'Pembayaran dengan kartu' },
    ],
  },
  {
    id: 'va',
    label: 'VIRTUAL ACCOUNT',
    methods: [
      {
        id: 'bca_va',
        badge: 'BCA VA',
        name: 'BCA Virtual Account',
        description: 'Verifikasi otomatis 24 Jam',
      },
      { id: 'bni_va', badge: 'BNI VA', name: 'BNI Virtual Account', description: 'Verifikasi otomatis' },
      { id: 'bri_va', badge: 'BRI VA', name: 'BRI Virtual Account', description: 'Verifikasi otomatis' },
      { id: 'mandiri_va', badge: 'MANDIRI', name: 'Mandiri Virtual Account', description: 'Verifikasi otomatis' },
      { id: 'permata_va', badge: 'PERMATA', name: 'Permata Virtual Account', description: 'Verifikasi otomatis' },
    ],
  },
  {
    id: 'retail',
    label: 'GERAI RETAIL',
    methods: [
      { id: 'alfamart', badge: 'ALFA', name: 'Alfamart', description: 'Bayar melalui gerai Alfamart' },
      { id: 'indomaret', badge: 'INDO', name: 'Indomaret', description: 'Bayar melalui gerai Indomaret' },
    ],
  },
]

// TODO: sewa alat tambahan (mobile) sementara hardcode, ambil dari API
const EXTRA_ITEMS: ExtraItem[] = [
  { id: 'raket', name: 'Sewa Raket Tambahan', price: 20000 },
  { id: 'bola', name: 'Sewa Bola / Paddle', price: 15000 },
]

const MOBILE_METHOD_GROUPS: MobileMethodGroup[] = [
  {
    id: 'ewallet',
    label: 'QRIS & E-WALLET',
    methods: [
      { id: 'qris', badge: 'QRIS', name: 'QRIS', description: 'Bayar dengan scan kode QR' },
      { id: 'gopay', badge: 'GOPAY', name: 'GoPay', description: 'Konfirmasi lewat aplikasi GoPay' },
      { id: 'shopeepay', badge: 'SPAY', name: 'ShopeePay', description: 'Bayar dari saldo ShopeePay' },
      { id: 'ovo', badge: 'OVO', name: 'OVO', description: 'Konfirmasi lewat aplikasi OVO' },
      { id: 'dana', badge: 'DANA', name: 'DANA', description: 'Bayar dari saldo DANA' },
    ],
  },
  {
    id: 'card',
    label: 'KARTU',
    methods: [{ id: 'credit_card', badge: 'CARD', name: 'Kartu kredit / debit', description: 'Pembayaran aman dengan kartu' }],
  },
  {
    id: 'bank',
    label: 'VIRTUAL ACCOUNT',
    methods: [
      { id: 'bca_va', badge: 'BCA', name: 'BCA Virtual Account', description: 'Transfer ke nomor VA BCA' },
      { id: 'bni_va', badge: 'BNI', name: 'BNI Virtual Account', description: 'Transfer ke nomor VA BNI' },
      { id: 'bri_va', badge: 'BRI', name: 'BRI Virtual Account', description: 'Transfer ke nomor VA BRI' },
      { id: 'mandiri_va', badge: 'MANDIRI', name: 'Mandiri Virtual Account', description: 'Transfer ke nomor VA Mandiri' },
      { id: 'permata_va', badge: 'PERMATA', name: 'Permata Virtual Account', description: 'Transfer ke nomor VA Permata' },
    ],
  },
  {
    id: 'retail',
    label: 'GERAI RETAIL',
    methods: [
      { id: 'alfamart', badge: 'ALFA', name: 'Alfamart', description: 'Bayar melalui kasir Alfamart' },
      { id: 'indomaret', badge: 'INDO', name: 'Indomaret', description: 'Bayar melalui kasir Indomaret' },
    ],
  },
]

/* -------------------------------------------------------------------------
   Fungsi bantu
   ------------------------------------------------------------------------- */
const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

const hourOf = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour + minute / 60
}

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const state = (location.state as CheckoutState | null) ?? {}

  const [method, setMethod] = useState<PaymentMethodId | null>(null)

  // State khusus mobile: metode pembayaran & alat tambahan yang dicentang
  const [mobileMethod, setMobileMethod] = useState<MobileMethodId | null>(null)
  const [selectedExtras] = useState<string[]>(['raket'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pricePreview, setPricePreview] = useState<Pick<BookingPrice, 'basePrice' | 'discountAmount' | 'adminFee' | 'totalPrice'> | null>(state.price ?? null)

  useEffect(() => {
    if (!state.resourceId || !state.bookingDate) navigate('/home', { replace: true })
  }, [navigate, state.bookingDate, state.resourceId])

  const selectedChannel: PaymentChannel | null = isMobile ? mobileMethod : method
  const paymentMethod = !selectedChannel
    ? undefined
    : selectedChannel === 'qris'
      ? 'qris'
      : selectedChannel === 'credit_card'
        ? 'credit_card'
        : ['gopay', 'shopeepay', 'ovo', 'dana'].includes(selectedChannel)
          ? 'ewallet'
          : ['alfamart', 'indomaret'].includes(selectedChannel)
            ? 'convenience_store'
            : 'bank_transfer'

  useEffect(() => {
    if (!state.resourceId || !state.bookingDate || !state.sportType || !state.time || !state.endTime) return
    let active = true
    previewBookingPrice({
      resourceId: state.resourceId,
      bookingDate: state.bookingDate,
      startTime: state.time,
      endTime: state.endTime,
      sportType: state.sportType,
      ...(paymentMethod ? { paymentMethod } : {}),
      bookingType: 'regular',
    })
      .then((price) => {
        if (!active) return
        setPricePreview(price)
      })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, 'Rincian harga tidak dapat diperbarui.'))
      })
    return () => { active = false }
  }, [state.bookingDate, state.endTime, state.resourceId, state.sportType, state.time, paymentMethod])

  /* ---------- Turunan data pesanan ---------- */
  const date = state.date ?? DEFAULT_DATE
  const startTime = state.time ?? DEFAULT_START
  const endTime = state.endTime ?? DEFAULT_END
  const facilityName = state.facility?.name ?? 'Lapangan Futsal Premium'
  const facilityLocation = state.facility?.location?.name ?? 'OBC Sport Center'
  const subtotal = pricePreview?.basePrice ?? state.total ?? DEFAULT_SUBTOTAL

  const hours = Math.max((state.durationMinutes ?? (hourOf(endTime) - hourOf(startTime)) * 60) / 60, 1)
  const pricePerHour = Math.round(subtotal / hours / 1000)
  const promo = pricePreview?.discountAmount ?? 0
  const serviceFee = pricePreview?.adminFee ?? 0
  const total = pricePreview?.totalPrice ?? state.total ?? DEFAULT_SUBTOTAL

  /* ---------- Turunan data mobile ---------- */
  const extrasTotal = EXTRA_ITEMS.filter((item) => selectedExtras.includes(item.id)).reduce(
    (sum, item) => sum + item.price,
    0,
  )
  const mobileTotal = total

  /* ---------- Handler ---------- */
  const handlePay = async () => {
    if (!state.resourceId || !state.bookingDate || !state.sportType) {
      toast.error('Data fasilitas atau jadwal tidak ditemukan. Silakan pilih jadwal kembali.')
      return
    }
    if (!selectedChannel) {
      toast.error('Pilih metode pembayaran terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    try {
      const booking = await createBooking({
        resourceId: state.resourceId,
        bookingDate: state.bookingDate,
        startTime,
        endTime,
        sportType: state.sportType,
        bookingType: 'regular',
        paymentChannel: selectedChannel,
        notes: selectedExtras.length > 0
          ? `Tambahan yang dipilih: ${EXTRA_ITEMS.filter((item) => selectedExtras.includes(item.id)).map((item) => item.name).join(', ')}`
          : undefined,
      })

      // Pembayaran langsung (Core API Midtrans): tampilkan instruksi di halaman ini, tanpa modal Snap
      const payment = booking.payment
      if (payment && 'unavailable' in payment) {
        toast.error(payment.message)
        setIsSubmitting(false)
        return
      }

      if (selectedChannel === 'credit_card') {
        const bookingId = booking.bookingId
        navigate(`/credit-card-payment?bookingId=${encodeURIComponent(bookingId)}`, {
          replace: true,
          state: { bookingId },
        })
        return
      }

      if (payment && 'cardPayment' in payment) {
        const bookingId = booking.bookingId
        navigate(`/information-order?bookingId=${encodeURIComponent(bookingId)}`, {
          replace: true,
          state: { bookingId },
        })
        return
      }

      if (payment && 'chargeResponse' in payment && isDirectChannel(selectedChannel)) {
        const bookingId = booking.bookingId
        navigate(`/information-order?bookingId=${encodeURIComponent(bookingId)}`, {
          replace: true,
          state: { bookingId },
        })
        return
      }

      // Channel langsung wajib memakai chargeResponse. Jangan jatuh ke halaman template Snap
      // (app.sandbox.midtrans.com/snap/...), tampilkan pesan agar mudah ditelusuri.
      // CATATAN BACKEND: bila pesan ini muncul, endpoint booking belum memanggil Core API (/v2/charge).
      if (isDirectChannel(selectedChannel)) {
        toast.error('Server belum mengembalikan data pembayaran langsung (chargeResponse). Periksa endpoint booking.')
        setIsSubmitting(false)
        return
      }

      // OVO remains on Snap, but its booking instructions stay on our status page.
      if (booking.payment && 'redirectUrl' in booking.payment) {
        const bookingId = booking.bookingId
        const informationOrderPath = `/information-order?bookingId=${encodeURIComponent(bookingId)}`
        if (selectedChannel === 'ovo') {
          navigate(informationOrderPath, { replace: true, state: { bookingId } })
          return
        }
        try {
          await openMidtransCheckout(booking.payment.token, {
            onSuccess: () => navigate(informationOrderPath, { replace: true, state: { bookingId } }),
            onPending: () => navigate(informationOrderPath, { replace: true, state: { bookingId } }),
            onError: () => navigate(informationOrderPath, { replace: true, state: { bookingId } }),
            onClose: () => navigate(informationOrderPath, { replace: true, state: { bookingId } }),
          })
        } catch {
          window.location.assign(booking.payment.redirectUrl)
        }
        return
      }
      navigate(`/success-order?bookingId=${encodeURIComponent(booking.bookingId)}`, {
        replace: true,
        state: { bookingId: booking.bookingId },
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Booking gagal dibuat. Periksa jadwal dan coba lagi.'))
      setIsSubmitting(false)
    }
  }

  

  const handlePayMobile = () => { void handlePay() }

  return (
    <>
      
      {isMobile && (
        <>
        <MobileHeader
          variant="title"
          title="Konfirmasi & Pembayaran"
          showShare
          showBottomNav={false}
        />
        <div className="min-h-[100dvh] bg-white font-body text-[#343133] pb-28">

        <div className="px-4 pt-4">
          {/* Kartu reservasi + rincian biaya */}
          <ScrollReveal>
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0E0] text-[#404F14]">
                <CalendarDays size={18} />
              </span>
              <div className="min-w-0 font-heading">
                <h2 className={`${FONT_MONTSERRAT} font-bold text-base leading-snug text-[#343133]`}>
                  {facilityName}
                </h2>
                <p className="mt-0.5 text-xs text-[#6F6B6E]">{facilityLocation}</p>
                <p className="mt-0.5 text-xs text-[#6F6B6E]">{date}</p>
                <p className="mt-0.5 text-xs text-[#6F6B6E]">
                  {startTime} - {endTime}
                </p>
              </div>
            </div>

            <hr className="my-3 border-[#D4D4D4]" />

            <dl className="space-y-2 font-heading text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">Sewa Lapangan</dt>
                <dd className="text-[#343133]">{formatRupiah(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">Biaya Admin</dt>
                <dd className="text-[#343133]">{formatRupiah(serviceFee)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">Sewa Tambahan</dt>
                <dd className="text-[#343133]">{formatRupiah(extrasTotal)}</dd>
              </div>
            </dl>

            <hr className="my-3 border-[#D4D4D4]" />

            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-[#121212]">
                Total Pembayaran
              </span>
              <span className={`${FONT_MONTSERRAT} font-bold text-lg text-[#404F14]`}>
                {formatRupiah(mobileTotal)}
              </span>
            </div>
          </section>
          </ScrollReveal>
         

          <DeferredSection placeholderClassName="mt-6 min-h-[360px]">
            <div className="mt-6">
              <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                Metode Pembayaran
              </h2>

              <div role="radiogroup" aria-label="Metode pembayaran" className="mt-2 space-y-3">
                {MOBILE_METHOD_GROUPS.map((group) => (
                  <div key={group.id}>
                    <h3 className={`${FONT_MONTSERRAT} px-1 font-bold text-[11px] text-[#404F14]`}>
                      {group.label}
                    </h3>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {group.methods.map((item) => {
                        const isActive = mobileMethod === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => setMobileMethod(item.id)}
                            className={`flex min-h-[112px] min-w-0 flex-col items-start gap-2 rounded-xl border bg-white p-3 text-left cursor-pointer transition-colors ${
                              isActive
                                ? 'border-[#404F14] bg-[#F5FAF0] shadow-[0_0_0_1px_#404F14]'
                                : 'border-[#D4D4D4] hover:border-[#9AAD3E]'
                            }`}
                          >
                            <span className="flex w-full items-center justify-between gap-2">
                              <span
                                className={`flex h-5 min-w-10 shrink-0 items-center justify-center rounded px-1 text-[9px] font-heading font-bold ${
                                  isActive
                                    ? 'bg-[#E6F0E0] text-[#404F14]'
                                    : 'bg-[#F0F0F0] text-[#6F6B6E]'
                                }`}
                              >
                                {item.badge}
                              </span>
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                  isActive ? 'border-2 border-[#404F14]' : 'border border-[#D4D4D4]'
                                }`}
                                aria-hidden="true"
                              >
                                {isActive && <span className="h-2 w-2 rounded-full bg-[#404F14]" />}
                              </span>
                            </span>
                            <span className="block w-full break-words font-heading text-xs font-semibold leading-tight text-[#343133]">
                              {item.name}
                            </span>
                            <span className="block w-full break-words text-[10px] leading-snug text-[#6F6B6E]">
                              {item.description}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Peringatan cashless (sama dengan versi PC) */}
              <div className="mt-4 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-2 py-2">
                <p className="font-heading text-[10px] leading-4 text-[#C00000]">
                  <span aria-hidden="true">⚠️</span> Sistem OBC Sport Center sepenuhnya cashless.
                  Pembayaran di tempat (COD) tidak didukung untuk mengamankan slot secara real-time.
                </p>
              </div>
            </div>
          </DeferredSection>
        </div>

        {/* Tombol bayar (fixed di bawah) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D4D4D4] bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handlePayMobile}
            disabled={isSubmitting || !selectedChannel}
            className="h-12 w-full rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Memproses booking...' : selectedChannel ? 'Bayar Sekarang' : 'Pilih metode pembayaran'}
          </button>
        </div>
        </div>
        </>
      )}

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      {!isMobile && <div className="min-h-screen bg-white font-body text-[#343133]">
        <NavbarDashboard showDesktopNavigation={false} showMobileHeader={false} />

        {/* Lebar konten 1200px sesuai desain */}
        <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
          <h1 className={`${FONT_MONTSERRAT} font-bold text-[26px] leading-9 text-[#343133]`}>
            Pembayaran &amp; Checkout
          </h1>
          <p className="mt-0.5 font-heading text-[13px] leading-5 text-[#343133]">
            Selesaikan transaksi Anda dengan memilih opsi pembayaran di bawah ini.
          </p>

          <ScrollReveal>
          <div className="mt-5 grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            {/* ================= Kolom kiri: metode pembayaran ================= */}
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
              <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                Pilih Metode Pembayaran
              </h2>

              <div role="radiogroup" aria-label="Metode pembayaran">
                {PAYMENT_GROUPS.map((group, groupIndex) => (
                  <div key={group.id} className={groupIndex === 0 ? 'mt-4' : 'mt-4'}>
                    <h3 className={`${FONT_MONTSERRAT} font-bold text-[11px] text-[#404F14]`}>
                      {group.label}
                    </h3>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {group.methods.map((item) => {
                        const isActive = method === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => setMethod(item.id)}
                            className={`flex min-h-[76px] min-w-0 items-center gap-3 rounded-lg bg-white px-3 py-2 text-left cursor-pointer transition-colors ${
                              isActive
                                ? 'border-2 border-[#404F14]'
                                : 'border border-[#D4D4D4] hover:border-[#9AAD3E]'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-heading font-bold ${
                                isActive
                                  ? 'bg-[#E6F0E0] text-[#404F14]'
                                  : 'bg-[#F0F0F0] text-[#6F6B6E]'
                              }`}
                            >
                              {item.badge}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block break-words font-heading text-[13px] font-semibold leading-[18px] text-[#343133]">
                                {item.name}
                              </span>
                              <span className="block break-words font-heading text-[10px] leading-[14px] text-[#6F6B6E]">
                                {item.description}
                              </span>
                            </span>
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                isActive ? 'bg-[#404F14]' : 'border border-[#D4D4D4] bg-white'
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Peringatan cashless */}
              <div className="mt-4 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-2 py-2">
                <p className="font-heading text-[10px] leading-4 text-[#C00000]">
                  <span aria-hidden="true">⚠️</span> Sistem OBC Sport Center sepenuhnya cashless.
                  Pembayaran di tempat (COD) tidak didukung untuk mengamankan slot secara real-time.
                </p>
              </div>
            </section>

            {/* ================= Kolom kanan: ringkasan ================= */}
            <div>
              <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
                <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                  Detail Reservasi
                </h2>

                <dl className="mt-3 space-y-2 font-heading text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">Fasilitas</dt>
                    <dd className="font-bold text-[#121212]">{facilityName}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">Tanggal</dt>
                    <dd className="font-bold text-[#121212]">{date}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">Waktu</dt>
                    <dd className="font-bold text-[#404F14]">
                      {startTime} - {endTime} ({hours} Jam)
                    </dd>
                  </div>
                </dl>

                <hr className="my-3 border-[#D4D4D4]" />

                <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                  Rincian Biaya
                </h2>

                <dl className="mt-3 space-y-2 font-heading text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">
                      Sewa Lapangan (Rp {pricePerHour}k x {hours})
                    </dt>
                    <dd className="text-[#343133]">{formatRupiah(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#404F14]">Promo ({PROMO_CODE})</dt>
                    <dd className="font-bold text-[#404F14]">-{formatRupiah(promo)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">Biaya Layanan</dt>
                    <dd className="text-[#343133]">{formatRupiah(serviceFee)}</dd>
                  </div>
                </dl>

                <hr className="my-3 border-[#D4D4D4]" />

                <div className="flex items-center justify-between pt-1">
                  <span className="font-heading font-bold text-[13px] text-[#121212]">
                    Total Bayar
                  </span>
                  <span className={`${FONT_MONTSERRAT} font-bold text-xl text-[#404F14]`}>
                    {formatRupiah(total)}
                  </span>
                </div>
              </section>

              <button
                type="button"
                onClick={handlePay}
                disabled={isSubmitting || !selectedChannel}
                className="mt-4 h-10 w-full rounded-lg bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Memproses booking...' : selectedChannel ? 'Konfirmasi & Bayar' : 'Pilih metode pembayaran'}
              </button>
            </div>
          </div>
          </ScrollReveal>
        </main>

        <DeferredFooter />
      </div>}

    </>
  )
}

export default PaymentPage