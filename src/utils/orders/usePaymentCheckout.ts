import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { checkoutCart, createBooking, previewBookingPrice, type BookingPrice, type PaymentChannel } from '../../services/bookingService'
import { cartService, syncBackendCart } from '../../services/cart'
import { getApiErrorMessage } from '../../services/apiService'
import { isDirectChannel, parseMidtransCharge } from '../../services/paymentService'
import type { CheckoutState, ExtraItem, PaymentDisplayData, PendingOrderModalData } from './paymentTypes'
import {
  DEFAULT_END,
  DEFAULT_START,
  DEFAULT_SUBTOTAL,
  EXTRA_ITEMS,
  PENDING_ORDER_MAX_AGE_MS,
  PENDING_ORDER_STORAGE_KEY,
  hourOf,
} from './paymentUtils'
import { usePendingPayment } from './usePendingPayment'
import { useAuth } from '../../hooks/useAuth'
import { queryKeys } from '../queryKeys'

export function usePaymentCheckout() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const cartQueryKey = queryKeys.cart(user?.id ?? user?.email ?? 'anonymous')
  const navigate = useNavigate()
  const location = useLocation()
  const extraItems: ExtraItem[] = EXTRA_ITEMS.map((item) => ({
    ...item,
    name: t(item.id === 'raket' ? 'payment.extras.racket' : 'payment.extras.ballPaddle'),
  }))

  const pendingParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const pendingBookingId = pendingParams.get('pendingBookingId') ?? ''
  const pendingBookingIds = useMemo(
    () => pendingParams.get('pendingBookingIds')?.split(',').filter(Boolean) ?? [],
    [pendingParams],
  )
  const state = useMemo(() => {
    const routeState = location.state as CheckoutState | null
    if (routeState) return routeState
    try {
      const stored = sessionStorage.getItem('obc-cart-payment-state')
      return stored ? JSON.parse(stored) as CheckoutState : {}
    } catch {
      return {}
    }
  }, [location.state])
  const cartItems = useMemo(() =>
    state.cartItems?.filter((item) => item.resourceId && item.bookingDate && item.startTime && item.endTime && item.sportType) ?? [],
  [state.cartItems])
  const isCartCheckout = cartItems.length > 0
  const cartItemsKey = cartItems
    .map((item) => `${item.resourceId}:${item.bookingDate}:${item.startTime}:${item.endTime}:${item.sportType}`)
    .join('|')

  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel | null>(null)
  const selectedExtras = ['raket']
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pricePreview, setPricePreview] = useState<Pick<BookingPrice, 'basePrice' | 'discountAmount' | 'adminFee' | 'totalPrice'> | null>(state.price ?? null)
  const { pendingOrderModal, setPendingOrderModal, isPendingBookingLoading } = usePendingPayment(
    pendingBookingId,
    pendingBookingIds,
  )

  useEffect(() => {
    if (!pendingOrderModal && !pendingBookingId && (!state.resourceId || !state.bookingDate)) {
      navigate('/home', { replace: true })
    }
  }, [navigate, pendingBookingId, pendingOrderModal, state.bookingDate, state.resourceId])

  const selectedMethodLabel = selectedChannel
    ? t(`payment.methods.${selectedChannel}.name`)
    : t('payment.midtrans')
  const paymentMethod = !selectedChannel
    ? undefined
    : selectedChannel === 'qris'
      ? 'qris'
      : selectedChannel === 'credit_card'
        ? 'credit_card'
        : ['gopay', 'shopeepay', 'ovo', 'dana'].includes(selectedChannel)
          ? 'ewallet'
          : ['alfamart', 'indomaret'].includes(selectedChannel)
            ? 'convenience_store'
            : 'bank_transfer'

  useEffect(() => {
    let active = true
    const items = isCartCheckout
      ? cartItems
      : [{ resourceId: state.resourceId, bookingDate: state.bookingDate, startTime: state.time, endTime: state.endTime, sportType: state.sportType }]
    if (items.some((item) => !item.resourceId || !item.bookingDate || !item.startTime || !item.endTime || !item.sportType)) return

    Promise.all(items.map((item) => previewBookingPrice({
      resourceId: item.resourceId!,
      bookingDate: item.bookingDate!,
      startTime: item.startTime!,
      endTime: item.endTime!,
      sportType: item.sportType!,
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(selectedChannel ? { paymentChannel: selectedChannel } : {}),
      bookingType: 'regular',
    })))
      .then((prices) => {
        if (!active) return
        if (prices.length === 1) {
          setPricePreview(prices[0])
          return
        }
        setPricePreview({
          basePrice: prices.reduce((sum, price) => sum + price.basePrice, 0),
          discountAmount: prices.reduce((sum, price) => sum + price.discountAmount, 0),
          adminFee: prices.reduce((sum, price) => sum + price.adminFee, 0),
          totalPrice: prices.reduce((sum, price) => sum + price.totalPrice, 0),
        })
      })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, 'Rincian harga tidak dapat diperbarui.'))
      })
    return () => { active = false }
  }, [cartItems, cartItemsKey, isCartCheckout, paymentMethod, selectedChannel, state.bookingDate, state.endTime, state.resourceId, state.sportType, state.time])

  const date = state.date ?? new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
  const startTime = state.time ?? DEFAULT_START
  const endTime = state.endTime ?? DEFAULT_END
  const facilityName = state.facility?.name ?? t('history.facilities.futsal')
  const facilityLocation = state.facility?.location?.name ?? 'OBC Sport Center'
  const pendingBookings = isCartCheckout
    ? cartItems.map((item) => ({
        id: item.id,
        name: item.facilityName,
        date: item.bookingDate ?? '-',
        time: `${item.startTime ?? '-'} - ${item.endTime ?? '-'}`,
      }))
    : [{ id: state.resourceId ?? 'booking', name: facilityName, date, time: `${startTime} - ${endTime}` }]

  const subtotal = pricePreview?.basePrice ?? state.total ?? DEFAULT_SUBTOTAL
  const hours = Math.max((state.durationMinutes ?? (hourOf(endTime) - hourOf(startTime)) * 60) / 60, 1)
  const isSoccerBooking = state.sportType === 'sepakbola'
  const billingBlocks = isSoccerBooking ? hours / 2 : hours
  const displayedRate = Math.round(subtotal / billingBlocks / 1000)
  const promo = selectedChannel ? pricePreview?.discountAmount ?? 0 : 0
  const serviceFee = selectedChannel ? pricePreview?.adminFee ?? 0 : 0
  const total = selectedChannel ? pricePreview?.totalPrice ?? subtotal : subtotal
  const extrasTotal = extraItems.filter((item) => selectedExtras.includes(item.id)).reduce((sum, item) => sum + item.price, 0)
  const mobileTotal = subtotal + serviceFee + extrasTotal

  const showPendingOrderModal = (
    pending: Omit<PendingOrderModalData, 'date' | 'time' | 'paymentMethod' | 'bookings' | 'expiresAt'>,
    holdExpiresAt: string | null | undefined,
    now: number,
  ) => {
    const fallbackExpiry = now + PENDING_ORDER_MAX_AGE_MS
    const holdExpiry = holdExpiresAt ? new Date(holdExpiresAt).getTime() : Number.NaN
    const modalData: PendingOrderModalData = {
      ...pending,
      date,
      time: `${startTime} - ${endTime}`,
      paymentMethod: selectedMethodLabel,
      bookings: pendingBookings,
      expiresAt: new Date(Number.isFinite(holdExpiry) ? Math.min(holdExpiry, fallbackExpiry) : fallbackExpiry).toISOString(),
    }
    try {
      sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(modalData))
    } catch {
      // The active modal remains available if browser storage is unavailable.
    }
    const params = new URLSearchParams({
      pendingBookingId: modalData.bookingId,
      pendingBookingIds: (modalData.bookingIds ?? [modalData.bookingId]).join(','),
    })
    navigate(`/payment?${params.toString()}`, { replace: true, state: location.state })
    setPendingOrderModal(modalData)
  }

  const handlePay = async () => {
    if (!state.resourceId || !state.bookingDate || !state.sportType) {
      toast.error(t('payment.missingBooking'))
      return
    }
    if (!selectedChannel) {
      toast.error(t('payment.chooseMethod'))
      return
    }

    setIsSubmitting(true)
    try {
      const booking = isCartCheckout
        ? await (async () => {
          const result = await checkoutCart(cartItems.map((item) => ({
            resourceId: item.resourceId!,
            bookingDate: item.bookingDate!,
            startTime: item.startTime!,
            endTime: item.endTime!,
            sportType: item.sportType!,
          })), paymentMethod, selectedChannel)
          cartService.clearCart()
          const syncedCart = await syncBackendCart().catch(() => [])
          queryClient.setQueryData(cartQueryKey, syncedCart)
          return {
            bookingId: result.bookingIds[0] ?? result.orderId,
            bookingIds: result.bookingIds,
            status: 'pending',
            totalPrice: result.totalAmount,
            totalPriceFormatted: result.totalAmountFormatted,
            payment: result.payment,
            holdExpiresAt: null,
            message: result.message,
          }
        })()
        : await createBooking({
          resourceId: state.resourceId,
          bookingDate: state.bookingDate,
          startTime,
          endTime,
          sportType: state.sportType,
          bookingType: 'regular',
          paymentChannel: selectedChannel,
          notes: selectedExtras.length > 0
            ? `${t('payment.extraRental')}: ${extraItems.filter((item) => selectedExtras.includes(item.id)).map((item) => item.name).join(', ')}`
            : undefined,
        })

      const payment = booking.payment
      if (payment && 'unavailable' in payment) {
        toast.error(payment.message)
        setIsSubmitting(false)
        return
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.facilityAvailabilityPrefix })
      void queryClient.invalidateQueries({ queryKey: queryKeys.facilityCalendarPrefix })
      void queryClient.invalidateQueries({ queryKey: queryKeys.customerHistoryPrefix })

      if (selectedChannel === 'credit_card' || (payment && 'cardPayment' in payment)) {
        const bookingId = booking.bookingId
        navigate(`/credit-card-payment?bookingId=${encodeURIComponent(bookingId)}`, {
          replace: true,
          state: { bookingId },
        })
        return
      }

      if (payment && 'chargeResponse' in payment && isDirectChannel(selectedChannel)) {
        const bookingId = booking.bookingId
        const bookingIds = 'bookingIds' in booking ? booking.bookingIds : [booking.bookingId]
        showPendingOrderModal({
          bookingId,
          bookingIds,
          transactionId: payment.chargeResponse.order_id ?? bookingId,
          amount: Number(payment.chargeResponse.gross_amount) || total,
          paymentInfo: parseMidtransCharge(payment.chargeResponse, selectedChannel),
        }, booking.holdExpiresAt, Date.now())
        setIsSubmitting(false)
        return
      }

      if (isDirectChannel(selectedChannel)) {
        toast.error(t('payment.missingCharge'))
        setIsSubmitting(false)
        return
      }

      if (booking.payment && 'redirectUrl' in booking.payment) {
        const bookingId = booking.bookingId
        const bookingIds = 'bookingIds' in booking ? booking.bookingIds : [booking.bookingId]
        if (selectedChannel === 'ovo') {
          showPendingOrderModal({
            bookingId,
            bookingIds,
            transactionId: bookingId,
            amount: total,
            paymentUrl: booking.payment.redirectUrl,
          }, booking.holdExpiresAt, Date.now())
          setIsSubmitting(false)
          return
        }
        showPendingOrderModal({ bookingId, bookingIds, transactionId: bookingId, amount: total }, booking.holdExpiresAt, Date.now())
        setIsSubmitting(false)
        return
      }

      const bookingIds = 'bookingIds' in booking ? booking.bookingIds : [booking.bookingId]
      navigate(`/success-order?bookingId=${encodeURIComponent(booking.bookingId)}&bookingIds=${encodeURIComponent(bookingIds.join(','))}`, {
        replace: true,
        state: { bookingId: booking.bookingId, bookingIds },
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('payment.createFailed')))
      setIsSubmitting(false)
    }
  }

  const displayData: PaymentDisplayData = {
    cartItems,
    isCartCheckout,
    facilityName,
    facilityLocation,
    date,
    startTime,
    endTime,
    hours,
    isSoccerBooking,
    billingBlocks,
    displayedRate,
    subtotal,
    promo,
    serviceFee,
    total,
    extrasTotal,
    mobileTotal,
  }

  return {
    data: displayData,
    selectedChannel,
    setSelectedChannel,
    isSubmitting,
    handlePay,
    pendingOrderModal,
    isPendingBookingLoading,
    clearPendingOrder: () => sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY),
    returnHome: () => navigate('/home'),
    openOrderStatus: () => {
      if (!pendingOrderModal) return
      const bookingId = pendingOrderModal.bookingId
      const bookingIds = pendingOrderModal.bookingIds ?? [bookingId]
      navigate(`/finalisasi-order?bookingId=${encodeURIComponent(bookingId)}&bookingIds=${encodeURIComponent(bookingIds.join(','))}`, {
        state: { bookingId, bookingIds },
      })
    },
    continuePayment: () => {
      if (pendingOrderModal?.paymentUrl) window.location.assign(pendingOrderModal.paymentUrl)
    },
  }
}