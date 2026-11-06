import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredSection from '../../components/layout/DeferredSection'
import DeferredFooter from '../../components/layout/DeferredFooter'
import ScrollReveal from '../../components/animation/ScrollReveal'
import PendingOrderModal from '../../components/ui/PendingOrderModal'
import PaymentMethodSelector from '../../components/ui/PaymentMethodSelector'
import { useIsMobile } from '../../hooks/useIsMobile'
import { checkoutCart, createBooking, getBookingDetails, previewBookingPrice, type BookingPrice, type PaymentChannel } from '../../services/bookingService'
import type { CartItem } from '../../components/ui/CartModal'
import { cartService, syncBackendCart } from '../../services/cart'
import { getApiErrorMessage } from '../../services/apiService'
import { isDirectChannel, parseMidtransCharge, parsePersistedDirectPayment, type DirectPaymentInfo } from '../../services/paymentService'
import { useTranslation } from 'react-i18next'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface PendingOrderModalData {
  bookingId: string
  bookingIds?: string[]
  transactionId: string
  amount: number
  paymentInfo?: DirectPaymentInfo | null
  paymentUrl?: string
  date: string
  time: string
  paymentMethod: string
  bookings: Array<{ id: string; name: string; date: string; time: string }>
  expiresAt: string
}

const PENDING_ORDER_STORAGE_KEY = 'obc-pending-payment-state'
const PENDING_ORDER_MAX_AGE_MS = 3 * 60 * 1000
const PAID_STATUSES = ['paid', 'settlement', 'capture', 'fully_paid', 'completed']
const FAILED_STATUSES = ['cancelled', 'expired', 'refunded', 'deny', 'failure', 'failed', 'cancel']

function readPendingOrder(): PendingOrderModalData | null {
  try {
    const stored = sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY)
    if (!stored) return null
    const pending = JSON.parse(stored) as PendingOrderModalData
    if (!pending.bookingId || !pending.expiresAt || !Array.isArray(pending.bookings)) return null
    return pending
  } catch {
    return null
  }
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
  cartItems?: CartItem[]
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
// Fallback bila halaman dibuka tanpa state (sesuai desain)
const DEFAULT_START = '08:00'
const DEFAULT_END = '10:00'
const DEFAULT_SUBTOTAL = 250000

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

// TODO: sewa alat tambahan (mobile) sementara hardcode, ambil dari API
const EXTRA_ITEMS: ExtraItem[] = [
  { id: 'raket', name: 'Additional racket rental', price: 20000 },
  { id: 'bola', name: 'Ball / paddle rental', price: 15000 },
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
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const extraItems = EXTRA_ITEMS.map((item) => ({
    ...item,
    name: t(item.id === 'raket' ? 'payment.extras.racket' : 'payment.extras.ballPaddle'),
  }))
  const pendingParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const pendingBookingId = pendingParams.get('pendingBookingId') ?? ''
  const pendingBookingIds = useMemo(
    () => pendingParams.get('pendingBookingIds')?.split(',').filter(Boolean) ?? [],
    [pendingParams],
  )
  const state = useMemo(() => {
    const routeState = location.state as CheckoutState | null
    if (routeState) return routeState
    try {
      const stored = sessionStorage.getItem('obc-cart-payment-state')
      return stored ? JSON.parse(stored) as CheckoutState : {}
    } catch {
      return {}
    }
  }, [location.state])
  const cartItems = useMemo(() =>
    state.cartItems?.filter((item) => item.resourceId && item.bookingDate && item.startTime && item.endTime && item.sportType) ?? [],
  [state.cartItems])
  const isCartCheckout = cartItems.length > 0
  const cartItemsKey = cartItems.map((item) => `${item.resourceId}:${item.bookingDate}:${item.startTime}:${item.endTime}:${item.sportType}`).join('|')

  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(null)

  // State khusus mobile: alat tambahan yang dicentang
  const [selectedExtras] = useState<string[]>(['raket'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingOrderModal, setPendingOrderModal] = useState<PendingOrderModalData | null>(readPendingOrder)
  const [pricePreview, setPricePreview] = useState<Pick<BookingPrice, 'basePrice' | 'discountAmount' | 'adminFee' | 'totalPrice'> | null>(state.price ?? null)

  useEffect(() => {
    if (!pendingOrderModal && !pendingBookingId && (!state.resourceId || !state.bookingDate)) navigate('/home', { replace: true })
  }, [navigate, pendingBookingId, pendingOrderModal, state.bookingDate, state.resourceId])

  const selectedMethodLabel = selectedChannel ? t(`payment.methods.${selectedChannel}.name`) : t('payment.midtrans')
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
    let active = true
    const items = isCartCheckout
      ? cartItems
      : [{ resourceId: state.resourceId, bookingDate: state.bookingDate, startTime: state.time, endTime: state.endTime, sportType: state.sportType }]

    if (items.some((item) => !item.resourceId || !item.bookingDate || !item.startTime || !item.endTime || !item.sportType)) return

    Promise.all(items.map((item) => previewBookingPrice({
      resourceId: item.resourceId!,
      bookingDate: item.bookingDate!,
      startTime: item.startTime!,
      endTime: item.endTime!,
      sportType: item.sportType!,
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(selectedChannel ? { paymentChannel: selectedChannel } : {}),
      bookingType: 'regular',
    })))
      .then((prices) => {
        if (!active) return
        if (prices.length === 1) {
          setPricePreview(prices[0])
          return
        }
        setPricePreview({
          basePrice: prices.reduce((sum, price) => sum + price.basePrice, 0),
          discountAmount: prices.reduce((sum, price) => sum + price.discountAmount, 0),
          adminFee: prices.reduce((sum, price) => sum + price.adminFee, 0),
          totalPrice: prices.reduce((sum, price) => sum + price.totalPrice, 0),
        })
      })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, 'Rincian harga tidak dapat diperbarui.'))
      })
    return () => { active = false }
  }, [cartItems, cartItemsKey, isCartCheckout, paymentMethod, selectedChannel, state.bookingDate, state.endTime, state.resourceId, state.sportType, state.time])

  /* ---------- Turunan data pesanan ---------- */
  const date = state.date ?? new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
  const startTime = state.time ?? DEFAULT_START
  const endTime = state.endTime ?? DEFAULT_END
  const facilityName = state.facility?.name ?? t('history.facilities.futsal')
  const facilityLocation = state.facility?.location?.name ?? 'OBC Sport Center'
  const pendingBookings = isCartCheckout
    ? cartItems.map((item) => ({
        id: item.id,
        name: item.facilityName,
        date: item.bookingDate ?? '-',
        time: `${item.startTime ?? '-'} - ${item.endTime ?? '-'}`,
      }))
    : [{ id: state.resourceId ?? 'booking', name: facilityName, date, time: `${startTime} - ${endTime}` }]

  useEffect(() => {
    if (!pendingOrderModal) return

    let active = true
    const expiresAt = new Date(pendingOrderModal.expiresAt).getTime()
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      navigate('/home', { replace: true })
      return
    }

    const timeout = window.setTimeout(() => {
      sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      navigate('/home', { replace: true })
    }, expiresAt - Date.now())

    Promise.all((pendingOrderModal.bookingIds ?? [pendingOrderModal.bookingId]).map((id) => getBookingDetails(id)))
      .then((details) => {
        if (!active) return
        const allPaid = details.every((booking) => PAID_STATUSES.includes(booking.status) || PAID_STATUSES.includes(booking.payments[0]?.status ?? ''))
        if (allPaid) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(`/success-order?bookingId=${encodeURIComponent(pendingOrderModal.bookingId)}&bookingIds=${encodeURIComponent((pendingOrderModal.bookingIds ?? [pendingOrderModal.bookingId]).join(','))}`, { replace: true })
          return
        }
        const hasFailed = details.some((booking) => FAILED_STATUSES.includes(booking.status) || FAILED_STATUSES.includes(booking.payments[0]?.status ?? ''))
        if (hasFailed) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(`/failed-order?bookingId=${encodeURIComponent(pendingOrderModal.bookingId)}`, { replace: true })
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [navigate, pendingOrderModal])

  useEffect(() => {
    if (!pendingBookingId || pendingOrderModal) return

    let active = true
    const bookingIds = pendingBookingIds.length ? pendingBookingIds : [pendingBookingId]
    Promise.all(bookingIds.map((id) => getBookingDetails(id)))
      .then((details) => {
        if (!active) return
        const allPaid = details.every((booking) => PAID_STATUSES.includes(booking.status) || PAID_STATUSES.includes(booking.payments[0]?.status ?? ''))
        if (allPaid) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(`/success-order?bookingId=${encodeURIComponent(pendingBookingId)}&bookingIds=${encodeURIComponent(bookingIds.join(','))}`, { replace: true })
          return
        }
        const hasFailed = details.some((booking) => FAILED_STATUSES.includes(booking.status) || FAILED_STATUSES.includes(booking.payments[0]?.status ?? ''))
        if (hasFailed) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(`/failed-order?bookingId=${encodeURIComponent(pendingBookingId)}`, { replace: true })
          return
        }

        const firstBooking = details[0]
        const firstPayment = firstBooking?.payments[0]
        if (!firstBooking) throw new Error(t('payment.bookingNotFound'))
        const paymentCreatedAt = firstPayment?.createdAt ? new Date(firstPayment.createdAt).getTime() : Number.NaN
        const serverExpiry = firstBooking.lockedUntil ?? firstPayment?.expiredAt
        const serverExpiryTime = serverExpiry ? new Date(serverExpiry).getTime() : Number.NaN
        const threeMinuteExpiry = Number.isFinite(paymentCreatedAt)
          ? paymentCreatedAt + PENDING_ORDER_MAX_AGE_MS
          : Date.now() + PENDING_ORDER_MAX_AGE_MS
        const expiresAt = new Date(Number.isFinite(serverExpiryTime)
          ? Math.min(serverExpiryTime, threeMinuteExpiry)
          : threeMinuteExpiry).toISOString()
        const modalData: PendingOrderModalData = {
          bookingId: pendingBookingId,
          bookingIds,
          transactionId: firstPayment?.midtransOrderId ?? pendingBookingId,
          amount: firstPayment?.amount ?? firstBooking.pricing.totalPrice,
          paymentInfo: parsePersistedDirectPayment(firstPayment?.paymentDetails),
          paymentUrl: firstPayment?.redirectUrl ?? undefined,
          date: firstBooking.bookingDate,
          time: `${firstBooking.startTime} - ${firstBooking.endTime}`,
          paymentMethod: firstPayment?.method ?? firstPayment?.paymentType ?? t('payment.midtrans'),
          bookings: details.map((booking) => ({
            id: booking.id,
            name: booking.resource.name,
            date: booking.bookingDate,
            time: `${booking.startTime} - ${booking.endTime}`,
          })),
          expiresAt,
        }
        sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(modalData))
        setPendingOrderModal(modalData)
      })
      .catch(() => {
        if (active) navigate('/home', { replace: true })
      })

    return () => { active = false }
  }, [navigate, pendingBookingId, pendingBookingIds, pendingOrderModal])
  const subtotal = pricePreview?.basePrice ?? state.total ?? DEFAULT_SUBTOTAL

  const hours = Math.max((state.durationMinutes ?? (hourOf(endTime) - hourOf(startTime)) * 60) / 60, 1)
  const isSoccerBooking = state.sportType === 'sepakbola'
  const billingBlocks = isSoccerBooking ? hours / 2 : hours
  const displayedRate = Math.round(subtotal / billingBlocks / 1000)
  const promo = selectedChannel ? pricePreview?.discountAmount ?? 0 : 0
  const serviceFee = selectedChannel ? pricePreview?.adminFee ?? 0 : 0
  const total = selectedChannel
    ? pricePreview?.totalPrice ?? subtotal
    : subtotal

  /* ---------- Turunan data mobile ---------- */
  const extrasTotal = extraItems.filter((item) => selectedExtras.includes(item.id)).reduce(
    (sum, item) => sum + item.price,
    0,
  )
  const mobileTotal = selectedChannel ? subtotal + serviceFee + extrasTotal : subtotal + extrasTotal

  const showPendingOrderModal = (pending: Omit<PendingOrderModalData, 'date' | 'time' | 'paymentMethod' | 'bookings' | 'expiresAt'>, holdExpiresAt?: string | null) => {
    const fallbackExpiry = Date.now() + PENDING_ORDER_MAX_AGE_MS
    const holdExpiry = holdExpiresAt ? new Date(holdExpiresAt).getTime() : Number.NaN
    const modalData: PendingOrderModalData = {
      ...pending,
      date,
      time: `${startTime} - ${endTime}`,
      paymentMethod: selectedMethodLabel,
      bookings: pendingBookings,
      expiresAt: new Date(Number.isFinite(holdExpiry) ? Math.min(holdExpiry, fallbackExpiry) : fallbackExpiry).toISOString(),
    }
    try {
      sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(modalData))
    } catch {
      // The active modal still works if browser storage is unavailable.
    }
    const params = new URLSearchParams({
      pendingBookingId: modalData.bookingId,
      pendingBookingIds: (modalData.bookingIds ?? [modalData.bookingId]).join(','),
    })
    navigate(`/payment?${params.toString()}`, { replace: true, state: location.state })
    setPendingOrderModal(modalData)
  }

  /* ---------- Handler ---------- */
  const handlePay = async () => {
    if (!state.resourceId || !state.bookingDate || !state.sportType) {
      toast.error(t('payment.missingBooking'))
      return
    }
    if (!selectedChannel) {
      toast.error(t('payment.chooseMethod'))
      return
    }

    setIsSubmitting(true)
    try {
      const booking = isCartCheckout
        ? await (async () => {
          const result = await checkoutCart(cartItems.map((item) => ({
            resourceId: item.resourceId!,
            bookingDate: item.bookingDate!,
            startTime: item.startTime!,
            endTime: item.endTime!,
            sportType: item.sportType!,
          })), paymentMethod, selectedChannel ?? undefined)
          cartService.clearCart()
          await syncBackendCart().catch(() => undefined)
          return {
            bookingId: result.bookingIds[0] ?? result.orderId,
            bookingIds: result.bookingIds,
            status: 'pending',
            totalPrice: result.totalAmount,
            totalPriceFormatted: result.totalAmountFormatted,
            payment: result.payment,
            holdExpiresAt: null,
            message: result.message,
          }
        })()
        : await createBooking({
          resourceId: state.resourceId,
          bookingDate: state.bookingDate,
          startTime,
          endTime,
          sportType: state.sportType,
          bookingType: 'regular',
          paymentChannel: selectedChannel,
          notes: selectedExtras.length > 0
            ? `${t('payment.extraRental')}: ${extraItems.filter((item) => selectedExtras.includes(item.id)).map((item) => item.name).join(', ')}`
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
        navigate(`/credit-card-payment?bookingId=${encodeURIComponent(bookingId)}`, {
          replace: true,
          state: { bookingId },
        })
        return
      }

      if (payment && 'chargeResponse' in payment && isDirectChannel(selectedChannel)) {
        const bookingId = booking.bookingId
        const bookingIds = 'bookingIds' in booking ? booking.bookingIds : [booking.bookingId]
        showPendingOrderModal({
          bookingId,
          bookingIds,
          transactionId: payment.chargeResponse.order_id ?? bookingId,
          amount: Number(payment.chargeResponse.gross_amount) || total,
          paymentInfo: parseMidtransCharge(payment.chargeResponse, selectedChannel),
        }, booking.holdExpiresAt)
        setIsSubmitting(false)
        return
      }

      // Channel langsung wajib memakai chargeResponse. Jangan jatuh ke halaman template Snap
      // (app.sandbox.midtrans.com/snap/...), tampilkan pesan agar mudah ditelusuri.
      // CATATAN BACKEND: bila pesan ini muncul, endpoint booking belum memanggil Core API (/v2/charge).
      if (isDirectChannel(selectedChannel)) {
        toast.error(t('payment.missingCharge'))
        setIsSubmitting(false)
        return
      }

      // OVO uses its redirect URL; other Snap channels show the order modal after checkout.
      if (booking.payment && 'redirectUrl' in booking.payment) {
        const bookingId = booking.bookingId
        const bookingIds = 'bookingIds' in booking ? booking.bookingIds : [booking.bookingId]
        if (selectedChannel === 'ovo') {
          showPendingOrderModal({
            bookingId,
            bookingIds,
            transactionId: bookingId,
            amount: total,
            paymentUrl: booking.payment.redirectUrl,
          }, booking.holdExpiresAt)
          setIsSubmitting(false)
          return
        }

        showPendingOrderModal({ bookingId, bookingIds, transactionId: bookingId, amount: total }, booking.holdExpiresAt)
        setIsSubmitting(false)
        return
      }
      const bookingIds = 'bookingIds' in booking ? booking.bookingIds : [booking.bookingId]
      navigate(`/success-order?bookingId=${encodeURIComponent(booking.bookingId)}&bookingIds=${encodeURIComponent(bookingIds.join(','))}`, {
        replace: true,
        state: { bookingId: booking.bookingId, bookingIds },
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('payment.createFailed')))
      setIsSubmitting(false)
    }
  }

  

  const handlePayMobile = () => { void handlePay() }

  if (pendingOrderModal) {
    return (
      <PendingOrderModal
        date={pendingOrderModal.date}
        time={pendingOrderModal.time}
        paymentMethod={pendingOrderModal.paymentMethod}
        amount={pendingOrderModal.amount}
        transactionId={pendingOrderModal.transactionId}
        paymentInfo={pendingOrderModal.paymentInfo}
        paymentUrl={pendingOrderModal.paymentUrl}
        bookings={pendingOrderModal.bookings}
        onReturnHome={() => {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate('/home')
        }}
        onOpenOrderStatus={() => {
          const bookingId = pendingOrderModal.bookingId
          const bookingIds = pendingOrderModal.bookingIds ?? [bookingId]
          const bookingIdsParam = bookingIds.join(',')
          navigate(`/finalisasi-order?bookingId=${encodeURIComponent(bookingId)}&bookingIds=${encodeURIComponent(bookingIdsParam)}`, {
            state: { bookingId, bookingIds },
          })
        }}
        onContinuePayment={() => {
          if (pendingOrderModal.paymentUrl) window.location.assign(pendingOrderModal.paymentUrl)
        }}
      />
    )
  }

  if (pendingBookingId) {
    return (
      <main className="grid h-[100dvh] w-screen place-items-center bg-[#F4F6F0]" role="status" aria-live="polite">
        <div className="text-center">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[#DCE5D3] border-t-[#354B24]" />
          <p className="mt-4 font-heading text-sm font-semibold text-[#354B24]">{t('payment.loadingStatus')}</p>
        </div>
      </main>
    )
  }

  if (isSubmitting) {
    return (
      <main className="grid h-[100dvh] w-screen place-items-center bg-[#F4F6F0]" role="status" aria-live="polite">
        <div className="text-center">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[#DCE5D3] border-t-[#354B24]" />
          <p className="mt-4 font-heading text-sm font-semibold text-[#354B24]">{t('payment.preparing')}</p>
        </div>
      </main>
    )
  }

  return (
    <>
      {isMobile && (
        <>
        <MobileHeader
          variant="title"
          title={t('payment.confirmTitle')}
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
                {isCartCheckout && (
                  <div className="mt-2 space-y-1 border-t border-[#E5E5E5] pt-2">
                    <p className="text-[11px] font-semibold text-[#404F14]">{t('payment.cartCount', { count: cartItems.length })}</p>
                    {cartItems.map((item) => <p key={item.id} className="text-[11px] leading-4 text-[#6F6B6E]">{item.facilityName} · {item.startTime}-{item.endTime}</p>)}
                  </div>
                )}
              </div>
            </div>

            <hr className="my-3 border-[#D4D4D4]" />

            <dl className="space-y-2 font-heading text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">{t('payment.courtRental')}</dt>
                <dd className="text-[#343133]">{formatRupiah(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">{t('payment.adminFee')}</dt>
                <dd className="text-[#343133]">{formatRupiah(serviceFee)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">{t('payment.extraRental')}</dt>
                <dd className="text-[#343133]">{formatRupiah(extrasTotal)}</dd>
              </div>
            </dl>

            <hr className="my-3 border-[#D4D4D4]" />

            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-[#121212]">
                {t('payment.totalPayment')}
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
                {t('payment.choosePaymentMethod')}
              </h2>

              <div className="mt-2">
                <PaymentMethodSelector value={selectedChannel} onChange={setSelectedChannel} ariaLabel={t('payment.methodLabel')} />
              </div>

              {/* Peringatan cashless (sama dengan versi PC) */}
              <div className="mt-4 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-2 py-2">
                <p className="font-heading text-[10px] leading-4 text-[#C00000]">
                  <span aria-hidden="true">⚠️</span> {t('payment.cashlessNotice')}
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
            {isSubmitting ? t('payment.processingBooking') : selectedChannel ? t('payment.payNow') : t('payment.chooseMethod')}
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
            {t('payment.confirmTitle')}
          </h1>
          <p className="mt-0.5 font-heading text-[13px] leading-5 text-[#343133]">
            {t('payment.confirmDescription')}
          </p>

          <ScrollReveal>
          <div className="mt-5 grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            {/* ================= Kolom kiri: metode pembayaran ================= */}
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
              <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                {t('payment.choosePaymentMethod')}
              </h2>

              <div className="mt-4">
                <PaymentMethodSelector value={selectedChannel} onChange={setSelectedChannel} ariaLabel={t('payment.methodLabel')} />
              </div>

              {/* Peringatan cashless */}
              <div className="mt-4 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-2 py-2">
                <p className="font-heading text-[10px] leading-4 text-[#C00000]">
                  <span aria-hidden="true">⚠️</span> {t('payment.cashlessNotice')}
                </p>
              </div>
            </section>

            {/* ================= Kolom kanan: ringkasan ================= */}
            <div>
              <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
                <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                  {t('payment.reservationDetails')}
                </h2>

                <dl className="mt-3 space-y-2 font-heading text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.facility')}</dt>
                    <dd className="font-bold text-[#121212]">{facilityName}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.date')}</dt>
                    <dd className="font-bold text-[#121212]">{isCartCheckout ? t('payment.bookingPackages', { count: cartItems.length }) : date}</dd>
                  </div>
                  {isCartCheckout && cartItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <dt className="max-w-[55%] text-[#6F6B6E]">{item.facilityName}</dt>
                      <dd className="text-right text-[11px] font-bold text-[#121212]">{item.bookingDate}<br />{item.startTime}-{item.endTime}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.time')}</dt>
                    <dd className="font-bold text-[#404F14]">
                      {startTime} - {endTime} ({t('booking.durationHours', { count: hours })})
                    </dd>
                  </div>
                </dl>

                <hr className="my-3 border-[#D4D4D4]" />

                <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                  {t('payment.costDetails')}
                </h2>

                <dl className="mt-3 space-y-2 font-heading text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">
                      {t(isSoccerBooking ? 'payment.courtRentalRateTwoHours' : 'payment.courtRentalRate', { rate: displayedRate, hours: isSoccerBooking ? billingBlocks : hours })}
                    </dt>
                    <dd className="text-[#343133]">{formatRupiah(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#404F14]">{t('payment.promotion', { code: t('payment.promoCode') })}</dt>
                    <dd className="font-bold text-[#404F14]">-{formatRupiah(promo)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.serviceFee')}</dt>
                    <dd className="text-[#343133]">{formatRupiah(serviceFee)}</dd>
                  </div>
                </dl>

                <hr className="my-3 border-[#D4D4D4]" />

                <div className="flex items-center justify-between pt-1">
                  <span className="font-heading font-bold text-[13px] text-[#121212]">
                    {t('payment.totalPayment')}
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
                {isSubmitting ? t('payment.processingBooking') : selectedChannel ? t('payment.confirmAndPay') : t('payment.chooseMethod')}
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