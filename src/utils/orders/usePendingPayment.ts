import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getBookingDetails } from '../../services/bookingService'
import { parsePersistedDirectPayment } from '../../services/paymentService'
import type { PendingOrderModalData } from './paymentTypes'
import {
  FAILED_STATUSES,
  PAID_STATUSES,
  PENDING_ORDER_MAX_AGE_MS,
  PENDING_ORDER_STORAGE_KEY,
  readPendingOrder,
} from './paymentUtils'

export function usePendingPayment(pendingBookingId: string, pendingBookingIds: string[]) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [pendingOrderModal, setPendingOrderModal] = useState<PendingOrderModalData | null>(readPendingOrder)

  useEffect(() => {
    if (!pendingOrderModal) return

    let active = true
    let timeout: number | undefined
    const expiresAt = new Date(pendingOrderModal.expiresAt).getTime()
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      navigate(`/finalisasi-order?bookingId=${encodeURIComponent(pendingOrderModal.bookingId)}`, {
        replace: true,
        state: { bookingId: pendingOrderModal.bookingId, bookingIds: pendingOrderModal.bookingIds },
      })
      return
    }

    const checkPaymentStatus = async () => {
      try {
        const bookingIds = pendingOrderModal.bookingIds ?? [pendingOrderModal.bookingId]
        const details = await Promise.all(bookingIds.map((id) => getBookingDetails(id)))
        if (!active) return
        const allPaid = details.every((booking) =>
          PAID_STATUSES.includes(booking.status) || PAID_STATUSES.includes(booking.payments[0]?.status ?? ''),
        )
        if (allPaid) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(
            `/success-order?bookingId=${encodeURIComponent(pendingOrderModal.bookingId)}&bookingIds=${encodeURIComponent(bookingIds.join(','))}`,
            { replace: true },
          )
          return
        }
        const hasFailed = details.some((booking) =>
          FAILED_STATUSES.includes(booking.status) || FAILED_STATUSES.includes(booking.payments[0]?.status ?? ''),
        )
        if (hasFailed) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(`/failed-order?bookingId=${encodeURIComponent(pendingOrderModal.bookingId)}`, { replace: true })
          return
        }
      } catch {
        // Keep checking while the verified webhook updates the booking.
      }

      if (active) {
        timeout = window.setTimeout(() => void checkPaymentStatus(), Math.min(3000, Math.max(500, expiresAt - Date.now())))
      }
    }

    void checkPaymentStatus()
    return () => {
      active = false
      if (timeout) window.clearTimeout(timeout)
    }
  }, [navigate, pendingOrderModal])

  useEffect(() => {
    if (!pendingBookingId || pendingOrderModal) return

    let active = true
    const bookingIds = pendingBookingIds.length ? pendingBookingIds : [pendingBookingId]
    Promise.all(bookingIds.map((id) => getBookingDetails(id)))
      .then((details) => {
        if (!active) return
        const allPaid = details.every((booking) =>
          PAID_STATUSES.includes(booking.status) || PAID_STATUSES.includes(booking.payments[0]?.status ?? ''),
        )
        if (allPaid) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(
            `/success-order?bookingId=${encodeURIComponent(pendingBookingId)}&bookingIds=${encodeURIComponent(bookingIds.join(','))}`,
            { replace: true },
          )
          return
        }
        const hasFailed = details.some((booking) =>
          FAILED_STATUSES.includes(booking.status) || FAILED_STATUSES.includes(booking.payments[0]?.status ?? ''),
        )
        if (hasFailed) {
          sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
          navigate(`/failed-order?bookingId=${encodeURIComponent(pendingBookingId)}`, { replace: true })
          return
        }

        const firstBooking = details[0]
        const firstPayment = firstBooking?.payments[0]
        if (!firstBooking) throw new Error(t('payment.bookingNotFound'))
        const paymentCreatedAt = firstPayment?.createdAt ? new Date(firstPayment.createdAt).getTime() : Number.NaN
        const serverExpiry = firstBooking.lockedUntil ?? firstPayment?.expiredAt
        const serverExpiryTime = serverExpiry ? new Date(serverExpiry).getTime() : Number.NaN
        const threeMinuteExpiry = Number.isFinite(paymentCreatedAt)
          ? paymentCreatedAt + PENDING_ORDER_MAX_AGE_MS
          : Date.now() + PENDING_ORDER_MAX_AGE_MS
        const expiresAt = new Date(Number.isFinite(serverExpiryTime)
          ? Math.min(serverExpiryTime, threeMinuteExpiry)
          : threeMinuteExpiry).toISOString()
        const modalData: PendingOrderModalData = {
          bookingId: pendingBookingId,
          bookingIds,
          transactionId: firstPayment?.midtransOrderId ?? pendingBookingId,
          amount: firstPayment?.amount ?? firstBooking.pricing.totalPrice,
          paymentInfo: parsePersistedDirectPayment(firstPayment?.paymentDetails),
          paymentUrl: firstPayment?.redirectUrl ?? undefined,
          date: firstBooking.bookingDate,
          time: `${firstBooking.startTime} - ${firstBooking.endTime}`,
          paymentMethod: firstPayment?.method ?? firstPayment?.paymentType ?? t('payment.midtrans'),
          bookings: details.map((booking) => ({
            id: booking.id,
            name: booking.resource.name,
            date: booking.bookingDate,
            time: `${booking.startTime} - ${booking.endTime}`,
          })),
          expiresAt,
        }
        sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(modalData))
        setPendingOrderModal(modalData)
      })
      .catch(() => {
        if (active) navigate('/home', { replace: true })
      })

    return () => { active = false }
  }, [navigate, pendingBookingId, pendingBookingIds, pendingOrderModal, t])

  return {
    pendingOrderModal,
    setPendingOrderModal,
    isPendingBookingLoading: Boolean(pendingBookingId && !pendingOrderModal),
  }
}