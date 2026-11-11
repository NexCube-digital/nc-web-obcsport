import { useEffect, useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ScrollReveal from '../../../components/animation/ScrollReveal'
import type { BookingDetails } from '../../../services/bookingService'

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

export const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export const isPaidBooking = (booking: BookingDetails | null) => {
  const bookingStatus = booking?.status.toLowerCase()
  const paymentStatus = booking?.payments[0]?.status.toLowerCase()
  return ['fully_paid', 'completed', 'paid'].includes(bookingStatus ?? '')
    || ['paid', 'settlement', 'capture'].includes(paymentStatus ?? '')
}

export function deriveOrderPaymentValues(booking: BookingDetails | null, bookingId: string) {
  const payment = booking?.payments[0]
  const isPaid = isPaidBooking(booking)
  const canChangePaymentMethod = booking?.status === 'unpaid' && !isPaid
  const paymentChannel = payment?.paymentDetails?.obc_payment_channel
  const canPayByCreditCard = Boolean(
    booking?.status === 'unpaid'
    && paymentChannel === 'credit_card'
    && ['pending', 'failed'].includes(payment?.status ?? ''),
  )

  return {
    isPaid,
    canChangePaymentMethod,
    paymentChannel,
    canPayByCreditCard,
    total: payment?.amount ?? booking?.pricing.totalPrice ?? 0,
    transactionId: payment?.midtransOrderId ?? booking?.id ?? bookingId,
    expiresAt: payment?.expiredAt ?? booking?.lockedUntil ?? undefined,
    redirectUrl: payment?.redirectUrl,
  }
}

export function PaymentCountdown({ expiresAt }: { expiresAt?: string }) {
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
        <span className="font-bold">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
      </span>
      <span className="hidden md:inline">
        {t('paymentStatus.deadline')} {minutes} {t('paymentStatus.minutes')} {String(seconds).padStart(2, '0')} {t('paymentStatus.seconds')}
      </span>
    </>
  )
}

type PaidOrderViewProps = {
  total: number
  transactionId: string
  paidAt?: string | null
  locale: string
  onOpenHistory: () => void
}

export function PaidOrderView({ total, transactionId, paidAt, locale, onOpenHistory }: PaidOrderViewProps) {
  const { t } = useTranslation()

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
          <p className="mt-2 text-sm text-[#686D60]">{t('paymentStatus.paidDescription')}</p>
          <div className="mt-6 border-t border-[#DCE8D6] pt-5 text-left">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#686D60]">{t('paymentStatus.totalPaid')}</span>
              <strong>{formatRupiah(total)}</strong>
            </div>
            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-[#686D60]">{t('paymentStatus.transactionId')}</span>
              <strong className="break-all text-right">{transactionId}</strong>
            </div>
            {paidAt && (
              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-[#686D60]">{t('paymentStatus.paymentTime')}</span>
                <strong className="text-right">{new Date(paidAt).toLocaleString(locale)}</strong>
              </div>
            )}
          </div>
        </section>
        <button
          type="button"
          onClick={onOpenHistory}
          className="mt-5 min-h-11 rounded-lg bg-[#354B24] px-5 font-heading text-sm font-bold text-white hover:bg-[#26391A]"
        >
          {t('paymentStatus.openHistory')}
        </button>
      </main>
    </div>
  )
}

type MobileOrderStatusViewProps = {
  expiresAt?: string
  statusText: string
  paymentChannel?: string
  redirectUrl?: string | null
  total: number
  canPayByCreditCard: boolean
  canChangePaymentMethod: boolean
  isChangingPaymentMethod: boolean
  bookingCount: number
  errorMessage: string
  isChecking: boolean
  onContinuePayment: () => void
  onCreditCardPayment: () => void
  onChangePaymentMethod: () => void
  onRefresh: () => void
}

export function MobileOrderStatusView({
  expiresAt,
  statusText,
  paymentChannel,
  redirectUrl,
  total,
  canPayByCreditCard,
  canChangePaymentMethod,
  isChangingPaymentMethod,
  bookingCount,
  errorMessage,
  isChecking,
  onContinuePayment,
  onCreditCardPayment,
  onChangePaymentMethod,
  onRefresh,
}: MobileOrderStatusViewProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 flex min-h-0 flex-col overflow-hidden bg-white font-body text-[#343133]">
      <div role="timer" className="flex items-center justify-center gap-2 bg-[#FDF2F2] px-3 py-2 font-heading text-xs text-[#E02424]">
        <Clock size={16} aria-hidden="true" />
        <PaymentCountdown expiresAt={expiresAt} />
      </div>
      <ScrollReveal className="min-h-0 flex-1 overflow-y-auto">
        <div className="min-h-0 px-3 pt-3">
          <section className="flex flex-col items-center rounded-2xl border border-[#D4D4D4] bg-white px-3 pb-3 pt-4">
            <div className="flex h-[140px] w-[140px] flex-col items-center justify-center rounded-xl bg-[#F1F4EA] text-center">
              <Clock size={28} className="text-[#404F14]" aria-hidden="true" />
              <span className="mt-2 font-heading text-xs font-bold text-[#404F14]">{statusText}</span>
            </div>
            {paymentChannel !== 'credit_card' && (
              <button
                type="button"
                onClick={onContinuePayment}
                disabled={!redirectUrl}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#404F14] bg-white px-3 py-1.5 font-heading text-[11px] font-bold text-[#404F14] cursor-pointer active:bg-[#F5FAF3]"
              >
                {paymentChannel === 'ovo' ? t('paymentStatus.continueOvo') : t('paymentStatus.openMidtrans')}
              </button>
            )}
          </section>
          <section className="mt-3 rounded-xl border border-[#D4D4D4] bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-heading text-xs text-[#6F6B6E]">{t('paymentStatus.totalPayment')}</span>
              <span className={`${FONT_MONTSERRAT} text-lg font-bold text-[#121212]`}>{formatRupiah(total)}</span>
            </div>
            <p className="mt-1 text-right font-heading text-[9px] leading-3 text-[#6F6B6E]">{t('paymentStatus.autoUpdate')}</p>
          </section>
          {canPayByCreditCard && (
            <button type="button" onClick={onCreditCardPayment} className="mt-3 h-11 w-full rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14]">
              {t('paymentStatus.enterCard')}
            </button>
          )}
          {canChangePaymentMethod && (
            <button
              type="button"
              onClick={onChangePaymentMethod}
              disabled={isChangingPaymentMethod}
              className="mt-3 h-10 w-full rounded-lg border border-[#404F14] bg-white font-heading text-xs font-bold text-[#404F14] disabled:opacity-60"
            >
              {isChangingPaymentMethod ? t('paymentStatus.cancelingOrder') : t('paymentStatus.changeMethod')}
            </button>
          )}
          {bookingCount > 1 && (
            <p className="mt-3 font-heading text-[11px] font-bold text-[#404F14]">
              {t('paymentStatus.ordersShown', { count: bookingCount })}
            </p>
          )}
          <h2 className="mt-3 font-heading text-xs font-bold text-[#121212]">{t('paymentStatus.paymentStatus')}</h2>
          {errorMessage && <p role="alert" className="mt-1 text-xs text-red-700">{errorMessage}</p>}
          <p className="mt-1 font-heading text-[11px] leading-4 text-[#6F6B6E]">
            {isChecking ? t('paymentStatus.checking') : t('paymentStatus.autoRedirect')}
          </p>
        </div>
      </ScrollReveal>
      <div className="shrink-0 border-t border-[#D4D4D4] bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isChecking}
          className="h-10 w-full rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] cursor-pointer"
        >
          {isChecking ? t('paymentStatus.checking') : t('paymentStatus.checkPayment')}
        </button>
      </div>
    </div>
  )
}
