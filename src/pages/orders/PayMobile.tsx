import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredSection from '../../components/layout/DeferredSection'
import ScrollReveal from '../../components/animation/ScrollReveal'
import type { SelectedPaymentChannel, PaymentDisplayData } from '../../utils/orders/paymentTypes'
import { FONT_MONTSERRAT, formatRupiah } from '../../utils/orders/paymentUtils'
import PaymentMethodSection from './payment/PaymentMethodSection'

type PaymentMobileViewProps = {
  data: PaymentDisplayData
  selectedChannel: SelectedPaymentChannel
  onChannelChange: (channel: NonNullable<SelectedPaymentChannel>) => void
  isSubmitting: boolean
  onPay: () => void
}

function PaymentMobileView({ data, selectedChannel, onChannelChange, isSubmitting, onPay }: PaymentMobileViewProps) {
  const { t } = useTranslation()

  return (
    <>
      <MobileHeader variant="title" title={t('payment.confirmTitle')} showShare showBottomNav={false} />
      <div className="min-h-[100dvh] bg-white font-body text-[#343133] pb-28">
        <div className="px-4 pt-4">
          <ScrollReveal>
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0E0] text-[#404F14]">
                  <CalendarDays size={18} />
                </span>
                <div className="min-w-0 font-heading">
                  <h2 className={`${FONT_MONTSERRAT} font-bold text-base leading-snug text-[#343133]`}>
                    {data.facilityName}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#6F6B6E]">{data.facilityLocation}</p>
                  <p className="mt-0.5 text-xs text-[#6F6B6E]">{data.date}</p>
                  <p className="mt-0.5 text-xs text-[#6F6B6E]">{data.startTime} - {data.endTime}</p>
                  {data.isCartCheckout && (
                    <div className="mt-2 space-y-1 border-t border-[#E5E5E5] pt-2">
                      <p className="text-[11px] font-semibold text-[#404F14]">
                        {t('payment.cartCount', { count: data.cartItems.length })}
                      </p>
                      {data.cartItems.map((item) => (
                        <p key={item.id} className="text-[11px] leading-4 text-[#6F6B6E]">
                          {item.facilityName} · {item.startTime}-{item.endTime}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <hr className="my-3 border-[#D4D4D4]" />
              <dl className="space-y-2 font-heading text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">{t('payment.courtRental')}</dt>
                  <dd className="text-[#343133]">{formatRupiah(data.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">{t('payment.adminFee')}</dt>
                  <dd className="text-[#343133]">{formatRupiah(data.serviceFee)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">{t('payment.extraRental')}</dt>
                  <dd className="text-[#343133]">{formatRupiah(data.extrasTotal)}</dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-[#121212]">{t('payment.totalPayment')}</span>
                <span className={`${FONT_MONTSERRAT} font-bold text-lg text-[#404F14]`}>
                  {formatRupiah(data.mobileTotal)}
                </span>
              </div>
            </section>
          </ScrollReveal>

          <DeferredSection placeholderClassName="mt-6 min-h-[360px]">
            <PaymentMethodSection variant="mobile" value={selectedChannel} onChange={onChannelChange} />
          </DeferredSection>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D4D4D4] bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onPay}
            disabled={isSubmitting || !selectedChannel}
            className="h-12 w-full rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t('payment.processingBooking') : selectedChannel ? t('payment.payNow') : t('payment.chooseMethod')}
          </button>
        </div>
      </div>
    </>
  )
}

export default PaymentMobileView