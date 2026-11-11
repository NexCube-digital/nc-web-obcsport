import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { CartItem } from '../../components/ui/CartModal'
import { COURT_FACILITIES } from '../../data/facilitiesData'
import type { FacilityCard } from '../main/home/Court'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getApiErrorMessage } from '../../services/apiService'
import { MAX_SESSION_HOURS, timeToMinutes } from '../../utils/orders/checkoutDateUtils'
import CheckoutMobileView from './CheckoutMobile'
import CheckoutDesktopView from './CheckoutDesktop'
import CheckoutOverlays from './checkout/CheckoutOverlays'
import { useBookingSchedule } from '../../utils/orders/useBookingSchedule'
import { useCheckoutCart } from '../../utils/orders/useCheckoutCart'
import fallbackCourtImage from '../../assets/no-image.webp'

type CheckoutState = {
  resourceId?: string
  sportType?: string
  facility?: FacilityCard
}

function DetailOrder() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const checkoutState = (location.state as CheckoutState | null) ?? {}
  const resourceId = checkoutState.resourceId
  const sportType = checkoutState.sportType ?? 'futsal'
  const isSoccer = sportType === 'sepakbola'
  const durationStepHours = isSoccer ? 2 : 1
  const maxAllowedSessionHours = isSoccer ? 6 : MAX_SESSION_HOURS
  const facility = checkoutState.facility ?? {
    ...COURT_FACILITIES[0],
    description: COURT_FACILITIES[0].description,
    badge: t('booking.available'),
    buttonLabel: t('booking.bookCourt'),
  }
  const facilityImage = facility.image || fallbackCourtImage

  const schedule = useBookingSchedule({
    resourceId,
    sportType,
    isSoccer,
    isMobile,
    maxAllowedSessionHours,
    durationStepHours,
  })
  const cart = useCheckoutCart()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)

  useEffect(() => {
    if (!resourceId) navigate('/home', { replace: true })
  }, [navigate, resourceId])

  const openMobileSheetForSelection = () => {
    schedule.resetSelection()
    setIsSheetOpen(true)
  }

  const handleToggleMobileSheet = () => {
    if (isSheetOpen) {
      setIsSheetOpen(false)
      return
    }
    openMobileSheetForSelection()
  }

  const goToPayment = () => {
    navigate('/payment', {
      state: {
        resourceId,
        sportType,
        bookingDate: schedule.selectedDate,
        facility,
        date: schedule.selectedDateLabel,
        time: schedule.startTime,
        endTime: schedule.endTime,
        total: schedule.totalPrice,
        durationMinutes: schedule.durationMinutes,
        price: schedule.pricePreview,
      },
    })
  }

  const handleConfirmSchedule = () => {
    if (!schedule.validateSchedule()) return
    schedule.setIsConfirmed(true)
    setIsCheckoutModalOpen(true)
  }

  const handleOrderNow = () => {
    if (!schedule.isConfirmed || !schedule.selectedDate) return
    goToPayment()
  }

  const handleOrderNowMobile = () => {
    if (!schedule.selectedDate || schedule.sessionCount === 0) {
      openMobileSheetForSelection()
      return
    }
    if (!schedule.validateSchedule()) return
    goToPayment()
  }

  const handleSearchOtherMobile = () => {
    schedule.resetSelection()
    setIsSheetOpen(true)
  }

  const handleAddToCart = async () => {
    if (!schedule.selectedDate || schedule.sessionCount === 0) {
      openMobileSheetForSelection()
      return
    }
    if (!schedule.validateSchedule()) {
      setIsSheetOpen(true)
      return
    }
    if (!resourceId) {
      toast.error(t('booking.facilityNotSelected'))
      return
    }

    const cartItem: CartItem = {
      id: `${facility.id}-${schedule.selectedDate}-${schedule.startTime}-${schedule.endTime}`,
      code: facility.id.split('-').at(-1)?.toUpperCase() ?? 'OBC',
      facilityName: facility.name,
      image: facilityImage,
      sportName: facility.name,
      schedule: `${schedule.startTime} - ${schedule.endTime}, ${schedule.selectedDateLabel}`,
      price: schedule.totalPrice,
      resourceId,
      bookingDate: schedule.selectedDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      sportType,
    }
    const added = await cart.addItem(cartItem, {
      resourceId,
      bookingDate: schedule.selectedDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      sportType,
    })
    if (!added) return

    setIsCheckoutModalOpen(false)
    cart.setIsCartOpen(true)
  }

  const handleCheckoutCart = (items: CartItem[]) => {
    const invalidItems = items.filter((item) =>
      !item.resourceId || !item.bookingDate || !item.startTime || !item.endTime || !item.sportType,
    )
    if (invalidItems.length > 0) {
      toast.error(t('booking.cartDataIncomplete'))
      return
    }

    const firstItem = items[0]
    if (!firstItem) {
      toast.error(t('booking.cartEmpty'))
      return
    }

    const paymentState = {
      resourceId: firstItem.resourceId,
      sportType: firstItem.sportType,
      bookingDate: firstItem.bookingDate,
      facility: { id: firstItem.resourceId, name: firstItem.facilityName },
      date: firstItem.bookingDate,
      time: firstItem.startTime,
      endTime: firstItem.endTime,
      total: items.reduce((sum, item) => sum + item.price, 0),
      durationMinutes: timeToMinutes(firstItem.endTime!) - timeToMinutes(firstItem.startTime!),
      cartItems: items,
    }

    sessionStorage.setItem('obc-cart-payment-state', JSON.stringify(paymentState))
    cart.setIsCartOpen(false)
    navigate('/payment', { state: paymentState })
  }

  return (
    <>
      {isMobile ? (
        <CheckoutMobileView
          facility={facility}
          facilityImage={facilityImage}
          apiPriceTiers={schedule.apiPriceTiers}
          isApiPriceLoading={schedule.isApiPriceLoading}
          schedule={schedule}
          isSheetOpen={isSheetOpen}
          onToggleSheet={handleToggleMobileSheet}
          onCloseSheet={() => setIsSheetOpen(false)}
          onOrderNow={handleOrderNowMobile}
          onSearchOther={handleSearchOtherMobile}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <CheckoutDesktopView
          facility={facility}
          facilityImage={facilityImage}
          apiPriceTiers={schedule.apiPriceTiers}
          isApiPriceLoading={schedule.isApiPriceLoading}
          schedule={schedule}
          onConfirmSchedule={handleConfirmSchedule}
        />
      )}

      <CheckoutOverlays
        isCheckoutModalOpen={isCheckoutModalOpen}
        facilityName={facility.name}
        duration={schedule.durationMinutes / 60}
        dateTime={schedule.sessionCount > 0
          ? `${schedule.selectedDayAndDate} (${schedule.startTime} - ${schedule.endTime})`
          : '-'}
        total={schedule.totalPrice}
        onCloseCheckout={() => setIsCheckoutModalOpen(false)}
        onOrder={handleOrderNow}
        onAddToCart={handleAddToCart}
        isCartOpen={cart.isCartOpen}
        cartItems={cart.cartItems}
        onCloseCart={() => cart.setIsCartOpen(false)}
        onRemoveCartItem={cart.removeItem}
        onCheckoutCart={handleCheckoutCart}
        conflictMessage={schedule.conflictMessage}
        onDismissConflict={() => schedule.setConflictMessage(null)}
        onReturnHome={() => navigate('/home')}
      />
    </>
  )
}

export default DetailOrder