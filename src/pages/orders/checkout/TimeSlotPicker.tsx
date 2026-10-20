interface TimeSlotPickerProps {
  variant: 'desktop' | 'mobile'
  isDateBooked: boolean
  bookedSlotsToday: string[]
  availableTimeSlots?: string[]
  isLoading?: boolean
  selectedStartTime: string | null
  durationMinutes: number
  sessionCount: number
  durationLabel?: string
  selectedDateLabel: string
  startTime: string
  endTime: string
  maxSessionHours: number
  onToggleTime: (time: string) => void
  onChangeDuration: (durationMinutes: number) => void
  onConfirmSchedule?: () => void
  onResetSearch?: () => void
}

function TimeSlotPicker({
  variant,
  isDateBooked,
  bookedSlotsToday,
  availableTimeSlots,
  isLoading = false,
  selectedStartTime,
  durationMinutes,
  sessionCount,
  durationLabel = `${sessionCount} Jam`,
  selectedDateLabel,
  startTime,
  endTime,
  maxSessionHours,
  onToggleTime,
  onChangeDuration,
  onConfirmSchedule,
  onResetSearch,
}: TimeSlotPickerProps) {
  const timeSlots = availableTimeSlots ?? []
  const durationControl = (
    <label className="mt-3 flex items-center justify-between gap-3 text-sm text-[#343133]">
      <span>Durasi sewa</span>
      <select
        value={durationMinutes}
        onChange={(event) => onChangeDuration(Number(event.target.value))}
        className="h-10 rounded-md border border-[#D4D4D4] bg-white px-3 font-heading font-bold text-[#265021]"
      >
        {Array.from({ length: maxSessionHours * 4 - 3 }, (_, index) => 60 + index * 15).map((minutes) => (
          <option key={minutes} value={minutes}>
            {Math.floor(minutes / 60) > 0 ? `${Math.floor(minutes / 60)} jam` : ''}
            {minutes % 60 > 0 ? ` ${minutes % 60} menit` : ''}
          </option>
        ))}
      </select>
    </label>
  )

  if (variant === 'mobile') {
    return (
      <>
        <h3 className="mt-8 font-heading text-xs font-bold text-[#121212] md:text-sm">
          Pilih Waktu Mulai (interval 15 menit)
        </h3>
        {durationControl}
        {isLoading ? (
          <p role="status" className="mt-3 text-sm text-[#6F6B6E]">Memuat ketersediaan...</p>
        ) : isDateBooked ? (
          <p className="mt-3 text-sm leading-relaxed text-[#E02424]">
            Tidak ada rentang waktu untuk durasi ini. Ubah durasi atau pilih tanggal lain.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2.5 min-[600px]:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] md:gap-3">
            {timeSlots.map((time) => {
              const isBooked = bookedSlotsToday.includes(time)
              const isSelected = selectedStartTime === time
              let style = 'bg-white border-[#E5E5E5] text-[#121212]'
              if (isBooked) style = 'bg-[#C8C8C8] border-[#B5B5B5] text-[#121212] cursor-not-allowed'
              if (isSelected) style = 'bg-[#265021] border-[#265021] text-white'

              return (
                <button
                  key={time}
                  type="button"
                  disabled={isBooked}
                  onClick={() => onToggleTime(time)}
                  className={`h-10 min-w-0 rounded-md border text-xs font-heading font-bold transition-colors cursor-pointer md:h-11 md:text-sm ${style}`}
                >
                  {time}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#6F6B6E] md:text-xs">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#265021]" />Tersedia</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#C8C8C8]" />Booked/Event</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-[#265021] bg-[#E6F2D6]" />Selected</span>
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <section className="mt-3 w-full rounded-2xl border border-[#D4D4D4] bg-white p-5 md:p-6">
        <h3 className="font-heading text-lg font-bold text-[#343133] md:text-xl">Pilih Waktu Mulai</h3>
        {durationControl}
        <p role="status" className="mt-4 text-sm text-[#6F6B6E]">Memuat ketersediaan...</p>
      </section>
    )
  }

  if (isDateBooked) {
    return (
      <section className="mt-3 w-full rounded-2xl border border-[#D4D4D4] bg-white p-5 md:p-6">
        <h3 className="font-heading text-lg font-bold text-[#E02424] md:text-xl">Jadwal Tidak Tersedia</h3>
        {durationControl}
        <p className="mt-4 max-w-full text-sm leading-relaxed text-[#343133] md:mt-6 md:max-w-[420px]">
          Tidak ada rentang waktu yang tersedia untuk durasi ini. Ubah durasi atau pilih tanggal lain.
        </p>
        <button type="button" onClick={onResetSearch} className="mt-5 h-10 w-full rounded-md bg-[#E8302F] text-sm font-heading font-medium text-white hover:bg-[#C41717] transition-colors cursor-pointer md:h-11">
          Cari Lain
        </button>
      </section>
    )
  }

  return (
    <section className="mt-3 w-full min-w-0 rounded-2xl border border-[#D4D4D4] bg-white p-4 md:p-5">
      <h3 className="font-heading text-base font-bold text-[#343133] md:text-lg">Pilih Waktu Mulai (interval 15 menit)</h3>
      {durationControl}
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2 md:gap-2.5">
          {timeSlots.map((time) => {
          const isBooked = bookedSlotsToday.includes(time)
          const isSelected = selectedStartTime === time
          let style = 'bg-[#FDFCF7] border-[#E5E5E5] text-[#121212] hover:border-[#9AAD3E]'
          if (isSelected) style = 'bg-[#CDF178] border-[#9AAD3E] text-[#404F14] font-bold'
          if (isBooked) style = 'bg-[#FDE8E8] border-[#E02424] text-[#E02424] cursor-not-allowed'

          return (
            <button key={time} type="button" disabled={isBooked} onClick={() => onToggleTime(time)} className={`h-9 min-w-0 rounded-md border text-xs font-heading transition-colors cursor-pointer md:h-10 md:text-sm ${style}`}>
              {time}
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-[#D4D4D4] pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="shrink-0 text-[#343133]">Durasi:</span>
          <span className="min-w-0 text-right font-heading font-bold text-[#121212]">
            {sessionCount > 0 ? durationLabel : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="shrink-0 text-[#343133]">Tanggal:</span>
          <span className="min-w-0 break-words text-right font-heading font-bold text-[#265021]">{selectedDateLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="shrink-0 text-[#343133]">Jam:</span>
          <span className="min-w-0 text-right font-heading font-bold text-[#265021]">
            {sessionCount > 0 ? `${startTime} - ${endTime}` : '-'}
          </span>
        </div>
      </div>

      <button type="button" onClick={onConfirmSchedule} className="mt-4 h-10 w-full rounded-md bg-[#CDF178] text-xs font-heading font-bold text-[#121212] hover:bg-[#9AAD3E] transition-colors cursor-pointer md:h-11 md:text-sm">
        Konfirmasi Jadwal
      </button>
    </section>
  )
}

export default TimeSlotPicker