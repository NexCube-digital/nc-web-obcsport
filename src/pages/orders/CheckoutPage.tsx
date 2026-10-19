import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import type { CartItem } from '../../components/ui/CartModal'
import { COURT_FACILITIES } from '../../data/facilitiesData'
import type { FacilityCard } from '../home/Court'
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
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

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

const getTodayKey = (date = new Date()) => {
  const today = date
  return toDateKey(today.getFullYear(), today.getMonth(), today.getDate())
}

const isPastSlot = (date: string, time: string, now: Date) => {
  if (date < getTodayKey(now)) return true
  if (date > getTodayKey(now)) return false
  return timeToMinutes(time) <= now.getHours() * 60 + now.getMinutes()
}

const formatDuration = (minutes: number) => {
  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toLocaleString('id-ID')} Jam`
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

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [currentTime, setCurrentTime] = useState(() => new Date())

  const [selectedDate, setSelectedDate] = useState<string | null>(() => getTodayKey())
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
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
        if (active) setConflictMessage(getApiErrorMessage(error, 'Jadwal tidak dapat dimuat.'))
      })
      .finally(() => { if (active) setIsAvailabilityLoading(false) })

    return () => { active = false }
  }, [resourceId, selectedDate, sportType])

  // State khusus mobile: bottom sheet pilih tanggal & jam
  const [isSheetOpen, setIsSheetOpen] = useState(false)

    const openMobileSheetForSelection = () => {
      setSelectedDate(null)
      setSelectedTimes([])
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
  const isDateBooked = Boolean(
    availability && (availability.isClosed || availability.slots.length === 0 || availability.counts.available === 0),
  )
  const bookedSlotsToday = availability?.slots
    .filter((slot) => !slot.available || isPastSlot(selectedDate ?? '', slot.startTime, currentTime))
    .map((slot) => slot.startTime) ?? []
  const availableTimeSlots = availability?.slots.map((slot) => slot.startTime) ?? []

  /* ---------- Turunan ringkasan pesanan ---------- */
  const sortedTimes = [...selectedTimes].sort((left, right) => timeToMinutes(left) - timeToMinutes(right))
  const sessionCount = sortedTimes.length
  const slotMinutes = availability?.slotMinutes ?? facility.slotMinutes ?? 60
  const selectedSlots = sortedTimes
    .map((time) => availability?.slots.find((slot) => slot.startTime === time))
    .filter((slot) => slot !== undefined)
  const startTime = sortedTimes[0] ?? ''
  const endTime = selectedSlots.at(-1)?.endTime ?? ''
  const durationMinutes = sessionCount * slotMinutes
  const durationLabel = formatDuration(durationMinutes)
  const isConsecutive = sortedTimes.every(
    (time, index) => index === 0 || timeToMinutes(time) - timeToMinutes(sortedTimes[index - 1]) === slotMinutes,
  )
  const totalPrice = pricePreview?.totalPrice ?? 0
  const selectedTimesKey = sortedTimes.join(',')

  useEffect(() => {
    if (!resourceId || !selectedDate || !startTime || !endTime || !isConsecutive || !sessionCount) {
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
        if (active) setConflictMessage(getApiErrorMessage(error, 'Harga booking tidak dapat dihitung.'))
      })
      .finally(() => { if (active) setIsPriceLoading(false) })

    return () => { active = false }
  }, [resourceId, selectedDate, startTime, endTime, sportType, isConsecutive, sessionCount, selectedTimesKey])

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
    const currentMonth = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1)
    if (next < currentMonth) return
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const handleSelectDate = (day: number) => {
    const dateKey = toDateKey(viewYear, viewMonth, day)
    if (dateKey < getTodayKey(currentTime)) return
    if (dateKey === selectedDate) return
    setSelectedDate(dateKey)
    setSelectedTimes([])
    setAvailability(null)
    setIsAvailabilityLoading(true)
    setPricePreview(null)
    setIsPriceLoading(false)
    setIsConfirmed(false)
  }

  const handleToggleTime = (time: string) => {
    if (bookedSlotsToday.includes(time) || isPastSlot(selectedDate ?? '', time, new Date())) return
    const nextTimes = selectedTimes.includes(time)
      ? selectedTimes.filter((item) => item !== time)
      : [...selectedTimes, time]
    if (nextTimes.length * slotMinutes > MAX_SESSION_HOURS * 60) {
      setConflictMessage(`Maksimal ${MAX_SESSION_HOURS} jam per pesanan.`)
      return
    }
    const nextSorted = [...nextTimes].sort((left, right) => timeToMinutes(left) - timeToMinutes(right))
    const nextIsConsecutive = nextSorted.every(
      (item, index) => index === 0 || timeToMinutes(item) - timeToMinutes(nextSorted[index - 1]) === slotMinutes,
    )
    setSelectedTimes(nextTimes)
    setPricePreview(null)
    setIsPriceLoading(nextSorted.length > 0 && nextIsConsecutive)
    setIsConfirmed(false)
  }

  const handleResetSearch = () => {
    // Tombol "Cari Lain": kosongkan pilihan supaya user memilih tanggal lain
    setSelectedDate(null)
    setSelectedTimes([])
    setAvailability(null)
    setIsAvailabilityLoading(false)
    setPricePreview(null)
    setIsPriceLoading(false)
    setIsConfirmed(false)
  }

  // Validasi jadwal dipakai bersama oleh desktop & mobile. Mengembalikan pesan error atau null
  const getScheduleError = (): string | null => {
    if (!resourceId) return 'Pilih fasilitas terlebih dahulu.'
    if (selectedDate && selectedDate < getTodayKey(new Date())) return 'Tanggal yang dipilih sudah lewat. Pilih tanggal hari ini atau setelahnya.'
    if (isAvailabilityLoading || !availability) return 'Ketersediaan jadwal belum selesai dimuat.'
    if (isDateBooked) return 'Fasilitas tutup atau jadwal sudah penuh pada tanggal ini.'
    if (sessionCount === 0) return 'Pilih minimal satu sesi waktu terlebih dahulu.'
    if (!isConsecutive) return 'Jam yang dipilih harus berurutan dalam satu sesi.'
    if (selectedSlots.length !== sessionCount || selectedSlots.some((slot) => !slot.available)) {
      return 'Salah satu slot sudah tidak tersedia. Muat ulang jadwal dan pilih waktu lain.'
    }
    if (selectedTimes.some((time) => isPastSlot(selectedDate, time, new Date()))) {
      return 'Jam yang dipilih sudah lewat. Pilih waktu yang masih tersedia.'
    }
    if (isPriceLoading || !pricePreview) return 'Harga booking belum selesai dihitung.'
    return null
  }

  const handleConfirmSchedule = () => {
    const error = getScheduleError()
    if (error) {
      setConflictMessage(error)
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
      setConflictMessage(error)
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
      setConflictMessage(error)
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
              onToggleTime={handleToggleTime}
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
              selectedTimes={selectedTimes}
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
          <NavbarDashboard userName={USER_NAME} showDesktopNavigation={false} showMobileHeader={false} />

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
                  <BookingCalendar
                    variant="desktop"
                    viewYear={viewYear}
                    viewMonth={viewMonth}
                    selectedDate={selectedDate}
                    bookedDates={BOOKED_DATES}
                    onChangeMonth={handleChangeMonth}
                    onSelectDate={handleSelectDate}
                  />
                  <TimeSlotPicker
                    variant="desktop"
                    isDateBooked={isDateBooked}
                    bookedSlotsToday={bookedSlotsToday}
                    availableTimeSlots={availableTimeSlots}
                    isLoading={isAvailabilityLoading}
                    selectedTimes={selectedTimes}
                    sessionCount={sessionCount}
                    durationLabel={durationLabel}
                    selectedDateLabel={selectedDateLabel}
                    startTime={startTime}
                    endTime={endTime}
                    maxSessionHours={MAX_SESSION_HOURS}
                    onToggleTime={handleToggleTime}
                    onConfirmSchedule={handleConfirmSchedule}
                    onResetSearch={handleResetSearch}
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