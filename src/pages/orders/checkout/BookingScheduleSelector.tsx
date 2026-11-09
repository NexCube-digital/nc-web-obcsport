import BookingCalendar from './BookingCalendar'
import TimeSlotPicker from './TimeSlotPicker'

interface BookingScheduleSelectorProps {
  viewYear: number
  viewMonth: number
  selectedDate: string | null
  selectedDateLabel: string
  selectedDateText: string
  changeDateText: string
  bookedDates: string[]
  bookedSlotsToday: string[]
  blockedSlotStatuses?: Record<string, string>
  availableTimeSlots: string[]
  isLoading: boolean
  isDateBooked: boolean
  selectedStartTime: string | null
  durationMinutes: number
  sessionCount: number
  durationLabel?: string
  startTime: string
  endTime: string
  maxSessionHours: number
  durationStepHours?: number
  onChangeMonth: (step: number) => void
  onSelectDate: (day: number) => void
  onToggleTime: (time: string) => void
  onChangeDuration: (durationMinutes: number) => void
  onResetDate: () => void
  onConfirmSchedule?: () => void
}

export default function BookingScheduleSelector({
  viewYear,
  viewMonth,
  selectedDate,
  selectedDateLabel,
  selectedDateText,
  changeDateText,
  bookedDates,
  bookedSlotsToday,
  blockedSlotStatuses,
  availableTimeSlots,
  isLoading,
  isDateBooked,
  selectedStartTime,
  durationMinutes,
  sessionCount,
  durationLabel,
  startTime,
  endTime,
  maxSessionHours,
  durationStepHours,
  onChangeMonth,
  onSelectDate,
  onToggleTime,
  onChangeDuration,
  onResetDate,
  onConfirmSchedule,
}: BookingScheduleSelectorProps) {
  if (!selectedDate) {
    return (
      <BookingCalendar
        variant="desktop"
        viewYear={viewYear}
        viewMonth={viewMonth}
        selectedDate={selectedDate}
        bookedDates={bookedDates}
        onChangeMonth={onChangeMonth}
        onSelectDate={onSelectDate}
      />
    )
  }

  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[#D4D4D4] bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-[#6F6B6E]">{selectedDateText}</p>
          <p className="truncate font-heading text-sm font-bold text-[#343133]">{selectedDateLabel}</p>
        </div>
        <button
          type="button"
          onClick={onResetDate}
          className="shrink-0 cursor-pointer rounded-lg border border-[#D4D4D4] px-3 py-2 font-heading text-xs font-bold text-[#265021] transition-colors hover:bg-[#F5FAF0]"
        >
          {changeDateText}
        </button>
      </div>
      <TimeSlotPicker
        variant="desktop"
        isDateBooked={isDateBooked}
        bookedSlotsToday={bookedSlotsToday}
        blockedSlotStatuses={blockedSlotStatuses}
        availableTimeSlots={availableTimeSlots}
        isLoading={isLoading}
        selectedStartTime={selectedStartTime}
        durationMinutes={durationMinutes}
        sessionCount={sessionCount}
        durationLabel={durationLabel}
        selectedDateLabel={selectedDateLabel}
        startTime={startTime}
        endTime={endTime}
        maxSessionHours={maxSessionHours}
        durationStepHours={durationStepHours}
        onToggleTime={onToggleTime}
        onChangeDuration={onChangeDuration}
        onConfirmSchedule={onConfirmSchedule}
        onResetSearch={onResetDate}
      />
    </>
  )
}