import { useTranslation } from 'react-i18next'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
import ScrollReveal from '../../components/animation/ScrollReveal'
import type { SelectedPaymentChannel, PaymentDisplayData } from '../../utils/orders/paymentTypes'
import { FONT_MONTSERRAT, formatRupiah } from '../../utils/orders/paymentUtils'
import PaymentMethodSection from './payment/PaymentMethodSection'

type PaymentDesktopViewProps = {
  data: PaymentDisplayData
  selectedChannel: SelectedPaymentChannel
  onChannelChange: (channel: NonNullable<SelectedPaymentChannel>) => void
  isSubmitting: boolean
  onPay: () => void
}

function PaymentDesktopView({ data, selectedChannel, onChannelChange, isSubmitting, onPay }: PaymentDesktopViewProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard showDesktopNavigation={false} showMobileHeader={false} />

      <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
        <h1 className={`${FONT_MONTSERRAT} font-bold text-[26px] leading-9 text-[#343133]`}>
          {t('payment.confirmTitle')}
        </h1>
        <p className="mt-0.5 font-heading text-[13px] leading-5 text-[#343133]">
          {t('payment.confirmDescription')}
        </p>

        <ScrollReveal>
          <div className="mt-5 grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
              <PaymentMethodSection variant="desktop" value={selectedChannel} onChange={onChannelChange} />
            </section>

            <div>
              <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
                <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                  {t('payment.reservationDetails')}
                </h2>

                <dl className="mt-3 space-y-2 font-heading text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.facility')}</dt>
                    <dd className="font-bold text-[#121212]">{data.facilityName}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.date')}</dt>
                    <dd className="font-bold text-[#121212]">
                      {data.isCartCheckout ? t('payment.bookingPackages', { count: data.cartItems.length }) : data.date}
                    </dd>
                  </div>
                  {data.isCartCheckout && data.cartItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <dt className="max-w-[55%] text-[#6F6B6E]">{item.facilityName}</dt>
                      <dd className="text-right text-[11px] font-bold text-[#121212]">
                        {item.bookingDate}<br />{item.startTime}-{item.endTime}
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.time')}</dt>
                    <dd className="font-bold text-[#404F14]">
                      {data.startTime} - {data.endTime} ({t('booking.durationHours', { count: data.hours })})
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
                      {t(data.isSoccerBooking ? 'payment.courtRentalRateTwoHours' : 'payment.courtRentalRate', {
                        rate: data.displayedRate,
                        hours: data.isSoccerBooking ? data.billingBlocks : data.hours,
                      })}
                    </dt>
                    <dd className="text-[#343133]">{formatRupiah(data.subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#404F14]">{t('payment.promotion', { code: t('payment.promoCode') })}</dt>
                    <dd className="font-bold text-[#404F14]">-{formatRupiah(data.promo)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6F6B6E]">{t('payment.serviceFee')}</dt>
                    <dd className="text-[#343133]">{formatRupiah(data.serviceFee)}</dd>
                  </div>
                </dl>

                <hr className="my-3 border-[#D4D4D4]" />
                <div className="flex items-center justify-between pt-1">
                  <span className="font-heading font-bold text-[13px] text-[#121212]">{t('payment.totalPayment')}</span>
                  <span className={`${FONT_MONTSERRAT} font-bold text-xl text-[#404F14]`}>
                    {formatRupiah(data.total)}
                  </span>
                </div>
              </section>

              <button
                type="button"
                onClick={onPay}
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
    </div>
  )
}

export default PaymentDesktopView