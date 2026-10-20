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
import { getFacilityAvailability, type FacilityAvailability } from '../../services/facilityService'
import { previewBookingPrice, type BookingPrice } from '../../services/bookingService'
import { getApiErrorMessage } from '../../services/apiService'
import FacilityDetails from './checkout/FacilityDetails'
import { useIsMobile } from '../../hooks/useIsMobile'

const ScheduleConflict = lazy(() => import('./checkout/ScheduleConflict'))
const ModalCheckout = lazy(() => import('../../components/ui/ModalCheckout'))
const CartModal = lazy(() => import('../../components/ui/CartModal'))
const ReviewSection = lazy(() => import('./checkout/ReviewSection'))
const BookingCalendar = lazy(() => import('./checkout/BookingCalendar'))
const TimeSlotPicker = lazy(() => import('./checkout/TimeSlotPicker'))
const MobileBookingSheet = lazy(() => import('./checkout/MobileBookingSheet'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/bookingService.js)
   ------------------------------------------------------------------------- */
const MAX_SESSION_HOURS = 8

const BOOKED_DATES: string[] = []

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

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

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes === 0
    ? `${hours} Jam`
    : `${hours > 0 ? `${hours} Jam ` : ''}${remainingMinutes} Menit`
}

type CheckoutState = {
  resourceId?: string
  sportType?: string
  facility?: FacilityCard
}

function DetailOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const checkoutState = (location.state as CheckoutState | null) ?? {}
  const resourceId = checkoutState.resourceId
  const sportType = checkoutState.sportType ?? 'futsal'
  const facility = checkoutState.facility ?? {
    ...COURT_FACILITIES[0],
    description: COURT_FACILITIES[0].description,
    badge: 'TERSEDIA',
    buttonLabel: 'Booking Sekarang',
  }

  const [viewYear, setViewYear] = useState(() => Number(getZonedParts(new Date()).year))
  const [viewMonth, setViewMonth] = useState(() => Number(getZonedParts(new Date()).month) - 1)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    isMobile ? getTodayKey() : null,
  )
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(60)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [availability, setAvailability] = useState<FacilityAvailability | null>(null)
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true)
  const [pricePreview, setPricePreview] = useState<BookingPrice | null>(null)
  const [isPriceLoading, setIsPriceLoading] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!resourceId) navigate('/home', { replace: true })
  }, [navigate, resourceId])

  useEffect(() => {
    if (!resourceId || !selectedDate) return
    let active = true
    getFacilityAvailability(resourceId, selectedDate, sportType)
      .then((result) => { if (active) setAvailability(result) })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, 'Jadwal tidak dapat dimuat.'))
      })
      .finally(() => { if (active) setIsAvailabilityLoading(false) })

    return () => { active = false }
  }, [resourceId, selectedDate, sportType])

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
  const availableTimeSlots = availability?.slots.map((slot) => slot.startTime) ?? []
  const canBookWindow = (startMinute: number, durationMinutes: number) => {
    if (!availability || !selectedDate) return false
    const intervalMinutes = availability.startIntervalMinutes ?? 15
    const startTime = minutesToTime(startMinute)
    if (isPastSlot(selectedDate, startTime, currentTime)) return false

    const endMinute = startMinute + durationMinutes
    const coveredSlots = availability.slots.filter(
      (slot) => slot.startMinute >= startMinute && slot.endMinute <= endMinute,
    )
    return (
      coveredSlots.length === durationMinutes / intervalMinutes &&
      coveredSlots.every((slot) => slot.available) &&
      coveredSlots[0]?.startMinute === startMinute &&
      coveredSlots.at(-1)?.endMinute === endMinute
    )
  }
  const bookedSlotsToday = availableTimeSlots.filter(
    (time) => !canBookWindow(timeToMinutes(time), selectedDurationMinutes),
  )
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
  const totalPrice = pricePreview?.totalPrice ?? 0

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
        if (active) toast.error(getApiErrorMessage(error, 'Harga booking tidak dapat dihitung.'))
      })
      .finally(() => { if (active) setIsPriceLoading(false) })

    return () => { active = false }
  }, [resourceId, selectedDate, startTime, endTime, sportType])

  let selectedDateLabel = '-'
  let selectedDayAndDate = '-'
  if (selectedDate) {
    const [year, month, day] = selectedDate.split('-').map(Number)
    const dayName = DAY_NAMES[new Date(year, month - 1, day).getDay()]
    selectedDateLabel = `${dayName}, ${day} ${MONTH_NAMES[month - 1]} ${year}`
    selectedDayAndDate = `${dayName}, ${day} ${MONTH_NAMES[month - 1].slice(0, 3)}`
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
    setSelectedStartTime((current) => (current === time ? null : time))
    setPricePreview(null)
    setIsPriceLoading(selectedStartTime !== time)
    setIsConfirmed(false)
  }

  const handleChangeDuration = (durationMinutes: number) => {
    if (durationMinutes < 60 || durationMinutes > MAX_SESSION_HOURS * 60 || durationMinutes % 15 !== 0) return
    setSelectedDurationMinutes(durationMinutes)
    setSelectedStartTime((current) =>
      current && canBookWindow(timeToMinutes(current), durationMinutes) ? current : null,
    )
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
    if (!resourceId) return 'Pilih fasilitas terlebih dahulu.'
    if (!selectedDate) return 'Pilih tanggal terlebih dahulu.'
    if (selectedDate < getTodayKey(new Date())) return 'Tanggal yang dipilih sudah lewat. Pilih tanggal hari ini atau setelahnya.'
    if (isAvailabilityLoading || !availability) return 'Ketersediaan jadwal belum selesai dimuat.'
    if (isDateBooked) return 'Fasilitas tutup atau jadwal sudah penuh pada tanggal ini.'
    if (!selectedStartTime) return 'Pilih waktu mulai terlebih dahulu.'
    if (bookedSlotsToday.includes(selectedStartTime)) {
      return 'Salah satu slot sudah tidak tersedia. Muat ulang jadwal dan pilih waktu lain.'
    }
    if (isPastSlot(selectedDate, selectedStartTime, new Date())) {
      return 'Jam yang dipilih sudah lewat. Pilih waktu yang masih tersedia.'
    }
    if (durationMinutes < 60 || !canBookWindow(timeToMinutes(selectedStartTime), durationMinutes)) {
      return 'Durasi tidak tersedia sampai waktu selesai. Pilih waktu atau durasi lain.'
    }
    if (isPriceLoading || !pricePreview) return 'Harga booking belum selesai dihitung.'
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

  const handleAddToCart = () => {
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

    const cartItem: CartItem = {
      id: `${facility.id}-${selectedDate}-${startTime}-${endTime}`,
      code: facility.id.split('-').at(-1)?.toUpperCase() ?? 'OBC',
      facilityName: facility.name,
      sportName: facility.name,
      schedule: `${startTime} - ${endTime}, ${selectedDateLabel}`,
      price: totalPrice,
    }

    setCartItems((items) =>
      items.some((item) => item.id === cartItem.id) ? items : [...items, cartItem],
    )
    setIsCheckoutModalOpen(false)
    setIsCartOpen(true)
  }

  return (
    <>
      {isMobile ? (
        <>
          <MobileHeader
            variant="title"
            title="Checkout"
            showShare
            showBottomNav={false}
          />
          <div className="min-h-[100dvh] bg-white font-body text-[#343133] px-4 pt-6 pb-52">
            <FacilityDetails
              variant="mobile"
              facilityName={facility.name}
              image={facility.image}
              locationName={facility.location?.name}
            />
            <DeferredSection placeholderClassName="min-h-[240px]">
              <ReviewSection variant="mobile" />
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
              maxSessionHours={MAX_SESSION_HOURS}
            />
          </Suspense>
        </>
      ) : (
        <div className="min-h-screen bg-white font-body text-[#343133]">
          <NavbarDashboard showDesktopNavigation={false} showMobileHeader={false} />

          <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
            <div className="grid items-start gap-12 lg:grid-cols-[736px_1fr]">
              <div>
                <FacilityDetails
                  variant="desktop"
                  facilityName={facility.name}
                  image={facility.image}
                  locationName={facility.location?.name}
                />
                <DeferredSection placeholderClassName="min-h-[240px]">
                  <ReviewSection variant="desktop" />
                </DeferredSection>
              </div>

              <div>
                <h2 className="font-heading text-2xl font-bold text-[#343133]">
                  Pilih Tanggal &amp; Waktu Booking
                </h2>
                <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-[#343133]">
                  Silakan pilih tanggal yang tersedia (Hijau) dan jam latihan Anda. Tanggal
                  merah / soft-red sudah dibooking.
                </p>
                <Suspense fallback={<div aria-hidden="true" className="min-h-[420px]" />}>
                  {!selectedDate ? (
                    <BookingCalendar
                      variant="desktop"
                      viewYear={viewYear}
                      viewMonth={viewMonth}
                      selectedDate={selectedDate}
                      bookedDates={BOOKED_DATES}
                      onChangeMonth={handleChangeMonth}
                      onSelectDate={handleSelectDate}
                    />
                  ) : (
                    <>
                      <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[#D4D4D4] bg-white px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-xs text-[#6F6B6E]">Tanggal dipilih</p>
                          <p className="truncate font-heading text-sm font-bold text-[#343133]">
                            {selectedDateLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetSearch}
                          className="shrink-0 cursor-pointer rounded-lg border border-[#D4D4D4] px-3 py-2 font-heading text-xs font-bold text-[#265021] transition-colors hover:bg-[#F5FAF0]"
                        >
                          Ubah tanggal
                        </button>
                      </div>
                      <TimeSlotPicker
                        variant="desktop"
                        isDateBooked={isDateBooked}
                        bookedSlotsToday={bookedSlotsToday}
                        availableTimeSlots={availableTimeSlots}
                        isLoading={isAvailabilityLoading}
                        selectedStartTime={selectedStartTime}
                        durationMinutes={durationMinutes}
                        sessionCount={sessionCount}
                        durationLabel={durationLabel}
                        selectedDateLabel={selectedDateLabel}
                        startTime={startTime}
                        endTime={endTime}
                        maxSessionHours={MAX_SESSION_HOURS}
                        onToggleTime={handleSelectStartTime}
                        onChangeDuration={handleChangeDuration}
                        onConfirmSchedule={handleConfirmSchedule}
                        onResetSearch={handleResetSearch}
                      />
                    </>
                  )}
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
            onRemove={(id) => setCartItems((items) => items.filter((item) => item.id !== id))}
            onCheckout={(items) => {
              setIsCartOpen(false)
              navigate('/payment', {
                state: {
                  date: selectedDateLabel,
                  time: startTime,
                  endTime,
                  total: items.reduce((sum, item) => sum + item.price, 0),
                },
              })
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