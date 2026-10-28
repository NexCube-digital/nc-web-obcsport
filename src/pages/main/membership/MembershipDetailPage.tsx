import { useEffect, useState } from 'react'
import { CalendarDays, CreditCard, Layers3 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import NavbarDashboard from '../../../components/layout/Navbar'
import MobileHeader from '../../../components/layout/MobileHeader'
import DeferredFooter from '../../../components/layout/DeferredFooter'
import { getApiErrorMessage } from '../../../services/apiService'
import { getMembershipDetail, type MembershipDetail } from '../../../services/membershipService'
import { parsePersistedDirectPayment } from '../../../services/paymentService'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { toast } from 'sonner'

const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const formatDate = (date: string) => new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${date.slice(0, 10)}T00:00:00`))

const statusLabel: Record<string, string> = {
  active: 'Aktif',
  expired: 'Kadaluarsa',
  depleted: 'Sesi Habis',
  cancelled: 'Dibatalkan',
  available: 'Tersedia',
  redeemed: 'Sudah Digunakan',
  booked: 'Sudah Dijadwalkan',
}

export default function MembershipDetailPage() {
  const { membershipId = '' } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [membership, setMembership] = useState<MembershipDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!membershipId) return
    let active = true
    getMembershipDetail(membershipId)
      .then((detail) => { if (active) setMembership(detail) })
      .catch((error: unknown) => {
        if (!active) return
        const message = getApiErrorMessage(error, 'Detail membership tidak dapat dimuat.')
        setErrorMessage(message)
        toast.error(message)
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [membershipId])

  const content = (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-5 md:px-6 md:pt-8">
      <button type="button" onClick={() => navigate('/history')} className="text-xs font-heading font-bold text-[#404F14]">
        Kembali ke Riwayat
      </button>
      <h1 className="mt-3 font-heading text-xl font-bold text-[#343133] md:text-2xl">Detail Membership</h1>

      {isLoading && <p className="mt-5 text-sm text-[#6F6B6E]">Memuat detail membership...</p>}
      {errorMessage && <p role="alert" className="mt-5 rounded-lg border border-[#F5B5B5] bg-[#FDF2F2] p-4 text-sm text-[#C41717]">{errorMessage}</p>}

      {membership && (
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-4 md:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#E6F0E0] text-[#404F14]"><Layers3 size={20} /></span>
              <div>
                <h2 className="font-heading text-base font-bold text-[#343133]">{membership.package.name}</h2>
                <p className="text-xs text-[#6F6B6E]">{membership.package.sportType}</p>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[#FDFCF7] p-3"><dt className="text-xs text-[#6F6B6E]">Status</dt><dd className="mt-1 font-heading text-sm font-bold text-[#404F14]">{statusLabel[membership.status] ?? membership.status}</dd></div>
              <div className="rounded-lg bg-[#FDFCF7] p-3"><dt className="text-xs text-[#6F6B6E]">Sesi</dt><dd className="mt-1 font-heading text-sm font-bold text-[#343133]">{membership.remainingSessions} dari {membership.totalSessions} tersisa</dd></div>
              <div className="rounded-lg bg-[#FDFCF7] p-3"><dt className="text-xs text-[#6F6B6E]">Tanggal pembelian</dt><dd className="mt-1 font-heading text-sm font-bold text-[#343133]">{formatDate(membership.purchaseDate)}</dd></div>
            </dl>

            <h3 className="mt-5 font-heading text-sm font-bold text-[#343133]">Daftar Sesi</h3>
            <div className="mt-3 space-y-2">
              {membership.sessions.map((session) => {
                const scheduledPayment = membership.payments.find((payment) => payment.paymentDetails)
                const paymentDetails = scheduledPayment?.paymentDetails as { schedules?: Array<{ bookingDate: string; startTime: string; endTime: string }> } | undefined
                const plannedSchedule = paymentDetails?.schedules?.[session.sessionNumber - 1]
                return (
                  <article key={session.id} className="rounded-lg border border-[#E5E5E5] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-xs font-bold text-[#404F14]">SESI {session.sessionNumber}</p>
                        {session.booking ? (
                          <>
                            <p className="mt-1 text-sm font-bold text-[#343133]">{session.booking.resource.name}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-[#6F6B6E]"><CalendarDays size={14} /> {formatDate(session.booking.bookingDate)} - {minutesToTime(session.booking.startMinute)}-{minutesToTime(session.booking.endMinute)}</p>
                          </>
                        ) : plannedSchedule ? (
                          <p className="mt-1 flex items-center gap-1 text-xs text-[#6F6B6E]"><CalendarDays size={14} /> {formatDate(plannedSchedule.bookingDate)} - {plannedSchedule.startTime}-{plannedSchedule.endTime}</p>
                        ) : <p className="mt-1 text-xs text-[#6F6B6E]">Belum dijadwalkan</p>}
                      </div>
                      <span className="rounded-md bg-[#EFF6EC] px-2 py-1 text-[10px] font-bold text-[#404F14]">{statusLabel[session.status] ?? session.status}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="rounded-2xl border border-[#D4D4D4] bg-white p-4 md:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F1F2EE] text-[#404F14]"><CreditCard size={20} /></span>
              <h2 className="font-heading text-base font-bold text-[#343133]">Pembayaran</h2>
            </div>
            <div className="mt-4 space-y-3">
              {membership.payments.map((payment) => {
                const storedPayment = payment.paymentDetails as { chargeResponse?: unknown } | null | undefined
                const directPayment = parsePersistedDirectPayment(storedPayment?.chargeResponse ?? payment.paymentDetails)
                return (
                  <div key={payment.id} className="rounded-lg bg-[#FDFCF7] p-3">
                    <p className="font-heading text-sm font-bold text-[#343133]">Rp {payment.totalAmount.toLocaleString('id-ID')}</p>
                    <p className="mt-1 break-all text-xs text-[#6F6B6E]">{payment.midtransOrderId}</p>
                    <p className="mt-1 text-xs font-bold text-[#404F14]">{payment.status}</p>
                    {['pending', 'waiting_payment'].includes(payment.status) && (
                      <div className="mt-3 space-y-2 border-t border-[#E5E5E5] pt-3">
                        {directPayment?.vaNumber && <p className="text-xs text-[#6F6B6E]">VA {directPayment.bankName ?? ''}: <strong className="text-[#343133]">{directPayment.vaNumber}</strong></p>}
                        {directPayment?.paymentCode && <p className="text-xs text-[#6F6B6E]">Kode pembayaran: <strong className="text-[#343133]">{directPayment.paymentCode}</strong></p>}
                        {directPayment?.billKey && <p className="text-xs text-[#6F6B6E]">Kode tagihan: <strong className="text-[#343133]">{directPayment.billKey}</strong></p>}
                        {directPayment?.qrUrl && <img src={directPayment.qrUrl} alt="QR pembayaran" className="mx-auto max-h-40 object-contain" />}
                        {(payment.redirectUrl || directPayment?.deeplinkUrl) && (
                          <button type="button" onClick={() => window.location.assign(payment.redirectUrl ?? directPayment?.deeplinkUrl ?? '')} className="h-10 w-full rounded-lg bg-[#CDF178] text-xs font-heading font-bold text-[#404F14]">Lanjutkan Pembayaran</button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      )}
    </main>
  )

  return isMobile ? (
    <>
      <MobileHeader variant="title" title="Detail Membership" showBottomNav={false} />
      {content}
    </>
  ) : (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard />
      {content}
      <DeferredFooter />
    </div>
  )
}
