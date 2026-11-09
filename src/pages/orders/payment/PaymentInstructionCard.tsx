import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { DirectPaymentInfo } from '../../../services/paymentService'
import { useTranslation } from 'react-i18next'

export interface PaymentBookingItem {
  id: string
  facilityName: string
  bookingDate: string
  startTime: string
  endTime: string
}

interface PaymentInstructionCardProps {
  info: DirectPaymentInfo
  totalLabel: string
  bookings?: PaymentBookingItem[]
  onCheckStatus: () => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const CHANNEL_LABEL: Record<DirectPaymentInfo['channel'], string> = {
  qris: 'QRIS',
  gopay: 'GoPay',
  shopeepay: 'ShopeePay',
  bca_va: 'BCA Virtual Account',
  bni_va: 'BNI Virtual Account',
  bri_va: 'BRI Virtual Account',
  mandiri_va: 'Mandiri Virtual Account',
  permata_va: 'Permata Virtual Account',
  alfamart: 'Alfamart',
  indomaret: 'Indomaret',
}

// Sisa waktu pembayaran (format JJ:MM:DD)
function useCountdown(expiryTime?: string) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!expiryTime) return
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(expiryTime)
    const target = Date.parse(hasTimezone ? expiryTime : `${expiryTime.replace(' ', 'T')}+07:00`)
    const tick = () => setRemaining(Math.max(target - Date.now(), 0))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [expiryTime])

  if (remaining === null) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  const totalSeconds = Math.floor(remaining / 1000)
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard tidak tersedia, abaikan */
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#D4D4D4] px-3 py-2">
      <div className="min-w-0">
        <p className="font-heading text-[10px] text-[#6F6B6E]">{label}</p>
        <p className={`${FONT_MONTSERRAT} break-all text-base font-bold text-[#121212]`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-8 shrink-0 items-center gap-1 rounded-md bg-[#E6F0E0] px-2 font-heading text-xs font-bold text-[#404F14] cursor-pointer"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? t('payment.instructions.copied') : t('payment.instructions.copy')}
      </button>
    </div>
  )
}

function PaymentInstructionCard({ info, totalLabel, bookings = [], onCheckStatus }: PaymentInstructionCardProps) {
  const { t } = useTranslation()
  const countdown = useCountdown(info.expiryTime)
  const paymentSteps = info.qrUrl
    ? t('payment.instructions.payQr')
    : info.vaNumber
      ? t('payment.instructions.payVirtualAccount', { bank: info.bankName ?? '' })
      : info.billKey
        ? t('payment.instructions.payBillKey')
        : info.paymentCode
          ? t('payment.instructions.payAtStore', { store: info.storeName ?? CHANNEL_LABEL[info.channel] })
          : info.deeplinkUrl
            ? t('payment.instructions.payWithApp', { name: CHANNEL_LABEL[info.channel] })
            : t('payment.instructions.payGeneric')

  return (
    <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
      <h1 className={`${FONT_MONTSERRAT} text-lg font-bold text-[#343133]`}>
        {t('payment.instructions.title')}
      </h1>
      <p className="mt-0.5 font-heading text-xs text-[#6F6B6E]">
        {CHANNEL_LABEL[info.channel]}
      </p>
      <p className="mt-3 rounded-lg border border-[#E5E5E5] bg-[#FDFCF7] px-3 py-2 font-heading text-xs leading-5 text-[#343133]">
        {paymentSteps}
      </p>
      {bookings.length > 0 && (
        <section className="mt-3 rounded-lg border border-[#D4D4D4] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5E5E5] px-3 py-2">
            <h2 className="font-heading text-xs font-bold text-[#121212]">{t('payment.instructions.bookingDetails')}</h2>
            {bookings.length > 1 && (
              <span className="rounded-full bg-[#E6F0E0] px-2 py-1 text-[10px] font-bold text-[#404F14]">
                {t('payment.instructions.orderCount', { count: bookings.length })}
              </span>
            )}
          </div>
          <div className="max-h-36 space-y-2 overflow-y-auto p-3">
            {bookings.map((booking, index) => (
              <div key={booking.id} className="rounded-lg bg-[#FDFCF7] px-3 py-2">
                <p className="font-heading text-[11px] font-bold text-[#121212]">
                  {bookings.length > 1 ? `${index + 1}. ` : ''}{booking.facilityName}
                </p>
                <div className="mt-1 flex items-center justify-between gap-3 font-heading text-[10px] text-[#6F6B6E]">
                  <span>{booking.bookingDate}</span>
                  <span className="shrink-0 font-bold text-[#404F14]">{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-[#E6F0E0] px-3 py-2">
        <span className="font-heading text-xs text-[#404F14]">{t('payment.instructions.total')}</span>
        <span className={`${FONT_MONTSERRAT} text-lg font-bold text-[#404F14]`}>{totalLabel}</span>
      </div>

      {countdown && (
        <p className="mt-3 text-center font-heading text-xs text-[#C00000]">
          {t('payment.instructions.payBefore')} <span className="font-bold">{countdown}</span>
        </p>
      )}

      <div className="mt-4 space-y-3">
        {/* QRIS / GoPay: tampilkan kode QR */}
        {info.qrUrl && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={info.qrUrl}
              alt={t('payment.instructions.qrAlt')}
              className="h-56 w-56 rounded-lg border border-[#D4D4D4] object-contain"
            />
            <p className="font-heading text-xs text-[#6F6B6E]">
              {t('payment.instructions.scanQr')}
            </p>
          </div>
        )}

        {/* E-wallet: buka aplikasi (khusus HP) */}
        {info.deeplinkUrl && (
          <a
            href={info.deeplinkUrl}
            className="flex h-10 w-full items-center justify-center rounded-lg border-2 border-[#404F14] font-heading text-xs font-bold text-[#404F14]"
          >
            {t('payment.instructions.openApp', { name: CHANNEL_LABEL[info.channel] })}
          </a>
        )}

        {/* Virtual Account */}
        {info.vaNumber && <CopyRow label={t('payment.instructions.virtualAccount', { bank: info.bankName ?? '' })} value={info.vaNumber} />}

        {/* Mandiri (echannel) */}
        {info.billerCode && <CopyRow label={t('payment.instructions.billerCode')} value={info.billerCode} />}
        {info.billKey && <CopyRow label={t('payment.instructions.billKey')} value={info.billKey} />}

        {/* Alfamart / Indomaret */}
        {info.paymentCode && <CopyRow label={t('payment.instructions.storeCode', { store: info.storeName ?? '' })} value={info.paymentCode} />}
      </div>

      <button
        type="button"
        onClick={onCheckStatus}
        className="mt-5 h-10 w-full rounded-lg bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] cursor-pointer"
      >
        {t('payment.instructions.checkStatus')}
      </button>
    </section>
  )
}

export default PaymentInstructionCard