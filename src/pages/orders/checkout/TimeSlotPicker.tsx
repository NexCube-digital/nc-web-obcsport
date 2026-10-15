interface TimeSlotPickerProps {
  variant: 'desktop' | 'mobile'
  isDateBooked: boolean
  bookedSlotsToday: string[]
  selectedTimes: string[]
  sessionCount: number
  selectedDateLabel: string
  startTime: string
  endTime: string
  maxSessionHours: number
  onToggleTime: (time: string) => void
  onConfirmSchedule?: () => void
  onResetSearch?: () => void
}

const TIME_SLOTS = ['05:00', '07:00', '08:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00']
const MOBILE_TIME_SLOTS: string[] = Array.from({ length: 18 }, (_, index) =>
  `${String(5 + index).padStart(2, '0')}:00`,
)

function TimeSlotPicker({
  variant,
  isDateBooked,
  bookedSlotsToday,
  selectedTimes,
  sessionCount,
  selectedDateLabel,
  startTime,
  endTime,
  maxSessionHours,
  onToggleTime,
  onConfirmSchedule,
  onResetSearch,
}: TimeSlotPickerProps) {
  if (variant === 'mobile') {
    return (
      <>
        <h3 className="mt-8 font-heading text-xs font-bold text-[#121212] md:text-sm">
          Pilih Sesi Jam Main (Maks {maxSessionHours} jam)
        </h3>
        {isDateBooked ? (
          <p className="mt-3 text-sm leading-relaxed text-[#E02424]">
            Seluruh sesi pada tanggal ini sudah penuh. Silakan pilih tanggal lain.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2.5 min-[600px]:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] md:gap-3">
            {MOBILE_TIME_SLOTS.map((time) => {
              const isBooked = bookedSlotsToday.includes(time)
              const isSelected = selectedTimes.includes(time)
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

  if (isDateBooked) {
    return (
      <section className="mt-3 w-full rounded-2xl border border-[#D4D4D4] bg-white p-5 md:p-6">
        <h3 className="font-heading text-lg font-bold text-[#E02424] md:text-xl">Maaf, Jadwal Penuh</h3>
        <p className="mt-4 max-w-full text-sm leading-relaxed text-[#343133] md:mt-6 md:max-w-[420px]">
          Seluruh sesi untuk fasilitas ini pada tanggal yang dipilih telah terpesona penuh. Silakan cek ketersediaan untuk tanggal lain atau pilih kategori olahraga alternatif di bawah ini
        </p>
        <button type="button" onClick={onResetSearch} className="mt-5 h-10 w-full rounded-md bg-[#E8302F] text-sm font-heading font-medium text-white hover:bg-[#C41717] transition-colors cursor-pointer md:h-11">
          Cari Lain
        </button>
      </section>
    )
  }

  return (
    <section className="mt-3 w-full min-w-0 rounded-2xl border border-[#D4D4D4] bg-white p-4 md:p-5">
      <h3 className="font-heading text-base font-bold text-[#343133] md:text-lg">Pilih Waktu (05:00 - 22:00)</h3>
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2 md:gap-2.5">
        {TIME_SLOTS.map((time) => {
          const isBooked = bookedSlotsToday.includes(time)
          const isSelected = selectedTimes.includes(time)
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
          <span className="shrink-0 text-[#343133]">Sesi Terpilih:</span>
          <span className="min-w-0 text-right font-heading font-bold text-[#121212]">
            {sessionCount > 0 ? `${sessionCount} Sesi (${sessionCount} Jam)` : '-'}
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