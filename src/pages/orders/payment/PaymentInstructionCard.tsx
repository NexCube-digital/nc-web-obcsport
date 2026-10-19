import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { DirectPaymentInfo } from '../../../services/paymentService'

interface PaymentInstructionCardProps {
  info: DirectPaymentInfo
  totalLabel: string
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
    // Midtrans mengirim waktu WIB tanpa zona: "2026-10-19 18:33:00"
    const target = new Date(expiryTime.replace(' ', 'T') + '+07:00').getTime()
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
        {copied ? 'Tersalin' : 'Salin'}
      </button>
    </div>
  )
}

function PaymentInstructionCard({ info, totalLabel, onCheckStatus }: PaymentInstructionCardProps) {
  const countdown = useCountdown(info.expiryTime)

  return (
    <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
      <h1 className={`${FONT_MONTSERRAT} text-lg font-bold text-[#343133]`}>
        Selesaikan Pembayaran
      </h1>
      <p className="mt-0.5 font-heading text-xs text-[#6F6B6E]">
        {CHANNEL_LABEL[info.channel]}
      </p>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-[#E6F0E0] px-3 py-2">
        <span className="font-heading text-xs text-[#404F14]">Total Pembayaran</span>
        <span className={`${FONT_MONTSERRAT} text-lg font-bold text-[#404F14]`}>{totalLabel}</span>
      </div>

      {countdown && (
        <p className="mt-3 text-center font-heading text-xs text-[#C00000]">
          Bayar sebelum <span className="font-bold">{countdown}</span>
        </p>
      )}

      <div className="mt-4 space-y-3">
        {/* QRIS / GoPay: tampilkan kode QR */}
        {info.qrUrl && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={info.qrUrl}
              alt="Kode QR pembayaran"
              className="h-56 w-56 rounded-lg border border-[#D4D4D4] object-contain"
            />
            <p className="font-heading text-xs text-[#6F6B6E]">
              Scan kode QR dengan aplikasi pembayaran Anda
            </p>
          </div>
        )}

        {/* E-wallet: buka aplikasi (khusus HP) */}
        {info.deeplinkUrl && (
          <a
            href={info.deeplinkUrl}
            className="flex h-10 w-full items-center justify-center rounded-lg border-2 border-[#404F14] font-heading text-xs font-bold text-[#404F14]"
          >
            Buka Aplikasi {CHANNEL_LABEL[info.channel]}
          </a>
        )}

        {/* Virtual Account */}
        {info.vaNumber && <CopyRow label={`Nomor Virtual Account ${info.bankName ?? ''}`.trim()} value={info.vaNumber} />}

        {/* Mandiri (echannel) */}
        {info.billerCode && <CopyRow label="Kode Perusahaan (Biller Code)" value={info.billerCode} />}
        {info.billKey && <CopyRow label="Kode Pembayaran (Bill Key)" value={info.billKey} />}

        {/* Alfamart / Indomaret */}
        {info.paymentCode && <CopyRow label={`Kode Pembayaran ${info.storeName ?? ''}`.trim()} value={info.paymentCode} />}
      </div>

      <button
        type="button"
        onClick={onCheckStatus}
        className="mt-5 h-10 w-full rounded-lg bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] cursor-pointer"
      >
        Saya Sudah Bayar / Cek Status
      </button>
    </section>
  )
}

export default PaymentInstructionCard