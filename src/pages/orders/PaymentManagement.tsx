import { useTranslation } from 'react-i18next'
import { useIsMobile } from '../../hooks/useIsMobile'
import PendingOrderModal from '../../components/ui/PendingOrderModal'
import PaymentMobileView from './PayMobile'
import PaymentDesktopView from './PayDesktop'
import { usePaymentCheckout } from '../../utils/orders/usePaymentCheckout'

function PaymentPage() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const payment = usePaymentCheckout()

  if (payment.pendingOrderModal) {
    const pending = payment.pendingOrderModal
    return (
      <PendingOrderModal
        date={pending.date}
        time={pending.time}
        paymentMethod={pending.paymentMethod}
        amount={pending.amount}
        transactionId={pending.transactionId}
        paymentInfo={pending.paymentInfo}
        paymentUrl={pending.paymentUrl}
        bookings={pending.bookings}
        onReturnHome={() => {
          payment.clearPendingOrder()
          payment.returnHome()
        }}
        onOpenOrderStatus={payment.openOrderStatus}
        onContinuePayment={payment.continuePayment}
      />
    )
  }

  if (payment.isPendingBookingLoading || payment.isSubmitting) {
    return (
      <main className="grid h-[100dvh] w-screen place-items-center bg-[#F4F6F0]" role="status" aria-live="polite">
        <div className="text-center">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[#DCE5D3] border-t-[#354B24]" />
          <p className="mt-4 font-heading text-sm font-semibold text-[#354B24]">
            {t(payment.isPendingBookingLoading ? 'payment.loadingStatus' : 'payment.preparing')}
          </p>
        </div>
      </main>
    )
  }

  const viewProps = {
    data: payment.data,
    selectedChannel: payment.selectedChannel,
    onChannelChange: payment.setSelectedChannel,
    isSubmitting: payment.isSubmitting,
    onPay: payment.handlePay,
  }

  return isMobile
    ? <PaymentMobileView {...viewProps} />
    : <PaymentDesktopView {...viewProps} />
}

export default PaymentPage