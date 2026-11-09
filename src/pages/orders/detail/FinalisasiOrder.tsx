import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PaymentInstructionCard, { type PaymentBookingItem } from '../payment/PaymentInstructionCard'
import { getBookingDetails, type BookingDetails } from '../../../services/bookingService'
import { getMembershipDetail } from '../../../services/membershipService'
import { getApiErrorMessage } from '../../../services/apiService'
import { parsePersistedDirectPayment } from '../../../services/paymentService'
import { useTranslation } from 'react-i18next'

interface FinalisasiState {
  bookingId?: string
  membershipId?: string
  bookingIds?: string[]
}

const PAID_STATUSES = ['paid', 'settlement', 'capture', 'fully_paid', 'completed']
const FAILED_STATUSES = ['cancelled', 'expired', 'refunded', 'deny', 'failure', 'failed', 'cancel']

function FinalisasiOrder() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as FinalisasiState | null) ?? {}
  const params = new URLSearchParams(location.search)
  const bookingIds = state.bookingIds?.length
    ? state.bookingIds
    : params.get('bookingIds')?.split(',').filter(Boolean) ?? [state.bookingId ?? params.get('bookingId') ?? ''].filter(Boolean)
  const bookingId = bookingIds[0] ?? ''
  const bookingIdsKey = bookingIds.join('|')
  const membershipId = state.membershipId ?? params.get('membershipId') ?? ''
  const [bookings, setBookings] = useState<PaymentBookingItem[]>([])
  const [directInfo, setDirectInfo] = useState<ReturnType<typeof parsePersistedDirectPayment>>(null)
  const [total, setTotal] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    let timeout: number | undefined

    const loadStatus = async () => {
      let shouldPoll = false
      let nextPollMs = 4000
      try {
        if (membershipId) {
          const detail = await getMembershipDetail(membershipId)
          if (!active) return
          const payment = detail.payments[0]
          if (PAID_STATUSES.includes(payment?.status ?? '')) {
            navigate(`/success-order?membershipId=${encodeURIComponent(membershipId)}`, { replace: true, state: { membershipId } })
            return
          }
          if (FAILED_STATUSES.includes(payment?.status ?? '') || detail.status === 'cancelled') {
            navigate(`/failed-order?membershipId=${encodeURIComponent(membershipId)}`, { replace: true, state: { membershipId } })
            return
          }
          const storedPayment = payment?.paymentDetails as { chargeResponse?: unknown } | null
          const info = parsePersistedDirectPayment(storedPayment?.chargeResponse ?? payment?.paymentDetails)
          setDirectInfo(info)
          setTotal(payment?.totalAmount ?? detail.package.memberPrice)
          setBookings(detail.sessions.filter((session) => session.booking).map((session) => ({
            id: session.id,
            facilityName: session.booking?.resource.name ?? detail.package.name,
            bookingDate: session.booking?.bookingDate ?? detail.purchaseDate,
            startTime: session.booking ? `${String(Math.floor(session.booking.startMinute / 60)).padStart(2, '0')}:${String(session.booking.startMinute % 60).padStart(2, '0')}` : '-',
            endTime: session.booking ? `${String(Math.floor(session.booking.endMinute / 60)).padStart(2, '0')}:${String(session.booking.endMinute % 60).padStart(2, '0')}` : '-',
          })))
          setErrorMessage(info ? '' : t('payment.instructionsMissing'))
          return
        }

        if (!bookingId) {
          navigate('/home', { replace: true })
          return
        }
        const details = await Promise.all(bookingIds.map((id) => getBookingDetails(id))) as BookingDetails[]
        if (!active) return
        const failed = details.find((item) =>
          FAILED_STATUSES.includes(item.status) || FAILED_STATUSES.includes(item.payments[0]?.status ?? ''),
        )
        if (failed) {
          navigate(`/failed-order?bookingId=${encodeURIComponent(bookingId)}`, { replace: true, state: { bookingId, bookingIds } })
          return
        }
        const unpaid = details.find((item) => !PAID_STATUSES.includes(item.status) && !PAID_STATUSES.includes(item.payments[0]?.status ?? '') && !['cancelled', 'expired', 'refunded'].includes(item.status))
        if (!unpaid) {
          navigate(`/success-order?bookingId=${encodeURIComponent(bookingId)}${bookingIds.length > 1 ? `&bookingIds=${encodeURIComponent(bookingIds.join(','))}` : ''}`, { replace: true, state: { bookingId, bookingIds } })
          return
        }
        const payment = unpaid.payments[0]
        const info = parsePersistedDirectPayment(payment?.paymentDetails)
        const expiryTime = unpaid.lockedUntil ?? payment?.expiredAt ?? info?.expiryTime
        setDirectInfo(info ? { ...info, expiryTime } : null)
        setErrorMessage(info ? '' : t('payment.instructionsMissing'))
        setTotal(payment?.amount ?? unpaid.pricing.totalPrice)
        setBookings(details.map((item) => ({
          id: item.id,
          facilityName: item.resource.name,
          bookingDate: item.bookingDate,
          startTime: item.startTime,
          endTime: item.endTime,
        })))
        if (expiryTime) {
          const millisecondsUntilExpiry = Date.parse(expiryTime) - Date.now()
          if (Number.isFinite(millisecondsUntilExpiry)) {
            nextPollMs = Math.max(250, Math.min(nextPollMs, millisecondsUntilExpiry))
          }
        }
        shouldPoll = true
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, t('paymentStatus.loadingPayment')))
          shouldPoll = true
        }
      } finally {
        if (active && shouldPoll) timeout = window.setTimeout(() => void loadStatus(), nextPollMs)
      }
    }

    void loadStatus()
    return () => {
      active = false
      if (timeout) window.clearTimeout(timeout)
    }
  }, [bookingId, bookingIdsKey, membershipId, navigate, t])

  const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

  return (
    <div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
      <main className="mx-auto w-full max-w-[560px] flex-1 px-4 pt-6 pb-16">
        {errorMessage && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
        {!directInfo && !errorMessage && <p role="status" className="py-10 text-center text-sm text-[#6F6B6E]">{t('payment.preparing')}</p>}
        {directInfo && (
          <PaymentInstructionCard
            info={directInfo}
            totalLabel={formatRupiah(total)}
            bookings={bookings}
            onCheckStatus={() => window.location.reload()}
          />
        )}
      </main>
    </div>
  )
}

export default FinalisasiOrder
