import { useTranslation } from 'react-i18next'
import type { PaymentChannel } from '../../services/bookingService'

interface PaymentMethodSelectorProps {
  value: PaymentChannel | null
  onChange: (channel: PaymentChannel) => void
  ariaLabel: string
}

const PAYMENT_GROUPS: { id: string; methods: { id: PaymentChannel; badge: string }[] }[] = [
  {
    id: 'ewallet',
    methods: [
      { id: 'qris', badge: 'QRIS' },
      { id: 'gopay', badge: 'GOPAY' },
      { id: 'shopeepay', badge: 'SPAY' },
      { id: 'ovo', badge: 'OVO' },
      { id: 'dana', badge: 'DANA' },
    ],
  },
  { id: 'card', methods: [{ id: 'credit_card', badge: 'CARD' }] },
  {
    id: 'bank',
    methods: [
      { id: 'bca_va', badge: 'BCA VA' },
      { id: 'bni_va', badge: 'BNI VA' },
      { id: 'bri_va', badge: 'BRI VA' },
      { id: 'mandiri_va', badge: 'MANDIRI' },
      { id: 'permata_va', badge: 'PERMATA' },
    ],
  },
  {
    id: 'retail',
    methods: [
      { id: 'alfamart', badge: 'ALFA' },
      { id: 'indomaret', badge: 'INDO' },
    ],
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
              const active = value === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange(method.id)}
                  className={`flex min-h-[112px] min-w-0 flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors md:min-h-[76px] md:flex-row md:items-center md:rounded-lg md:gap-3 md:px-3 md:py-2 ${active ? 'border-[#404F14] bg-[#F5FAF0] shadow-[0_0_0_1px_#404F14]' : 'border-[#D4D4D4] bg-white hover:border-[#9AAD3E]'}`}
                >
                  <span className="flex w-full items-center justify-between gap-2 md:w-auto md:shrink-0">
                    <span className={`flex h-5 min-w-10 items-center justify-center rounded px-1 text-[9px] font-heading font-bold md:w-14 md:px-0 md:text-[10px] ${active ? 'bg-[#E6F0E0] text-[#404F14]' : 'bg-[#F0F0F0] text-[#6F6B6E]'}`}>
                      {method.badge}
                    </span>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full md:hidden ${active ? 'border-2 border-[#404F14]' : 'border border-[#D4D4D4]'}`} aria-hidden="true">
                      {active && <span className="h-2 w-2 rounded-full bg-[#404F14]" />}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block w-full break-words font-heading text-xs font-semibold leading-tight text-[#343133] md:text-[13px] md:leading-[18px]">
                      {t(`payment.methods.${method.id}.name`)}
                    </span>
                    <span className="mt-1 block w-full break-words text-[10px] leading-snug text-[#6F6B6E] md:mt-0 md:font-heading md:leading-[14px]">
                      {t(`payment.methods.${method.id}.description`)}
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