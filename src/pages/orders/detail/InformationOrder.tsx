import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock } from 'lucide-react'
import ScrollReveal from '../../../components/animation/ScrollReveal'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { cancelBooking, getBookingDetails, type BookingDetails } from '../../../services/bookingService'
import { getApiErrorMessage } from '../../../services/apiService'
import { getMembershipDetail } from '../../../services/membershipService'
import { useTranslation } from 'react-i18next'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
// Data yang dikirim dari PaymentPage lewat navigate('/pembayaran/qris', { state })
interface InformationState {
  bookingId?: string
  membershipId?: string
  bookingIds?: string[]
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const isPaidBooking = (booking: BookingDetails | null) => {
  const bookingStatus = booking?.status.toLowerCase()
  const paymentStatus = booking?.payments[0]?.status.toLowerCase()
  return ['fully_paid', 'completed', 'paid'].includes(bookingStatus ?? '')
    || ['paid', 'settlement', 'capture'].includes(paymentStatus ?? '')
}

function PaymentCountdown({ expiresAt }: { expiresAt?: string }) {
  const { t } = useTranslation()
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
        {t('paymentStatus.finishIn')}{' '}
        <span className="font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </span>
      <span className="hidden md:inline">
        {t('paymentStatus.deadline')} {minutes} {t('paymentStatus.minutes')} {String(seconds).padStart(2, '0')} {t('paymentStatus.seconds')}
      </span>
    </>
  )
}

function InformationOrder() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const state = (location.state as InformationState | null) ?? {}
  const queryBookingIds = new URLSearchParams(location.search).get('bookingIds')?.split(',').filter(Boolean) ?? []
  const bookingIds = state.bookingIds?.length ? state.bookingIds : queryBookingIds.length ? queryBookingIds : [state.bookingId ?? new URLSearchParams(location.search).get('bookingId') ?? ''].filter(Boolean)
  const bookingIdsKey = bookingIds.join('|')
  const bookingId = bookingIds[0] ?? ''
  const membershipId = state.membershipId ?? new URLSearchParams(location.search).get('membershipId') ?? ''
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isChangingPaymentMethod, setIsChangingPaymentMethod] = useState(false)
  const [copied, setCopied] = useState(false)
  const payment = booking?.payments[0]
  const isPaid = isPaidBooking(booking)
  const canChangePaymentMethod = booking?.status === 'unpaid' && !isPaid
  const paymentChannel = payment?.paymentDetails?.obc_payment_channel
  const canPayByCreditCard = Boolean(
    booking?.status === 'unpaid'
    && paymentChannel === 'credit_card'
    && ['pending', 'failed'].includes(payment?.status ?? ''),
  )
  const total = payment?.amount ?? booking?.pricing.totalPrice ?? 0
  const statusText = t(`paymentStatus.statuses.${booking?.status}`, {
    defaultValue: booking?.status ?? t('paymentStatus.loadingStatus'),
  })
  const transactionId = payment?.midtransOrderId ?? booking?.id ?? bookingId
  const expiresAt = payment?.expiredAt ?? booking?.lockedUntil ?? undefined
  const redirectUrl = payment?.redirectUrl

  useEffect(() => {
    if (!bookingId && !membershipId) {
      navigate('/home', { replace: true })
      return
    }

    let active = true
    let timeout: number | undefined
    if (membershipId) {
      const refreshMembership = async () => {
        try {
          const detail = await getMembershipDetail(membershipId)
          if (!active) return
          setErrorMessage('')

          const payment = detail.payments[0]
          const storedPayment = payment?.paymentDetails as { chargeResponse?: unknown } | null | undefined
          const bookingLike = {
            id: detail.id,
            status: payment?.status ?? detail.status,
            bookingDate: detail.purchaseDate,
            startTime: '',
            endTime: '',
            durationMinutes: 0,
            sportType: detail.package.sportType,
            bookingType: 'membership',
            resource: { id: detail.package.id, name: detail.package.name, slug: detail.package.id, resourceType: 'membership' },
            pricing: {
              basePrice: payment?.totalAmount ?? detail.package.memberPrice,
              discountAmount: 0,
              adminFee: 0,
              totalPrice: payment?.totalAmount ?? detail.package.memberPrice,
              formatted: { basePrice: '', adminFee: '', totalPrice: '' },
            },
            payments: payment ? [{
              id: payment.id,
              midtransOrderId: payment.midtransOrderId,
              paymentType: payment.paymentType,
              method: payment.method ?? null,
              amount: payment.totalAmount,
              amountFormatted: '',
              status: payment.status,
              paymentDetails: storedPayment?.chargeResponse ?? payment.paymentDetails ?? null,
              paidAt: null,
              createdAt: payment.createdAt,
              redirectUrl: payment.redirectUrl ?? null,
              expiredAt: null,
            }] : [],
            lockedUntil: detail.expiryDate,
            paidAt: null,
            cancelledAt: null,
            completedAt: null,
          } as BookingDetails
          setBooking(bookingLike)
          if (['paid', 'settlement', 'capture'].includes(payment?.status ?? '')) {
            navigate(`/success-order?membershipId=${encodeURIComponent(detail.id)}`, { replace: true, state: { membershipId: detail.id } })
            return
          }
          if (['cancelled', 'expired', 'refunded', 'deny', 'failure', 'failed'].includes(payment?.status ?? '') || detail.status === 'cancelled') {
            navigate(`/failed-order?membershipId=${encodeURIComponent(detail.id)}`, { replace: true, state: { membershipId: detail.id } })
            return
          }
        } catch (error) {
          if (active) setErrorMessage(getApiErrorMessage(error, t('paymentStatus.membershipLoadFailed')))
        }
        if (active) timeout = window.setTimeout(() => void refreshMembership(), 4000)
      }
      void refreshMembership()
      return () => {
        active = false
        if (timeout) window.clearTimeout(timeout)
      }
    }

    const refresh = async () => {
      try {
        const effectBookingIds = bookingIdsKey.split('|').filter(Boolean)
        const latestBookings = await Promise.all(effectBookingIds.map((id) => getBookingDetails(id)))
        const latest = latestBookings[0]
        if (!active || !latest) return
        setBooking(latest)
          setErrorMessage('')

        if (isPaidBooking(latest)) return
        if (['cancelled', 'expired', 'refunded'].includes(latest.status)) {
          navigate(`/failed-order?bookingId=${encodeURIComponent(bookingId)}`, {
            replace: true,
            state: { bookingId },
          })
          return
        }
      } catch (error) {
        if (active) setErrorMessage(getApiErrorMessage(error, t('paymentStatus.statusLoadFailed')))
      }

      if (active) timeout = window.setTimeout(() => void refresh(), 4000)
    }

    void refresh()
    return () => {
      active = false
      if (timeout) window.clearTimeout(timeout)
    }
  }, [bookingId, bookingIdsKey, membershipId, navigate, t])

  /* ---------- Handler ---------- */
  const handleCreditCardPayment = () => {
    if (!booking) return
    navigate(`/credit-card-payment?bookingId=${encodeURIComponent(booking.id)}`, {
      state: { bookingId: booking.id },
    })
  }

  const handleChangePaymentMethod = async () => {
    if (!booking || !canChangePaymentMethod || isChangingPaymentMethod) return

    const confirmed = window.confirm(
      t('paymentStatus.confirmChange'),
    )
    if (!confirmed) return

    setIsChangingPaymentMethod(true)
    setErrorMessage('')
    try {
      await cancelBooking(booking.id, t('paymentStatus.changeReason'))
      const bookingDate = booking.bookingDate.slice(0, 10)
      const displayDate = new Intl.DateTimeFormat(i18n.language, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${bookingDate}T12:00:00`))

      navigate('/payment', {
        replace: true,
        state: {
          resourceId: booking.resource.id,
          sportType: booking.sportType,
          bookingDate,
          facility: { id: booking.resource.id, name: booking.resource.name },
          date: displayDate,
          time: booking.startTime,
          endTime: booking.endTime,
          durationMinutes: booking.durationMinutes,
          total: booking.pricing.totalPrice,
          price: {
            basePrice: booking.pricing.basePrice,
            discountAmount: booking.pricing.discountAmount,
            adminFee: booking.pricing.adminFee,
            totalPrice: booking.pricing.totalPrice,
          },
        },
      })
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('paymentStatus.changeFailed')))
    } finally {
      setIsChangingPaymentMethod(false)
    }
  }

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
    if (!bookingId && !membershipId) return
    setIsChecking(true)
    try {
      if (membershipId) {
        const detail = await getMembershipDetail(membershipId)
        const payment = detail.payments[0]
        setErrorMessage('')
        if (['paid', 'settlement', 'capture'].includes(payment?.status ?? '')) {
          navigate(`/success-order?membershipId=${encodeURIComponent(detail.id)}`, {
            replace: true,
            state: { membershipId: detail.id },
          })
        } else if (['cancelled', 'expired', 'refunded', 'deny', 'failure', 'failed'].includes(payment?.status ?? '') || detail.status === 'cancelled') {
          navigate(`/failed-order?membershipId=${encodeURIComponent(detail.id)}`, {
            replace: true,
            state: { membershipId: detail.id },
          })
        }
        return
      }
      const latestBookings = await Promise.all(bookingIdsKey.split('|').filter(Boolean).map((id) => getBookingDetails(id)))
      const latest = latestBookings[0]
      if (!latest) return
      setBooking(latest)
      setErrorMessage('')
      if (['cancelled', 'expired', 'refunded'].includes(latest.status)) {
        navigate(`/failed-order?bookingId=${encodeURIComponent(bookingId)}`, {
          replace: true,
          state: { bookingId },
        })
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, t('paymentStatus.statusLoadFailed')))
    } finally {
      setIsChecking(false)
    }
  }

  if (isPaid) {
    return (
      <div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
        <main className="mx-auto flex w-full max-w-[620px] flex-1 flex-col justify-center px-4 py-10">
          <section className="rounded-xl border border-[#DCE8D6] bg-[#F7FAF5] p-6 text-center md:p-10">
            <CheckCircle2 size={58} strokeWidth={1.8} className="mx-auto text-[#39712F]" aria-hidden="true" />
            <p className="mt-4 inline-flex rounded-full bg-[#E6F0E0] px-3 py-1.5 font-heading text-xs font-bold text-[#265021]">
              {t('paymentStatus.paid')}
            </p>
            <h1 className={`${FONT_MONTSERRAT} mt-3 text-2xl font-bold text-[#252920]`}>
              {t('paymentStatus.paidTitle')}
            </h1>
            <p className="mt-2 text-sm text-[#686D60]">
              {t('paymentStatus.paidDescription')}
            </p>
            <div className="mt-6 border-t border-[#DCE8D6] pt-5 text-left">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#686D60]">{t('paymentStatus.totalPaid')}</span>
                <strong>{formatRupiah(total)}</strong>
              </div>
              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-[#686D60]">{t('paymentStatus.transactionId')}</span>
                <strong className="break-all text-right">{transactionId}</strong>
              </div>
              {booking?.paidAt && (
                <div className="mt-3 flex justify-between gap-4 text-sm">
                  <span className="text-[#686D60]">{t('paymentStatus.paymentTime')}</span>
                  <strong className="text-right">{new Date(booking.paidAt).toLocaleString(i18n.language)}</strong>
                </div>
              )}
            </div>
          </section>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="mt-5 min-h-11 rounded-lg bg-[#354B24] px-5 font-heading text-sm font-bold text-white hover:bg-[#26391A]"
          >
            {t('paymentStatus.openHistory')}
          </button>
        </main>
      </div>
    )
  }

  return (
    <>
      {/* ===================================================================
          TAMPILAN MOBILE (< md): tanpa navbar & footer, sesuai desain
          =================================================================== */}
      {isMobile && <div className="fixed inset-x-0 bottom-0 top-0 flex min-h-0 flex-col overflow-hidden bg-white font-body text-[#343133]">
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
                {statusText}
              </span>
            </div>
            {paymentChannel !== 'credit_card' && (
              <button
                type="button"
                onClick={() => redirectUrl && window.location.assign(redirectUrl)}
                disabled={!redirectUrl}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#404F14] bg-white px-3 py-1.5 font-heading text-[11px] font-bold text-[#404F14] cursor-pointer active:bg-[#F5FAF3]"
              >
                {paymentChannel === 'ovo' ? t('paymentStatus.continueOvo') : t('paymentStatus.openMidtrans')}
              </button>
            )}
          </section>

          {/* Total nominal transfer */}
          <section className="mt-3 rounded-xl border border-[#D4D4D4] bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
                            <span className="font-heading text-xs text-[#6F6B6E]">{t('paymentStatus.totalPayment')}</span>
              <span className={`${FONT_MONTSERRAT} text-lg font-bold text-[#121212]`}>
                {formatRupiah(total)}
              </span>
            </div>
            <p className="mt-1 text-right font-heading text-[9px] leading-3 text-[#6F6B6E]">
              {t('paymentStatus.autoUpdate')}
            </p>
          </section>

          {canPayByCreditCard && booking && (
            <button
              type="button"
              onClick={handleCreditCardPayment}
              className="mt-3 h-11 w-full rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14]"
            >
              {t('paymentStatus.enterCard')}
            </button>
          )}
          {canChangePaymentMethod && (
            <button
              type="button"
              onClick={() => { void handleChangePaymentMethod() }}
              disabled={isChangingPaymentMethod}
              className="mt-3 h-10 w-full rounded-lg border border-[#404F14] bg-white font-heading text-xs font-bold text-[#404F14] disabled:opacity-60"
            >
              {isChangingPaymentMethod ? t('paymentStatus.cancelingOrder') : t('paymentStatus.changeMethod')}
            </button>
          )}

          {/* Petunjuk scan */}
          {bookingIds.length > 1 && (
            <p className="mt-3 font-heading text-[11px] font-bold text-[#404F14]">
              {t('paymentStatus.ordersShown', { count: bookingIds.length })}
            </p>
          )}
          <h2 className="mt-3 font-heading text-xs font-bold text-[#121212]">{t('paymentStatus.paymentStatus')}</h2>
          {errorMessage && <p role="alert" className="mt-1 text-xs text-red-700">{errorMessage}</p>}
          <p className="mt-1 font-heading text-[11px] leading-4 text-[#6F6B6E]">
            {isChecking ? t('paymentStatus.checking') : t('paymentStatus.autoRedirect')}
          </p>
        </div>
          </ScrollReveal>

        {/* Tombol cek status (fixed di bawah) */}
        <div className="shrink-0 border-t border-[#D4D4D4] bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking}
            className="h-10 w-full rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] cursor-pointer"
          >
            {isChecking ? t('paymentStatus.checking') : t('paymentStatus.checkPayment')}
          </button>
        </div>
      </div>}

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      {!isMobile && <div className="min-h-screen flex flex-col bg-white font-body text-[#343133]">
        <main className="mx-auto w-full max-w-[1248px] flex-1 px-6 pb-16 pt-6">
          <ScrollReveal className="w-full">
          <div className="text-center">
            <h1 className={`${FONT_MONTSERRAT} text-[26px] font-bold leading-9 text-[#343133]`}>
              {t('paymentStatus.paymentStatus')}
            </h1>
            {bookingIds.length > 1 && (
              <p className="mt-1 font-heading text-xs font-bold text-[#404F14]">
                {t('paymentStatus.ordersShown', { count: bookingIds.length })}
              </p>
            )}
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
                  {statusText}
                </p>
              </div>
              {paymentChannel !== 'credit_card' && (
                <button
                  type="button"
                  onClick={() => redirectUrl && window.location.assign(redirectUrl)}
                  disabled={!redirectUrl}
                  className="mt-4 cursor-pointer font-heading text-xs font-bold text-[#265021] underline underline-offset-2 disabled:opacity-50"
                >
                  {paymentChannel === 'ovo' ? t('paymentStatus.continueOvo') : t('paymentStatus.changeMethod')}
                </button>
              )}
              <p className="mt-2 text-center font-heading text-[10px] text-[#6F6B6E]">
                {t('paymentStatus.processedBy')}
              </p>
            </div>

            {/* Kanan: detail */}
            <div className="min-w-0 flex-1">
              <p className="font-heading text-xs text-[#343133]">{t('paymentStatus.totalPayment')}</p>
              <p className={`${FONT_MONTSERRAT} text-[28px] font-bold leading-9 text-[#404F14]`}>
                {formatRupiah(total)}
              </p>

              <p className="mt-4 font-heading text-xs text-[#343133]">{t('paymentStatus.transactionId')}</p>
              <div className="mt-1 flex h-[38px] items-center justify-between rounded-md border border-[#D4D4D4] bg-[#FDFCF7] px-2.5">
                <span className="font-heading text-[13px] font-bold text-[#121212]">
                  {transactionId}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="cursor-pointer font-heading text-xs font-bold text-[#265021] hover:text-[#404F14]"
                >
                  {copied ? t('paymentStatus.copied') : t('paymentStatus.copy')}
                </button>
              </div>

              {canPayByCreditCard && booking && (
                <button
                  type="button"
                  onClick={handleCreditCardPayment}
                  className="mt-4 h-11 w-full rounded-lg bg-[#CDF178] font-heading text-sm font-bold text-[#404F14]"
                >
                  {t('paymentStatus.enterCard')}
                </button>
              )}
              {canChangePaymentMethod && (
                <button
                  type="button"
                  onClick={() => { void handleChangePaymentMethod() }}
                  disabled={isChangingPaymentMethod}
                  className="mt-4 h-10 w-full rounded-lg border border-[#404F14] bg-white font-heading text-xs font-bold text-[#404F14] disabled:opacity-60"
                >
                  {isChangingPaymentMethod ? t('paymentStatus.cancelingOrder') : t('paymentStatus.changeMethod')}
                </button>
              )}

              <h2 className="mt-4 font-heading text-xs font-bold text-[#121212]">{t('paymentStatus.transactionStatus')}</h2>
              <p className="mt-1.5 font-heading text-[11px] leading-[14px] text-[#343133]">
                {errorMessage || (isChecking ? t('paymentStatus.checking') : t('paymentStatus.updatedAutomatically'))}
              </p>
            </div>
          </section>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking}
            className="mx-auto mt-6 block h-10 w-full max-w-[320px] cursor-pointer rounded-lg bg-[#CDF178] font-heading text-xs text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
          >
            {isChecking ? t('paymentStatus.checking') : t('paymentStatus.checkPayment')}
          </button>
          </ScrollReveal>
        </main>

      </div>}
    </>
  )
}

export default InformationOrder