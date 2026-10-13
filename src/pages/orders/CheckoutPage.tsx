import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import Footer from '../../components/layout/LandingFooter'
import ScheduleConflict from './checkout/ScheduleConflict'
import ModalCheckout from '../../components/ui/ModalCheckout'
import CartModal, { type CartItem } from '../../components/ui/CartModal'
import { COURT_FACILITIES } from '../../data/facilitiesData'
import FacilityDetails from './checkout/FacilityDetails'
import ReviewSection from './checkout/ReviewSection'
import BookingCalendar from './checkout/BookingCalendar'
import TimeSlotPicker from './checkout/TimeSlotPicker'
import MobileBookingSheet from './checkout/MobileBookingSheet'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/bookingService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// TODO: data fasilitas di bawah ini sementara statis, ambil dari API sesuai id lapangan
const COURT_CATEGORY = 'Futsal Premium'
const MAX_SESSION_HOURS = 10

// TODO: data booking di bawah ini sementara hardcode, ganti dari API ketersediaan jadwal
const BOOKED_DATES: string[] = ['2026-01-05', '2026-01-10'] // tanggal yang penuh seharian
const BOOKED_SLOTS: Record<string, string[]> = {
  '2026-01-12': ['15:00'], // jam yang sudah dibooking pada tanggal tertentu
}

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

const hourOf = (time: string) => Number(time.split(':')[0])

const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`

// Harga per jam mengikuti tarif: 07-15 = 125k, 15-18 = 150k, selebihnya 175k
// Catatan: jam 05:00 belum punya tarif di desain, sementara memakai tarif pagi
const priceOfHour = (hour: number) => {
  if (hour < 15) return 125000
  if (hour < 18) return 150000
  return 175000
}

type CheckoutState = {
  facility?: (typeof COURT_FACILITIES)[number]
}

function DetailOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const facility =
    (location.state as CheckoutState | null)?.facility ?? COURT_FACILITIES[0]

  // Bulan yang tampil di kalender (awal: Januari 2026 sesuai desain)
  // TODO: ganti ke bulan berjalan dan nonaktifkan tanggal yang sudah lewat
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(0)

  // Pilihan awal mengikuti desain: 12 Januari, jam 08:00 dan 09:00
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-01-12')
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00', '09:00'])
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  // State khusus mobile: bottom sheet pilih tanggal & jam
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  /* ---------- Turunan data kalender ---------- */
  const isDateBooked = selectedDate !== null && BOOKED_DATES.includes(selectedDate)
  const bookedSlotsToday = selectedDate ? BOOKED_SLOTS[selectedDate] ?? [] : []

  /* ---------- Turunan ringkasan pesanan ---------- */
  const sortedHours = selectedTimes.map(hourOf).sort((a, b) => a - b)
  const sessionCount = sortedHours.length
  const startTime = sessionCount > 0 ? formatHour(sortedHours[0]) : ''
  const endTime = sessionCount > 0 ? formatHour(sortedHours[sessionCount - 1] + 1) : ''
  const totalPrice = sortedHours.reduce((sum, hour) => sum + priceOfHour(hour), 0)

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
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const handleSelectDate = (day: number) => {
    setSelectedDate(toDateKey(viewYear, viewMonth, day))
    setSelectedTimes([])
    setIsConfirmed(false)
  }

  const handleToggleTime = (time: string) => {
    if (bookedSlotsToday.includes(time)) return
    if (!selectedTimes.includes(time) && selectedTimes.length >= MAX_SESSION_HOURS) {
      setConflictMessage(`Maksimal ${MAX_SESSION_HOURS} jam per pesanan.`)
      return
    }
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((item) => item !== time) : [...prev, time],
    )
    setIsConfirmed(false)
  }

  const handleResetSearch = () => {
    // Tombol "Cari Lain": kosongkan pilihan supaya user memilih tanggal lain
    setSelectedDate(null)
    setSelectedTimes([])
    setIsConfirmed(false)
  }

  // Validasi jadwal dipakai bersama oleh desktop & mobile. Mengembalikan pesan error atau null
  const getScheduleError = (): string | null => {
    if (sessionCount === 0) return 'Pilih minimal satu sesi waktu terlebih dahulu.'
    // Jam yang dipilih harus berurutan, kalau tidak jadwal dianggap bentrok
    const isConsecutive = sortedHours.every(
      (hour, index) => index === 0 || hour - sortedHours[index - 1] === 1,
    )
    if (!isConsecutive) return 'Jam yang dipilih harus berurutan dalam satu sesi.'
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

  const goToCheckout = () => {
    // TODO: sesuaikan route checkout. Halaman checkout saat ini menulis jam akhir
    // secara tetap ("-09:00"), jadi perlu dibaca dari endTime di state ini.
    navigate('/checkout', {
      state: {
        facility,
        date: selectedDateLabel,
        time: startTime,
        endTime,
        total: totalPrice,
      },
    })
  }

  const handleOrderNow = () => {
    if (!isConfirmed || !selectedDate) return
    goToCheckout()
  }

  // Mobile tidak punya tombol "Konfirmasi Jadwal", jadi validasi dilakukan saat "Pesan Sekarang"
  const handleOrderNowMobile = () => {
    if (!selectedDate || sessionCount === 0) {
      setIsSheetOpen(true) // arahkan user memilih tanggal & jam dulu
      return
    }
    const error = getScheduleError()
    if (error) {
      setConflictMessage(error)
      return
    }
    goToCheckout()
  }

  const handleSearchOtherMobile = () => {
    handleResetSearch()
    setIsSheetOpen(true)
  }

  const handleAddToCart = () => {
    if (!selectedDate || sessionCount === 0) {
      setIsSheetOpen(true)
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
      facilityName: facility.courtName,
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
      <MobileHeader
        variant="title"
        title="Kembali"
        showShare
        showBottomNav={false}
      />
      <div className="md:hidden min-h-[100dvh] bg-white font-body text-[#343133] px-4 pt-6 pb-52">
        <FacilityDetails />
        <ReviewSection />
      </div>
      <MobileBookingSheet
        isOpen={isSheetOpen}
        onToggle={() => setIsSheetOpen((open) => !open)}
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
        selectedTimes={selectedTimes}
        isDateBooked={isDateBooked}
        sessionCount={sessionCount}
        startTime={startTime}
        endTime={endTime}
        totalPrice={totalPrice}
        maxSessionHours={MAX_SESSION_HOURS}
      />

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      <div className="hidden md:block min-h-screen bg-white font-body text-[#343133]">
        <NavbarDashboard userName={USER_NAME} showDesktopNavigation={false} />

        {/* Lebar konten 1200px sesuai desain */}
        <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
          <div className="grid items-start gap-12 lg:grid-cols-[736px_1fr]">
            <div>
              <FacilityDetails />
              <ReviewSection />
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-[#343133]">
                Pilih Tanggal &amp; Waktu Booking
              </h2>
              <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-[#343133]">
                Silakan pilih tanggal yang tersedia (Hijau) dan jam latihan Anda. Tanggal
                merah / soft-red sudah dibooking.
              </p>
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
                selectedTimes={selectedTimes}
                sessionCount={sessionCount}
                selectedDateLabel={selectedDateLabel}
                startTime={startTime}
                endTime={endTime}
                maxSessionHours={MAX_SESSION_HOURS}
                onToggleTime={handleToggleTime}
                onConfirmSchedule={handleConfirmSchedule}
                onResetSearch={handleResetSearch}
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <ModalCheckout
        isOpen={isCheckoutModalOpen}
        facility={COURT_CATEGORY}
        duration={sessionCount}
        dateTime={sessionCount > 0 ? `${selectedDayAndDate} (${startTime} - ${endTime})` : '-'}
        total={totalPrice}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrder={handleOrderNow}
        onAddToCart={handleAddToCart}
      />

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

      <ScheduleConflict
        message={conflictMessage}
        onDismiss={() => setConflictMessage(null)}
        onReturnHome={() => navigate('/home')}
      />
    </>
  )
}

export default DetailOrder