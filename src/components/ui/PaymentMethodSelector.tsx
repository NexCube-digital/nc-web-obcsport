import { useTranslation } from 'react-i18next'
import type { PaymentChannel } from '../../services/bookingService'
import alfamartIcon from '../../assets/images/payment/alfamart.webp'
import bcaIcon from '../../assets/images/payment/bca.webp'
import bniIcon from '../../assets/images/payment/bni.webp'
import briIcon from '../../assets/images/payment/bri.webp'
import creditCardIcon from '../../assets/images/payment/creditcard.webp'
import danaIcon from '../../assets/images/payment/dana.webp'
import gopayIcon from '../../assets/images/payment/gopay.webp'
import indomaretIcon from '../../assets/images/payment/indomaret.webp'
import mandiriIcon from '../../assets/images/payment/mandiri.webp'
import ovoIcon from '../../assets/images/payment/ovo.webp'
import permataIcon from '../../assets/images/payment/permata.webp'
import qrisIcon from '../../assets/images/payment/qris.webp'
import shopeepayIcon from '../../assets/images/payment/shopepay.webp'

interface PaymentMethodSelectorProps {
  value: PaymentChannel | null
  onChange: (channel: PaymentChannel) => void
  ariaLabel: string
}

const PAYMENT_ICONS: Record<PaymentChannel, string> = {
  qris: qrisIcon,
  gopay: gopayIcon,
  shopeepay: shopeepayIcon,
  ovo: ovoIcon,
  dana: danaIcon,
  credit_card: creditCardIcon,
  bca_va: bcaIcon,
  bni_va: bniIcon,
  bri_va: briIcon,
  mandiri_va: mandiriIcon,
  permata_va: permataIcon,
  alfamart: alfamartIcon,
  indomaret: indomaretIcon,
}

const PAYMENT_GROUPS: { id: string; methods: PaymentChannel[] }[] = [
  {
    id: 'ewallet',
    methods: ['qris', 'gopay', 'shopeepay', 'ovo', 'dana'],
  },
  { id: 'card', methods: ['credit_card'] },
  {
    id: 'bank',
    methods: ['bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'permata_va'],
  },
  {
    id: 'retail',
    methods: ['alfamart', 'indomaret'],
  },
]

export default function PaymentMethodSelector({ value, onChange, ariaLabel }: PaymentMethodSelectorProps) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="space-y-4">
      {PAYMENT_GROUPS.map((group) => (
        <section key={group.id}>
          <h3 className="font-heading text-[11px] font-bold text-[#404F14]">{t(`payment.groups.${group.id}`)}</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {group.methods.map((method) => {
              const active = value === method
              return (
                <button
                  key={method}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange(method)}
                  className={`flex min-h-[112px] min-w-0 flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors md:min-h-[76px] md:flex-row md:items-center md:rounded-lg md:gap-3 md:px-3 md:py-2 ${active ? 'border-[#404F14] bg-[#F5FAF0] shadow-[0_0_0_1px_#404F14]' : 'border-[#D4D4D4] bg-white hover:border-[#9AAD3E]'}`}
                >
                  <span className="flex w-full items-center justify-between gap-2 md:w-auto md:shrink-0">
                    <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded bg-white p-1">
                      <img src={PAYMENT_ICONS[method]} alt="" aria-hidden="true" className="max-h-full max-w-full object-contain" />
                    </span>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full md:hidden ${active ? 'border-2 border-[#404F14]' : 'border border-[#D4D4D4]'}`} aria-hidden="true">
                      {active && <span className="h-2 w-2 rounded-full bg-[#404F14]" />}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block w-full break-words font-heading text-xs font-semibold leading-tight text-[#343133] md:text-[13px] md:leading-[18px]">
                      {t(`payment.methods.${method}.name`)}
                    </span>
                    <span className="mt-1 block w-full break-words text-[10px] leading-snug text-[#6F6B6E] md:mt-0 md:font-heading md:leading-[14px]">
                      {t(`payment.methods.${method}.description`)}
                    </span>
                  </span>
                  <span className={`hidden h-4 w-4 shrink-0 items-center justify-center rounded-full md:flex ${active ? 'bg-[#404F14]' : 'border border-[#D4D4D4] bg-white'}`} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}