import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import ScrollReveal from '../../../components/animation/ScrollReveal'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { cancelBooking, getBookingDetails, type BookingDetails } from '../../../services/bookingService'
import { getApiErrorMessage } from '../../../services/apiService'
import { getMembershipDetail } from '../../../services/membershipService'
import { useTranslation } from 'react-i18next'
import {
  deriveOrderPaymentValues,
  formatRupiah,
  isPaidBooking,
  MobileOrderStatusView,
  PaidOrderView,
  PaymentCountdown,
} from './InformationOrderParts'

/* Tipe data  */
interface InformationState {
  bookingId?: string
  membershipId?: string
  bookingIds?: string[]
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

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
  const {
    isPaid,
    canChangePaymentMethod,
    paymentChannel,
    canPayByCreditCard,
    total,
    transactionId,
    expiresAt,
    redirectUrl,
  } = deriveOrderPaymentValues(booking, bookingId)
  const statusText = t(`paymentStatus.statuses.${booking?.status}`, {
    defaultValue: booking?.status ?? t('paymentStatus.loadingStatus'),
  })

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
      <PaidOrderView
        total={total}
        transactionId={transactionId}
        paidAt={booking?.paidAt}
        locale={i18n.language}
        onOpenHistory={() => navigate('/history')}
      />
    )
  }

  return (
    <>
      {isMobile && (
        <MobileOrderStatusView
          expiresAt={expiresAt}
          statusText={statusText}
          paymentChannel={paymentChannel}
          redirectUrl={redirectUrl}
          total={total}
          canPayByCreditCard={canPayByCreditCard}
          canChangePaymentMethod={canChangePaymentMethod}
          isChangingPaymentMethod={isChangingPaymentMethod}
          bookingCount={bookingIds.length}
          errorMessage={errorMessage}
          isChecking={isChecking}
          onContinuePayment={() => {
            if (redirectUrl) window.location.assign(redirectUrl)
          }}
          onCreditCardPayment={handleCreditCardPayment}
          onChangePaymentMethod={() => { void handleChangePaymentMethod() }}
          onRefresh={handleRefresh}
        />
      )}

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