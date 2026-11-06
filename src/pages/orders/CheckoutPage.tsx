import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import type { CartItem } from '../../components/ui/CartModal'
import { COURT_FACILITIES } from '../../data/facilitiesData'
import type { FacilityCard } from '../main/home/Court'
import { getFacilityAvailability, getFacilityPriceTiers, type FacilityAvailability, type FacilityPriceTier } from '../../services/facilityService'
import { previewBookingPrice, type BookingPrice } from '../../services/bookingService'
import { addBackendCartItem, cartService, getBackendCart, removeBackendCartItem } from '../../services/cart'
import { getApiErrorMessage } from '../../services/apiService'
import FacilityDetails from './checkout/FacilityDetails'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useTranslation } from 'react-i18next'
import fallbackCourtImage from '../../assets/no-image.webp'

const ScheduleConflict = lazy(() => import('./checkout/ScheduleConflict'))
const ModalCheckout = lazy(() => import('../../components/ui/ModalCheckout'))
const CartModal = lazy(() => import('../../components/ui/CartModal'))
const TopSportReviews = lazy(() => import('./checkout/TopSportReviews'))
const BookingScheduleSelector = lazy(() => import('./checkout/BookingScheduleSelector'))
const MobileBookingSheet = lazy(() => import('./checkout/MobileBookingSheet'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/bookingService.js)
   ------------------------------------------------------------------------- */
const MAX_SESSION_HOURS = 5

const BOOKED_DATES: string[] = []

/* -------------------------------------------------------------------------
   Fungsi bantu
   ------------------------------------------------------------------------- */
const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const getZonedParts = (date: Date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  )

const getTodayKey = (date = new Date()) => {
  const parts = getZonedParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

const isPastSlot = (date: string, time: string, now: Date) => {
  if (date < getTodayKey(now)) return true
  if (date > getTodayKey(now)) return false
  const parts = getZonedParts(now)
  const nowSeconds = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)
  return timeToMinutes(time) * 60 <= nowSeconds
}

type CheckoutState = {
  resourceId?: string
  sportType?: string
  facility?: FacilityCard
}

function DetailOrder() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours && remainingMinutes) return t('booking.durationHoursMinutes', { hours, minutes: remainingMinutes })
    if (hours) return t('booking.durationHours', { count: hours })
    return t('booking.durationMinutes', { count: remainingMinutes })
  }
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

  const [viewYear, setViewYear] = useState(() => Number(getZonedParts(new Date()).year))
  const [viewMonth, setViewMonth] = useState(() => Number(getZonedParts(new Date()).month) - 1)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    isMobile ? getTodayKey() : null,
  )
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(isSoccer ? 120 : 60)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => cartService.getItems())
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [availability, setAvailability] = useState<FacilityAvailability | null>(null)
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true)
  const [pricePreview, setPricePreview] = useState<BookingPrice | null>(null)
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [apiPriceTiers, setApiPriceTiers] = useState<Array<{ id: string; range: string; price: string }>>([])
  const [isApiPriceLoading, setIsApiPriceLoading] = useState(true)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let active = true
    getBackendCart()
      .then((items) => {
        if (!active) return
        const formatMinute = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
        const mapped = items.map((item): CartItem => ({
          id: item.id,
          code: item.resource?.name?.split('-').at(-1)?.toUpperCase() ?? 'OBC',
          facilityName: item.resource?.name ?? 'Fasilitas OBC Sport',
          sportName: item.sportType,
          schedule: `${formatMinute(item.startMinute)} - ${formatMinute(item.endMinute)}, ${item.bookingDate}`,
          price: 0,
          resourceId: item.resourceId,
          bookingDate: item.bookingDate,
          startTime: formatMinute(item.startMinute),
          endTime: formatMinute(item.endMinute),
          sportType: item.sportType,
        }))
        setCartItems(mapped)
        cartService.replaceItems(mapped)
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!resourceId) return
    let active = true
    Promise.resolve().then(() => getFacilityPriceTiers(resourceId))
      .then((tiers: FacilityPriceTier[]) => {
        if (!active) return
        const formatTime = (minutes: number) =>
          `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
        const weekdayTiers = tiers.filter((tier) => tier.dayType === 'weekday')
        setApiPriceTiers(weekdayTiers.map((tier) => ({
          id: tier.id,
          range: `${formatTime(tier.tierStart)}-${formatTime(tier.tierEnd)}`,
          price: `${Math.round(tier.pricePerHour / 1000)}k/${isSoccer ? '2 jam' : 'jam'}`,
        })))
      })
      .catch((error: unknown) => {
        if (active) {
          setApiPriceTiers([])
          toast.error(getApiErrorMessage(error, t('booking.priceLoadFailed')))
        }
      })
      .finally(() => { if (active) setIsApiPriceLoading(false) })
    return () => { active = false }
  }, [isSoccer, resourceId, t])

  useEffect(() => {
    if (!resourceId) navigate('/home', { replace: true })
  }, [navigate, resourceId])

  useEffect(() => {
    if (!resourceId || !selectedDate) return
    let active = true
    getFacilityAvailability(resourceId, selectedDate, sportType)
      .then((result) => { if (active) setAvailability(result) })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, t('booking.availabilityLoadFailed')))
      })
      .finally(() => { if (active) setIsAvailabilityLoading(false) })

    return () => { active = false }
  }, [resourceId, selectedDate, sportType, t])

  // State khusus mobile: bottom sheet pilih tanggal & jam
  const [isSheetOpen, setIsSheetOpen] = useState(false)

    const openMobileSheetForSelection = () => {
      setSelectedDate(null)
      setSelectedStartTime(null)
      setAvailability(null)
      setIsAvailabilityLoading(false)
      setPricePreview(null)
      setIsPriceLoading(false)
      setIsConfirmed(false)
      setIsSheetOpen(true)
    }

  const handleToggleMobileSheet = () => {
    if (isSheetOpen) {
      setIsSheetOpen(false)
      return
    }
    openMobileSheetForSelection()
  }

  /* ---------- Turunan data kalender ---------- */
  const availabilitySlotMinutes = availability?.slots[0]
    ? availability.slots[0].endMinute - availability.slots[0].startMinute
    : 15
  const availableTimeSlots = availability?.slots
    .filter((slot) => slot.startMinute % 60 === 0)
    .map((slot) => slot.startTime) ?? []
  const canBookWindow = (startMinute: number, durationMinutes: number) => {
    if (!availability || !selectedDate) return false
    if (startMinute % 60 !== 0 || durationMinutes % 60 !== 0) return false
    const startTime = minutesToTime(startMinute)
    if (isPastSlot(selectedDate, startTime, currentTime)) return false

    const endMinute = startMinute + durationMinutes
    const coveredSlots = availability.slots.filter(
      (slot) => slot.startMinute >= startMinute && slot.endMinute <= endMinute,
    )
    return (
      coveredSlots.length === durationMinutes / availabilitySlotMinutes &&
      coveredSlots.every((slot) => slot.available) &&
      coveredSlots[0]?.startMinute === startMinute &&
      coveredSlots.at(-1)?.endMinute === endMinute
    )
  }
  const bookedSlotsToday = availableTimeSlots.filter(
    (time) => !canBookWindow(timeToMinutes(time), 60),
  )
  const getMaxBookableHours = (time: string) => {
    let hours = 0
    for (let durationHours = 1; durationHours <= maxAllowedSessionHours; durationHours += 1) {
      if (!canBookWindow(timeToMinutes(time), durationHours * 60)) break
      hours = durationHours
    }
    return hours
  }
  const maxSessionHoursForSelection = selectedStartTime
    ? Math.max(1, getMaxBookableHours(selectedStartTime))
    : maxAllowedSessionHours
  const isDateBooked = Boolean(
    availability &&
      (availability.isClosed ||
        availableTimeSlots.length === 0 ||
        bookedSlotsToday.length === availableTimeSlots.length),
  )

  /* ---------- Turunan ringkasan pesanan ---------- */
  const durationMinutes = selectedDurationMinutes
  const sessionCount = selectedStartTime ? durationMinutes / 60 : 0
  const startTime = selectedStartTime ?? ''
  const endTime = selectedStartTime
    ? minutesToTime(timeToMinutes(selectedStartTime) + durationMinutes)
    : ''
  const durationLabel = formatDuration(durationMinutes)
  const totalPrice = pricePreview?.basePrice ?? 0

  useEffect(() => {
    if (!resourceId || !selectedDate || !startTime || !endTime) {
      return
    }

    let active = true
    previewBookingPrice({
      resourceId,
      bookingDate: selectedDate,
      startTime,
      endTime,
      sportType,
      bookingType: 'regular',
    })
      .then((price) => { if (active) setPricePreview(price) })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, t('booking.priceCalculateFailed')))
      })
      .finally(() => { if (active) setIsPriceLoading(false) })

    return () => { active = false }
  }, [resourceId, selectedDate, startTime, endTime, sportType, t])

  let selectedDateLabel = '-'
  let selectedDayAndDate = '-'
  if (selectedDate) {
    const date = new Date(`${selectedDate}T00:00:00Z`)
    selectedDateLabel = new Intl.DateTimeFormat(i18n.language, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date)
    selectedDayAndDate = new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
    }).format(date)
  }

  /* ---------- Handler ---------- */
  const handleChangeMonth = (step: number) => {
    const next = new Date(viewYear, viewMonth + step, 1)
    const todayParts = getZonedParts(currentTime)
    const currentMonth = new Date(Number(todayParts.year), Number(todayParts.month) - 1, 1)
    if (next < currentMonth) return
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const handleSelectDate = (day: number) => {
    const dateKey = toDateKey(viewYear, viewMonth, day)
    if (dateKey < getTodayKey(currentTime)) return
    if (dateKey === selectedDate) return
    setSelectedDate(dateKey)
    setSelectedStartTime(null)
    setAvailability(null)
    setIsAvailabilityLoading(true)
    setPricePreview(null)
    setIsPriceLoading(false)
    setIsConfirmed(false)
  }

  const handleSelectStartTime = (time: string) => {
    if (bookedSlotsToday.includes(time) || isPastSlot(selectedDate ?? '', time, new Date())) return
    if (selectedStartTime === time) {
      setSelectedStartTime(null)
    } else {
      const maxHours = getMaxBookableHours(time)
      if (maxHours === 0 || (isSoccer && maxHours < 2)) return
      setSelectedStartTime(time)
      setSelectedDurationMinutes((current) => Math.min(current, maxHours * 60))
    }
    setPricePreview(null)
    setIsPriceLoading(selectedStartTime !== time)
    setIsConfirmed(false)
  }

  const handleChangeDuration = (durationMinutes: number) => {
    const minimumDurationMinutes = isSoccer ? 120 : 60
    const durationIncrementMinutes = isSoccer ? 120 : 60
    if (durationMinutes < minimumDurationMinutes || durationMinutes > maxSessionHoursForSelection * 60 || durationMinutes % durationIncrementMinutes !== 0) return
    if (selectedStartTime && !canBookWindow(timeToMinutes(selectedStartTime), durationMinutes)) return
    setSelectedDurationMinutes(durationMinutes)
    setPricePreview(null)
    setIsPriceLoading(Boolean(selectedStartTime && canBookWindow(timeToMinutes(selectedStartTime), durationMinutes)))
    setIsConfirmed(false)
  }

  const handleResetSearch = () => {
    // Tombol "Cari Lain": kosongkan pilihan supaya user memilih tanggal lain
    setSelectedDate(null)
    setSelectedStartTime(null)
    setAvailability(null)
    setIsAvailabilityLoading(false)
    setPricePreview(null)
    setIsPriceLoading(false)
    setIsConfirmed(false)
  }

  // Validasi jadwal dipakai bersama oleh desktop & mobile. Mengembalikan pesan error atau null
  const getScheduleError = (): string | null => {
    if (!resourceId) return t('booking.facilityNotSelected')
    if (!selectedDate) return t('booking.dateNotSelected')
    if (selectedDate < getTodayKey(new Date())) return t('booking.dateInPast')
    if (isAvailabilityLoading || !availability) return t('booking.availabilityLoading')
    if (isDateBooked) return t('booking.facilityUnavailable')
    if (!selectedStartTime) return t('booking.timeNotSelected')
    if (bookedSlotsToday.includes(selectedStartTime)) {
      return t('booking.slotUnavailable')
    }
    if (isPastSlot(selectedDate, selectedStartTime, new Date())) {
      return t('booking.timeInPast')
    }
    if (durationMinutes < (isSoccer ? 120 : 60) || durationMinutes % (isSoccer ? 120 : 60) !== 0 || !canBookWindow(timeToMinutes(selectedStartTime), durationMinutes)) {
      return t('booking.durationUnavailable')
    }
    if (isPriceLoading || !pricePreview) return t('booking.priceCalculating')
    return null
  }

  const reportScheduleError = (message: string) => {
    const hasAvailabilityConflict = Boolean(
      availability && (isDateBooked || (selectedStartTime && bookedSlotsToday.includes(selectedStartTime))),
    )
    if (hasAvailabilityConflict) setConflictMessage(message)
    else toast.error(message)
  }

  const handleConfirmSchedule = () => {
    const error = getScheduleError()
    if (error) {
      reportScheduleError(error)
      return
    }
    setIsConfirmed(true)
    setIsCheckoutModalOpen(true)
  }

  const goToPayment = () => {
    navigate('/payment', {
      state: {
        resourceId,
        sportType,
        bookingDate: selectedDate,
        facility,
        date: selectedDateLabel,
        time: startTime,
        endTime,
        total: totalPrice,
        durationMinutes,
        price: pricePreview,
      },
    })
  }

  const handleOrderNow = () => {
    if (!isConfirmed || !selectedDate) return
    goToPayment()
  }

  // Mobile tidak punya tombol "Konfirmasi Jadwal", jadi validasi dilakukan saat "Pesan Sekarang"
  const handleOrderNowMobile = () => {
    if (!selectedDate || sessionCount === 0) {
      openMobileSheetForSelection() // arahkan user memilih tanggal & jam dulu
      return
    }
    const error = getScheduleError()
    if (error) {
      reportScheduleError(error)
      return
    }
    goToPayment()
  }

  const handleSearchOtherMobile = () => {
    handleResetSearch()
    setIsSheetOpen(true)
  }

  const handleAddToCart = async () => {
    if (!selectedDate || sessionCount === 0) {
      openMobileSheetForSelection()
      return
    }

    const error = getScheduleError()
    if (error) {
      reportScheduleError(error)
      setIsSheetOpen(true)
      return
    }
    if (!resourceId) {
      toast.error(t('booking.facilityNotSelected'))
      return
    }

    const cartItem: CartItem = {
      id: `${facility.id}-${selectedDate}-${startTime}-${endTime}`,
      code: facility.id.split('-').at(-1)?.toUpperCase() ?? 'OBC',
      facilityName: facility.name,
      image: facilityImage,
      sportName: facility.name,
      schedule: `${startTime} - ${endTime}, ${selectedDateLabel}`,
      price: totalPrice,
      resourceId,
      bookingDate: selectedDate,
      startTime,
      endTime,
      sportType,
    }

    try {
      const backendItem = await addBackendCartItem({
        resourceId,
        bookingDate: selectedDate,
        startTime,
        endTime,
        sportType,
      })
      const persistedCartItem = { ...cartItem, id: backendItem.id }
      setCartItems((items) => {
        if (items.some((item) => item.resourceId === resourceId && item.bookingDate === selectedDate && item.startTime === startTime && item.endTime === endTime)) return items
        cartService.addItem(persistedCartItem)
        return [...items, persistedCartItem]
      })
      toast.success(t('booking.addScheduleToCart'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('booking.addScheduleToCartFailed')))
      return
    }
    setIsCheckoutModalOpen(false)
    setIsCartOpen(true)
  }

  return (
    <>
      {isMobile ? (
        <>
          <MobileHeader
            variant="title"
            title={t('booking.checkout')}
            showCart
            showShare
            showBottomNav={false}
          />
          <div className="min-h-[100dvh] bg-white font-body text-[#343133] px-4 pt-6 pb-52">
            <FacilityDetails
              variant="mobile"
              facilityName={facility.name}
              image={facilityImage}
              locationName={facility.location?.name}
              priceTiers={apiPriceTiers}
              isPriceLoading={isApiPriceLoading}
            />
            <DeferredSection placeholderClassName="min-h-[240px]">
              <TopSportReviews />
            </DeferredSection>
          </div>
          <Suspense fallback={null}>
            <MobileBookingSheet
              isOpen={isSheetOpen}
              onToggle={handleToggleMobileSheet}
              onClose={() => setIsSheetOpen(false)}
              onChangeMonth={handleChangeMonth}
              onSelectDate={handleSelectDate}
              onToggleTime={handleSelectStartTime}
              onChangeDuration={handleChangeDuration}
              onOrderNow={handleOrderNowMobile}
              onSearchOther={handleSearchOtherMobile}
              onAddToCart={handleAddToCart}
              viewYear={viewYear}
              viewMonth={viewMonth}
              selectedDate={selectedDate}
              selectedDateLabel={selectedDateLabel}
              bookedDates={BOOKED_DATES}
              bookedSlotsToday={bookedSlotsToday}
              availableTimeSlots={availableTimeSlots}
              isAvailabilityLoading={isAvailabilityLoading}
              selectedStartTime={selectedStartTime}
              durationMinutes={durationMinutes}
              isDateBooked={isDateBooked}
              sessionCount={sessionCount}
              durationLabel={durationLabel}
              startTime={startTime}
              endTime={endTime}
              totalPrice={totalPrice}
              maxSessionHours={maxSessionHoursForSelection}
              durationStepHours={durationStepHours}
            />
          </Suspense>
        </>
      ) : (
        <div className="min-h-screen bg-white font-body text-[#343133]">
          <NavbarDashboard showDesktopNavigation={false} showMobileHeader={false} showCart />

          <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
            <div className="grid items-start gap-12 lg:grid-cols-[736px_1fr]">
              <div>
                <FacilityDetails
                  variant="desktop"
                  facilityName={facility.name}
                  image={facilityImage}
                  locationName={facility.location?.name}
                  priceTiers={apiPriceTiers}
                  isPriceLoading={isApiPriceLoading}
                />
                <DeferredSection placeholderClassName="min-h-[240px]">
                  <TopSportReviews />
                </DeferredSection>
              </div>

              <div>
                <h2 className="font-heading text-2xl font-bold text-[#343133]">
                  {t('booking.chooseDateTime')}
                </h2>
                <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-[#343133]">
                  {t('booking.scheduleInstruction')}
                </p>
                <Suspense fallback={<div aria-hidden="true" className="min-h-[420px]" />}>
                  <BookingScheduleSelector
                    viewYear={viewYear}
                    viewMonth={viewMonth}
                    selectedDate={selectedDate}
                    selectedDateLabel={selectedDateLabel}
                    selectedDateText={t('booking.selectedDate')}
                    changeDateText={t('booking.changeDate')}
                    bookedDates={BOOKED_DATES}
                    bookedSlotsToday={bookedSlotsToday}
                    availableTimeSlots={availableTimeSlots}
                    isLoading={isAvailabilityLoading}
                    isDateBooked={isDateBooked}
                    selectedStartTime={selectedStartTime}
                    durationMinutes={durationMinutes}
                    sessionCount={sessionCount}
                    durationLabel={durationLabel}
                    startTime={startTime}
                    endTime={endTime}
                    maxSessionHours={maxSessionHoursForSelection}
                    durationStepHours={durationStepHours}
                    onChangeMonth={handleChangeMonth}
                    onSelectDate={handleSelectDate}
                    onToggleTime={handleSelectStartTime}
                    onChangeDuration={handleChangeDuration}
                    onResetDate={handleResetSearch}
                    onConfirmSchedule={handleConfirmSchedule}
                  />
                </Suspense>
              </div>
            </div>
          </main>

          <DeferredFooter />
        </div>
      )}

      <Suspense fallback={null}>
        {isCheckoutModalOpen && (
          <ModalCheckout
            isOpen={isCheckoutModalOpen}
            facility={facility.name}
            duration={durationMinutes / 60}
            dateTime={sessionCount > 0 ? `${selectedDayAndDate} (${startTime} - ${endTime})` : '-'}
            total={totalPrice}
            onClose={() => setIsCheckoutModalOpen(false)}
            onOrder={handleOrderNow}
            onAddToCart={handleAddToCart}
          />
        )}

        {isCartOpen && (
          <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onRemove={async (id) => {
              try {
                await removeBackendCartItem(id)
                cartService.removeItem(id)
                setCartItems((items) => items.filter((item) => item.id !== id))
                toast.success(t('booking.cartItemRemoved'))
              } catch (error) {
                toast.error(getApiErrorMessage(error, t('booking.cartItemRemoveFailed')))
              }
            }}
            onCheckout={(items) => {
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
              setIsCartOpen(false)
              navigate('/payment', { state: paymentState })
            }}
          />
        )}

        {conflictMessage && (
          <ScheduleConflict
            message={conflictMessage}
            onDismiss={() => setConflictMessage(null)}
            onReturnHome={() => navigate('/home')}
          />
        )}
      </Suspense>
    </>
  )
}

export default DetailOrder