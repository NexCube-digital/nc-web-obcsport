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
  selectedTimes: string[]
  isDateBooked: boolean
  sessionCount: number
  durationLabel?: string
  startTime: string
  endTime: string
  totalPrice: number
  maxSessionHours: number
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function MobileBookingSheet({
  isOpen,
  onToggle,
  onClose,
  onChangeMonth,
  onSelectDate,
  onToggleTime,
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
  selectedTimes,
  isDateBooked,
  sessionCount,
  durationLabel,
  startTime,
  endTime,
  totalPrice,
  maxSessionHours,
}: MobileBookingSheetProps) {
  return (
    <div className="md:hidden">
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Pilih tanggal dan waktu bertanding"
            className="fixed inset-x-0 bottom-[120px] z-40 max-h-[calc(100dvh-120px)] overflow-hidden rounded-t-3xl bg-white px-4 pt-5 pb-4"
          >
            <h2 className="text-center font-heading text-base font-bold text-[#343133]">
              {selectedDate ? 'Pilih Waktu Main' : 'Pilih Tanggal Main'}
            </h2>

            {selectedDate ? (
              <>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-[#6F6B6E]">{selectedDateLabel}</p>
                  <button
                    type="button"
                    onClick={onSearchOther}
                    className="cursor-pointer text-xs font-heading font-bold text-[#265021] underline underline-offset-2"
                  >
                    Ubah tanggal
                  </button>
                </div>
                <TimeSlotPicker
                  variant="mobile"
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
                  maxSessionHours={maxSessionHours}
                  onToggleTime={onToggleTime}
                />
              </>
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
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E5E5E5] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#D9E3CC] bg-[#F5FAF0] px-2 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 rounded-lg bg-[#DDEBCB] px-2 py-1.5 text-[#265021]">
              <CalendarDays size={16} />
              <Clock size={16} />
            </span>
            <span className="font-heading text-xs font-medium text-[#343133]">
              Pilih Tanggal &amp; Waktu Booking
            </span>
            <ChevronDown
              size={16}
              className={`ml-auto mr-1 text-[#343133] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          {isDateBooked ? (
            <>
              <div>
                <p className="text-[11px] text-[#6F6B6E]">Rencana Main</p>
                <p className="font-heading text-base font-bold text-[#E02424]">Lapangan Penuh</p>
              </div>
              <button
                type="button"
                onClick={onSearchOther}
                className="h-11 rounded-xl bg-[#E8302F] px-8 font-heading text-sm font-bold text-white active:bg-[#C41717] transition-colors cursor-pointer"
              >
                Cari Lain
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="text-[11px] text-[#6F6B6E]">Total Terpilih ({durationLabel ?? `${sessionCount} jam`})</p>
                <p className="font-heading text-base font-bold text-[#121212]">
                  {formatRupiah(totalPrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={onOrderNow}
                className="h-11 flex-1 rounded-xl bg-[#CDF178] px-4 font-heading text-sm font-bold text-[#404F14] active:bg-[#9AAD3E] transition-colors cursor-pointer"
              >
                Pesan Sekarang
              </button>
              <button
                type="button"
                onClick={onAddToCart}
                aria-label="Tambah booking ke keranjang"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4D4D4] bg-white text-[#404F14] transition-colors active:bg-[#F1F4EA]"
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