import { useTranslation } from 'react-i18next'
import { ChevronDown, CircleCheck } from 'lucide-react'
import ScrollReveal from '../../../components/animation/ScrollReveal'

type SuccessDisplayData = {
  transactionNumber: string
  paidAt: string
  method: string
  facility: string
  schedule: string
  duration: string
  subtotal: number
  serviceFee: number
  promoLabel: string
  promo: number
  bookingCode: string
}

type SuccessMobileViewProps = {
  data: SuccessDisplayData
  total: number
  bookingCount: number
  isReviewPending: boolean
  isPaymentDetailsOpen: boolean
  onWriteReview: () => void
  onTogglePaymentDetails: () => void
  onDownloadTicket: () => void
  onBackHome: () => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"
const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function SuccessMobileView({
  data,
  total,
  bookingCount,
  isReviewPending,
  isPaymentDetailsOpen,
  onWriteReview,
  onTogglePaymentDetails,
  onDownloadTicket,
  onBackHome,
}: SuccessMobileViewProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 flex min-h-0 flex-col overflow-hidden bg-white font-body text-[#343133]">
      <ScrollReveal className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-3">
        <div
          role="img"
          aria-label={t('paymentResult.paymentSuccess')}
          className="grid h-20 w-full place-items-center text-[#265021]"
        >
          <CircleCheck size={58} strokeWidth={1.8} aria-hidden="true" className="success-icon-pop" />
        </div>

        <div className="mt-3 text-center">
          <span className="inline-block rounded-full bg-[#E6F0E0] px-3 py-1.5 font-heading text-[10px] font-bold leading-none text-[#265021]">
            {t('paymentResult.approved')}
          </span>
          <h1 className={`${FONT_MONTSERRAT} mt-2 text-lg font-bold leading-6 text-[#343133]`}>
            {t('paymentResult.successTitle')}
          </h1>
          {bookingCount > 1 && (
            <p className="mt-1 font-heading text-[11px] font-bold text-[#265021]">
              {t('paymentResult.bookingCount', { count: bookingCount })}
            </p>
          )}
          <p className="mt-1.5 font-heading text-[11px] leading-4 text-[#343133]">
            {t('paymentResult.successDescription')}
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-[#E5E5E5] bg-white p-2.5 text-center">
          <p className="font-heading text-[11px] uppercase leading-4 text-[#343133]">
            {t('paymentResult.bookingCode')}
          </p>
          <p className={`${FONT_MONTSERRAT} text-[22px] font-bold leading-8 text-[#404F14]`}>
            {data.bookingCode}
          </p>
          <p className="font-heading text-[11px] leading-4 text-[#265021]">
            {t('paymentResult.showQr')}
          </p>
        </div>

        {isReviewPending && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#D4D4D4] bg-[#FDFCF7] p-4">
            <p className="text-sm font-heading font-semibold text-[#343133]">{t('paymentResult.reviewPending')}</p>
            <button
              type="button"
              onClick={onWriteReview}
              className="shrink-0 font-heading text-sm font-bold text-[#404F14] underline underline-offset-2"
            >
              {t('paymentResult.writeReview')}
            </button>
          </div>
        )}

        <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className={`${FONT_MONTSERRAT} text-sm font-semibold leading-5 text-[#343133]`}>
              {t('paymentResult.paymentDetails')}
            </h2>
            <button
              type="button"
              onClick={onTogglePaymentDetails}
              aria-expanded={isPaymentDetailsOpen}
              className="flex shrink-0 cursor-pointer items-center gap-1 font-heading text-[11px] font-bold text-[#404F14]"
            >
              {isPaymentDetailsOpen ? t('paymentResult.collapse') : t('paymentResult.expand')}
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`transition-transform ${isPaymentDetailsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {isPaymentDetailsOpen && (
            <>
              <dl className="mt-3 space-y-2 font-heading text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.transactionNumber')}</dt>
                  <dd className="text-right font-bold text-[#121212]">{data.transactionNumber}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.paidAt')}</dt>
                  <dd className="text-right font-bold text-[#121212]">{data.paidAt}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.paymentMethod')}</dt>
                  <dd className="text-right font-bold text-[#404F14]">{data.method}</dd>
                </div>
              </dl>

              <hr className="my-2 border-[#D4D4D4]" />
              <dl className="space-y-2 font-heading text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-[#343133]">{t('paymentResult.facility')}</dt>
                  <dd className="text-right font-bold text-[#121212]">{data.facility}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="shrink-0 text-[#343133]">{t('paymentResult.schedule')}</dt>
                  <dd className="text-right font-bold text-[#121212]">{data.schedule}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.duration')}</dt>
                  <dd className="text-right font-bold text-[#121212]">{data.duration}</dd>
                </div>
              </dl>

              <hr className="my-2.5 border-[#D4D4D4]" />
              <dl className="space-y-2 font-heading text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.subtotal')}</dt>
                  <dd className="text-[#343133]">{formatRupiah(data.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.serviceFee')}</dt>
                  <dd className="text-[#343133]">{formatRupiah(data.serviceFee)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-bold text-[#265021]">{data.promoLabel}</dt>
                  <dd className="shrink-0 font-bold text-[#265021]">- {formatRupiah(data.promo)}</dd>
                </div>
              </dl>
            </>
          )}

          <hr className="my-2.5 border-[#D4D4D4]" />
          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-bold text-[#121212]">{t('paymentResult.amountPaid')}</span>
            <span className={`${FONT_MONTSERRAT} text-xl font-bold text-[#404F14]`}>
              {formatRupiah(total)}
            </span>
          </div>
        </section>

        <div className="shrink-0 space-y-2 border-t border-[#E5E5E5] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <button
            type="button"
            onClick={onDownloadTicket}
            className="h-10 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E]"
          >
            {t('paymentResult.downloadTicket')}
          </button>
          <button
            type="button"
            onClick={onBackHome}
            className="h-10 w-full cursor-pointer rounded-xl border border-[#404F14] bg-white font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#F5FAF3]"
          >
            {t('paymentResult.backHome')}
          </button>
        </div>
      </ScrollReveal>
    </div>
  )
}

export default SuccessMobileView
