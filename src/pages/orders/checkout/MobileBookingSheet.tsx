import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, Clock, ShoppingCart } from 'lucide-react'
import BookingCalendar from './BookingCalendar'
import TimeSlotPicker from './TimeSlotPicker'

interface MobileBookingSheetProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onChangeMonth: (step: number) => void
  onSelectDate: (day: number) => void
  onToggleTime: (time: string) => void
  onChangeDuration: (durationMinutes: number) => void
  onOrderNow: () => void
  onSearchOther: () => void
  onAddToCart: () => void
  viewYear: number
  viewMonth: number
  selectedDate: string | null
  selectedDateLabel: string
  bookedDates: string[]
  bookedSlotsToday: string[]
  availableTimeSlots?: string[]
  isAvailabilityLoading?: boolean
  selectedStartTime: string | null
  durationMinutes: number
  isDateBooked: boolean
  sessionCount: number
  durationLabel?: string
  startTime: string
  endTime: string
  totalPrice: number
  maxSessionHours: number
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

// Perkiraan awal tinggi bar bawah sebelum diukur
const DEFAULT_BAR_HEIGHT = 140
// Jarak aman dari atas layar agar sheet tidak menempel ke status bar
const TOP_GAP = 16

function MobileBookingSheet({
  isOpen,
  onToggle,
  onClose,
  onChangeMonth,
  onSelectDate,
  onToggleTime,
  onChangeDuration,
  onOrderNow,
  onSearchOther,
  onAddToCart,
  viewYear,
  viewMonth,
  selectedDate,
  selectedDateLabel,
  bookedDates,
  bookedSlotsToday,
  availableTimeSlots,
  isAvailabilityLoading,
  selectedStartTime,
  durationMinutes,
  isDateBooked,
  sessionCount,
  durationLabel,
  startTime,
  endTime,
  totalPrice,
  maxSessionHours,
}: MobileBookingSheetProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [barHeight, setBarHeight] = useState(DEFAULT_BAR_HEIGHT)

  // Ukur tinggi bar bawah secara dinamis (termasuk safe area & perubahan konten)
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const updateHeight = () => setBarHeight(bar.offsetHeight)
    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="md:hidden">
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Pilih tanggal dan waktu bertanding"
            style={{
              bottom: barHeight,
              maxHeight: `calc(100dvh - ${barHeight}px - ${TOP_GAP}px)`,
            }}
            className="fixed inset-x-0 z-40 flex flex-col overflow-hidden rounded-t-3xl bg-white"
          >
            {/* Header tetap di atas, tidak ikut ter-scroll */}
            <div className="shrink-0 px-4 pt-5 pb-2">
              <h2 className="text-center font-heading text-base font-bold text-[#343133]">
                {selectedDate ? 'Pilih Waktu Main' : 'Pilih Tanggal Main'}
              </h2>

              {selectedDate && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-xs text-[#6F6B6E]">{selectedDateLabel}</p>
                  <button
                    type="button"
                    onClick={onSearchOther}
                    className="shrink-0 cursor-pointer whitespace-nowrap py-1 text-xs font-heading font-bold leading-normal text-[#265021] underline underline-offset-2"
                  >
                    Ubah tanggal
                  </button>
                </div>
              )}
            </div>

            {/* Isi sheet bisa di-scroll jika layar pendek */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
              {selectedDate ? (
                <TimeSlotPicker
                  variant="mobile"
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
                  maxSessionHours={maxSessionHours}
                  onToggleTime={onToggleTime}
                  onChangeDuration={onChangeDuration}
                />
              ) : (
                <BookingCalendar
                  variant="mobile"
                  viewYear={viewYear}
                  viewMonth={viewMonth}
                  selectedDate={selectedDate}
                  bookedDates={bookedDates}
                  onChangeMonth={onChangeMonth}
                  onSelectDate={onSelectDate}
                />
              )}
            </div>
          </div>
        </>
      )}

      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E5E5E5] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#D9E3CC] bg-[#F5FAF0] px-2 cursor-pointer"
          >
            <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#DDEBCB] px-2 py-1.5 text-[#265021]">
              <CalendarDays size={16} />
              <Clock size={16} />
            </span>
            <span className="min-w-0 truncate font-heading text-xs font-medium text-[#343133]">
              Pilih Tanggal &amp; Waktu Booking
            </span>
            <ChevronDown
              size={16}
              className={`ml-auto mr-1 shrink-0 text-[#343133] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          {isDateBooked ? (
            <>
              <div className="min-w-0">
                <p className="text-[11px] text-[#6F6B6E]">Rencana Main</p>
                <p className="truncate font-heading text-base font-bold text-[#E02424]">Lapangan Penuh</p>
              </div>
              <button
                type="button"
                onClick={onSearchOther}
                className="h-11 shrink-0 whitespace-nowrap rounded-xl bg-[#E8302F] px-6 font-heading text-sm font-bold text-white active:bg-[#C41717] transition-colors cursor-pointer"
              >
                Cari Lain
              </button>
            </>
          ) : (
            <>
              <div className="min-w-0 shrink-0">
                <p className="text-[11px] text-[#6F6B6E]">Durasi: {durationLabel ?? `${sessionCount} jam`}</p>
                <p className="font-heading text-base font-bold text-[#121212]">
                  {formatRupiah(totalPrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={onOrderNow}
                disabled={isAvailabilityLoading}
                className="h-11 min-w-0 flex-1 whitespace-nowrap rounded-xl bg-[#CDF178] px-3 font-heading text-sm font-bold text-[#404F14] active:bg-[#9AAD3E] transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Pesan Sekarang
              </button>
              <button
                type="button"
                onClick={onAddToCart}
                aria-label="Tambah booking ke keranjang"
                disabled={isAvailabilityLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4D4D4] bg-white text-[#404F14] transition-colors disabled:cursor-not-allowed disabled:opacity-50 active:bg-[#F1F4EA]"
              >
                <ShoppingCart size={20} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileBookingSheet