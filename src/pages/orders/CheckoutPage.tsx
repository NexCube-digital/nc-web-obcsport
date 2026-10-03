import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bath,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Lightbulb,
  ParkingCircle,
  ShoppingBasket,
  Star,
  Utensils,
} from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import ScheduleConflict from '../../components/ui/ScheduleConflict'
import { COURT_FACILITIES } from '../../data/facilitiesData'
import lapangF1 from '../../assets/layanan/Lapang F1.png'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type ReviewCategory = 'lapangan' | 'wc'
type ReviewFilter = 'semua' | ReviewCategory

interface PriceTier {
  id: string
  range: string
  price: string
}

interface FacilityChip {
  id: string
  label: string
  icon: React.ReactNode
}

interface Review {
  id: string
  name: string
  category: ReviewCategory
  text: string
}

interface FilterOption {
  id: ReviewFilter
  label: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/bookingService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// TODO: data fasilitas di bawah ini sementara statis, ambil dari API sesuai id lapangan
const COURT_NAME = 'Lapangan F1'
const COURT_CATEGORY = 'Futsal Premium'
const COURT_RATING = '4.8 / 5.0'
const COURT_REVIEW_COUNT = '(120 Ulasan Terverifikasi)'

const PRICE_TIERS: PriceTier[] = [
  { id: 'pagi', range: '07:00-15:00', price: '125k/jam' },
  { id: 'sore', range: '15:00-18:00', price: '150k/jam' },
  { id: 'malam', range: '18:00-00:00', price: '175k/jam' },
]

const FACILITY_CHIPS: FacilityChip[] = [
  { id: 'toilet', label: 'Toilet T3-T5', icon: <Bath size={11} /> },
  { id: 'led', label: 'LED Light', icon: <Lightbulb size={11} /> },
  { id: 'foodcourt', label: 'Foodcourt', icon: <Utensils size={11} /> },
  { id: 'mushola', label: 'Mushola', icon: <Landmark size={11} /> },
  { id: 'parkir', label: 'Parkir', icon: <ParkingCircle size={11} /> },
]

const REVIEW_TEXT =
  'Kondisi lapangan sangat prima, interlock-nya rapi tidak licin sama sekali. Kamar mandi juga bersih setelah direnovasi. Sangat direkomendasikan untuk mabar malam.'

const REVIEWS: Review[] = [
  { id: 'r1', name: 'Budi Santoso', category: 'lapangan', text: REVIEW_TEXT },
  { id: 'r2', name: 'Budi Santoso', category: 'wc', text: REVIEW_TEXT },
  { id: 'r3', name: 'Budi Santoso', category: 'lapangan', text: REVIEW_TEXT },
  { id: 'r4', name: 'Budi Santoso', category: 'wc', text: REVIEW_TEXT },
  { id: 'r5', name: 'Budi Santoso', category: 'lapangan', text: REVIEW_TEXT },
]

const REVIEW_FILTERS: FilterOption[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'lapangan', label: 'Kondisi Lapangan' },
  { id: 'wc', label: 'Kebersihan WC' },
]

// Jam yang ditampilkan di grid pilihan waktu (sesuai desain)
const TIME_SLOTS: string[] = [
  '05:00', '07:00', '08:00', '09:00', '11:00',
  '13:00', '15:00', '17:00', '19:00', '21:00',
]

// TODO: data booking di bawah ini sementara hardcode, ganti dari API ketersediaan jadwal
const BOOKED_DATES: string[] = ['2026-01-05', '2026-01-10'] // tanggal yang penuh seharian
const BOOKED_SLOTS: Record<string, string[]> = {
  '2026-01-12': ['15:00'], // jam yang sudah dibooking pada tanggal tertentu
}

const DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
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

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

const hourOf = (time: string) => Number(time.split(':')[0])

const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`

// Harga per jam mengikuti tarif: 07-15 = 125k, 15-18 = 150k, selebihnya 175k
// Catatan: jam 05:00 belum punya tarif di desain, sementara memakai tarif pagi
const priceOfHour = (hour: number) => {
  if (hour < 15) return 125000
  if (hour < 18) return 150000
  return 175000
}

function Stars({ size = 16 }: { size?: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          size={size}
          className={index < 4 ? 'text-[#F5B301]' : 'text-[#D4D4D4]'}
        />
      ))}
    </div>
  )
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
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('semua')
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  /* ---------- Turunan data kalender ---------- */
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const leadingBlanks = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7 // minggu mulai Senin
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

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

  const filteredReviews = REVIEWS.filter(
    (review) => reviewFilter === 'semua' || review.category === reviewFilter,
  )

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

  const handleConfirmSchedule = () => {
    if (sessionCount === 0) {
      setConflictMessage('Pilih minimal satu sesi waktu terlebih dahulu.')
      return
    }
    // Jam yang dipilih harus berurutan, kalau tidak jadwal dianggap bentrok
    const isConsecutive = sortedHours.every(
      (hour, index) => index === 0 || hour - sortedHours[index - 1] === 1,
    )
    if (!isConsecutive) {
      setConflictMessage('Jam yang dipilih harus berurutan dalam satu sesi.')
      return
    }
    setIsConfirmed(true)
  }

  const handleOrderNow = () => {
    if (!isConfirmed || !selectedDate) return
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

  const handleAddToCart = () => {
    // TODO: sambungkan ke keranjang (services/cartService.js)
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
        <div className="grid lg:grid-cols-[736px_1fr] gap-12 items-start">
          {/* ================= Kolom kiri: detail lapangan ================= */}
          <div>
            <img
              src={lapangF1}
              alt={COURT_NAME}
              className="h-[364px] w-full rounded-xl object-cover"
            />

            <h1 className="mt-6 font-heading font-bold text-2xl text-[#343133]">{COURT_NAME}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Stars size={16} />
              <span className="font-heading font-semibold text-sm text-[#343133]">
                {COURT_RATING}
              </span>
              <span className="text-sm text-[#343133]">{COURT_REVIEW_COUNT}</span>
            </div>

            {/* Tarif per rentang jam */}
            <div className="mt-6 grid grid-cols-3 gap-1.5">
              {PRICE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-md border border-[#D4D4D4] bg-white px-1.5 py-1"
                >
                  <p className="font-heading font-bold text-[10px] leading-tight text-[#121212]">
                    {tier.range}
                  </p>
                  <p className="font-heading font-bold text-[11px] leading-tight text-[#265021]">
                    {tier.price}
                  </p>
                </div>
              ))}
            </div>

            {/* Fasilitas lapangan */}
            <h2 className="mt-6 font-heading font-bold text-xs text-[#265021]">
              Fasilitas Lapangan
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {FACILITY_CHIPS.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] bg-white px-2 py-1 text-[11px] text-[#343133]"
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ))}
            </div>

            {/* Ulasan pengguna */}
            <h2 className="mt-6 font-heading font-bold text-base text-[#343133]">
              Ulasan Pengguna
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {REVIEW_FILTERS.map((filter) => {
                const isActive = reviewFilter === filter.id
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setReviewFilter(filter.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-heading font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#CDF178] border-[#CDF178] text-[#404F14]'
                        : 'bg-white border-[#404F14] text-[#404F14] hover:bg-[#F5FAF3]'
                    }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 space-y-2">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-[#D4D4D4] bg-white px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-heading font-bold text-xs text-[#121212]">
                      {review.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Stars size={16} />
                      <span className="font-heading font-semibold text-sm text-[#343133]">
                        5.0 / 5.0
                      </span>
                      <span className="text-sm text-[#343133]">(1 Ulasan Terverifikasi)</span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#343133]">{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ================= Kolom kanan: jadwal & pemesanan ================= */}
          <div>
            <h2 className="font-heading font-bold text-2xl text-[#343133]">
              Pilih Tanggal &amp; Waktu Booking
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#343133] max-w-[320px]">
              Silakan pilih tanggal yang tersedia (Hijau) dan jam latihan Anda. Tanggal
              merah / soft-red sudah dibooking.
            </p>

            {/* Kalender */}
            <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-5 pb-8">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-[#343133]">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Bulan sebelumnya"
                    onClick={() => handleChangeMonth(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F6EF] text-[#121212] cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Bulan berikutnya"
                    onClick={() => handleChangeMonth(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F6EF] text-[#121212] cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Legenda */}
              <div className="mt-4 flex items-center gap-4 text-[11px] text-[#343133]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm border border-[#121212] bg-white" />
                  Tersedia
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-[#E02424]" />
                  Booked
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-[#F59E0B]" />
                  Pilihan Anda
                </span>
              </div>

              {/* Header hari */}
              <div className="mt-4 grid grid-cols-7 gap-2">
                {DAY_HEADERS.map((day) => (
                  <span
                    key={day}
                    className="rounded bg-[#FDFCF7] py-1 text-center font-heading font-bold text-[11px] text-[#121212]"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Tanggal */}
              <div className="mt-3 grid grid-cols-7 gap-x-2 gap-y-2.5">
                {calendarCells.map((day, index) => {
                  if (day === null) return <span key={`blank-${index}`} />
                  const key = toDateKey(viewYear, viewMonth, day)
                  const isBooked = BOOKED_DATES.includes(key)
                  const isSelected = selectedDate === key

                  let style = 'bg-[#E8EBE4] border-[#D4D4D4] text-[#121212]'
                  if (isBooked) style = 'bg-[#FDE8E8] border-[#F5B5B5] text-[#E02424]'
                  if (isSelected && !isBooked) {
                    style = 'bg-[#FFF4D6] border-[#F59E0B] border-2 text-[#D97706]'
                  }
                  if (isSelected && isBooked) {
                    style = 'bg-[#FDE8E8] border-[#9CA3AF] border-2 text-[#E02424]'
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={`h-9 rounded-md border text-xs font-heading font-bold transition-colors cursor-pointer ${style}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Jadwal penuh ATAU pilihan waktu + ringkasan */}
            {isDateBooked ? (
              <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-6">
                <h3 className="font-heading font-bold text-xl text-[#E02424]">
                  Maaf, Jadwal Penuh
                </h3>
                <p className="mt-6 max-w-[300px] text-sm leading-relaxed text-[#343133]">
                  Seluruh sesi untuk fasilitas ini pada tanggal yang dipilih telah
                  terpesona penuh. Silakan cek ketersediaan untuk tanggal lain atau pilih
                  kategori olahraga alternatif di bawah ini
                </p>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="mt-5 w-full h-10 rounded-md bg-[#E8302F] text-sm font-heading font-medium text-white hover:bg-[#C41717] transition-colors cursor-pointer"
                >
                  Cari Lain
                </button>
              </section>
            ) : (
              <>
                <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-5">
                  <h3 className="font-heading font-bold text-lg text-[#343133]">
                    Pilih Waktu (05:00 - 22:00)
                  </h3>

                  <div className="mt-4 grid grid-cols-[repeat(3,100px)] gap-2">
                    {TIME_SLOTS.map((time) => {
                      const isBooked = bookedSlotsToday.includes(time)
                      const isSelected = selectedTimes.includes(time)

                      let style = 'bg-[#FDFCF7] border-[#E5E5E5] text-[#121212] hover:border-[#9AAD3E]'
                      if (isSelected) style = 'bg-[#CDF178] border-[#9AAD3E] text-[#404F14] font-bold'
                      if (isBooked) style = 'bg-[#FDE8E8] border-[#E02424] text-[#E02424] cursor-not-allowed'

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleToggleTime(time)}
                          className={`h-9 rounded-md border text-xs font-heading transition-colors cursor-pointer ${style}`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>

                  {/* Ringkasan sesi terpilih */}
                  <div className="mt-6 border-t border-[#D4D4D4] pt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#343133]">Sesi Terpilih:</span>
                      <span className="font-heading font-bold text-[#121212]">
                        {sessionCount > 0 ? `${sessionCount} Sesi (${sessionCount} Jam)` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#343133]">Tanggal:</span>
                      <span className="font-heading font-bold text-[#265021]">
                        {selectedDateLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#343133]">Jam:</span>
                      <span className="font-heading font-bold text-[#265021]">
                        {sessionCount > 0 ? `${startTime} - ${endTime}` : '-'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmSchedule}
                    className="mt-4 w-full h-10 rounded-md bg-[#CDF178] text-xs font-heading font-bold text-[#121212] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
                  >
                    Konfirmasi Jadwal
                  </button>
                </section>

                {/* Ringkasan pemesanan */}
                <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white px-6 pt-5 pb-10">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#343133]">Fasilitas</span>
                      <span className="font-heading font-bold text-[#121212]">
                        {COURT_CATEGORY}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#343133]">Durasi</span>
                      <span className="font-heading font-bold text-[#121212]">
                        {sessionCount > 0 ? `${sessionCount} Jam` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#343133] shrink-0">Tanggal &amp; Waktu</span>
                      <span className="font-heading font-bold text-[#121212] text-right">
                        {sessionCount > 0
                          ? `${selectedDayAndDate} (${startTime} - ${endTime})`
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#D4D4D4] pt-4">
                    <span className="font-heading font-bold text-sm text-[#121212]">
                      Total Bayar
                    </span>
                    <span className="font-heading font-bold text-2xl text-[#265021]">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>

                  <h3 className="mt-5 font-heading font-bold text-lg text-[#343133]">
                    Ringkasan Pemesanan
                  </h3>

                  <div className="mt-5 flex items-center gap-3 pl-2">
                    <button
                      type="button"
                      disabled={!isConfirmed}
                      onClick={handleOrderNow}
                      className="flex-1 h-10 rounded-md bg-[#CDF178] text-xs font-heading font-bold text-[#121212] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#CDF178]"
                    >
                      Pesan Sekarang
                    </button>
                    <button
                      type="button"
                      aria-label="Tambah ke keranjang"
                      onClick={handleAddToCart}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#6F6B6E] shadow-[0_2px_6px_rgba(0,0,0,0.1)] hover:text-[#404F14] transition-colors cursor-pointer"
                    >
                      <ShoppingBasket size={18} />
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <ScheduleConflict
        message={conflictMessage}
        onDismiss={() => setConflictMessage(null)}
        onReturnHome={() => navigate('/home')}
      />
    </div>
  )
}

export default DetailOrder