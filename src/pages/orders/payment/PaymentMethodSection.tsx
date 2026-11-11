import { useTranslation } from 'react-i18next'
import PaymentMethodSelector from '../../../components/ui/PaymentMethodSelector'
import type { SelectedPaymentChannel } from '../../../utils/orders/paymentTypes'
import { FONT_MONTSERRAT } from '../../../utils/orders/paymentUtils'

type PaymentMethodSectionProps = {
  variant: 'mobile' | 'desktop'
  value: SelectedPaymentChannel
  onChange: (channel: NonNullable<SelectedPaymentChannel>) => void
}

function PaymentMethodSection({ variant, value, onChange }: PaymentMethodSectionProps) {
  const { t } = useTranslation()
  const isMobile = variant === 'mobile'

  return (
    <div className={isMobile ? 'mt-6' : ''}>
      <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
        {t('payment.choosePaymentMethod')}
      </h2>

      <div className={isMobile ? 'mt-2' : 'mt-4'}>
        <PaymentMethodSelector value={value} onChange={onChange} ariaLabel={t('payment.methodLabel')} />
      </div>

      <div className="mt-4 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-2 py-2">
        <p className="font-heading text-[10px] leading-4 text-[#C00000]">
          <span aria-hidden="true">⚠️</span> {t('payment.cashlessNotice')}
        </p>
      </div>
    </div>
  )
}

export default PaymentMethodSection