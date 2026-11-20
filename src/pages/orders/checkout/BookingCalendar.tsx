import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CalendarSelect from '../../../components/ui/CalendarSelect'
import { getZonedParts, toDateKey } from '../../../utils/orders/checkoutDateUtils'

interface BookingCalendarProps {
  variant: 'desktop' | 'mobile'
  viewYear: number
  viewMonth: number
  selectedDate: string | null
  bookedDates: string[]
  onChangeMonth: (step: number) => void
  onSelectDate: (day: number) => void
}

function BookingCalendar({
  variant,
  viewYear,
  viewMonth,
  selectedDate,
  bookedDates,
  onChangeMonth,
  onSelectDate,
}: BookingCalendarProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'id-ID'
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(viewYear, viewMonth, 1))
  const monthOptions = Array.from({ length: 12 }, (_, month) => ({
    value: String(month),
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, month, 1)),
    disabled: false,
  }))
  const currentDateParts = getZonedParts(new Date())
  const currentYear = Number(currentDateParts.year)
  const currentMonth = Number(currentDateParts.month) - 1
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear + index)
  const monthSelectOptions = monthOptions.map((month) => ({
    ...month,
    disabled: viewYear === currentYear && Number(month.value) < currentMonth,
  }))
  const selectMonth = (value: string) => {
    const nextMonth = Number(value)
    if (viewYear === currentYear && nextMonth < currentMonth) return
    onChangeMonth(nextMonth - viewMonth)
  }
  const selectYear = (value: string) => {
    const nextYear = Number(value)
    const nextMonth = nextYear === currentYear ? Math.max(viewMonth, currentMonth) : viewMonth
    onChangeMonth((nextYear - viewYear) * 12 + nextMonth - viewMonth)
  }
  const isNextMonthDisabled = viewYear > currentYear + 10
    || (viewYear === currentYear + 10 && viewMonth === 11)
  const dayHeaders = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, index + 1))),
  )
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const leadingBlanks = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  const todayKey = `${currentDateParts.year}-${currentDateParts.month}-${currentDateParts.day}`
  const isPreviousMonthDisabled = viewYear < currentYear
    || (viewYear === currentYear && viewMonth <= currentMonth)

  if (variant === 'mobile') {
    const cells = [
      ...Array.from({ length: leadingBlanks }, (_, index) => ({
        key: `prev-${index}`,
        day: prevMonthDays - leadingBlanks + 1 + index,
        inMonth: false,
      })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({
        key: toDateKey(viewYear, viewMonth, index + 1),
        day: index + 1,
        inMonth: true,
      })),
    ]
    const trailingCount = 42 - cells.length
    for (let index = 1; index <= trailingCount; index += 1) {
      cells.push({ key: `next-${index}`, day: index, inMonth: false })
    }

    return (
      <section aria-label={monthLabel} className="mt-5 rounded-2xl border border-[#E5E5E5] bg-white p-5">
        <div className="grid grid-cols-[32px_minmax(0,1fr)_84px_32px] items-center gap-1.5">
          <button
            type="button"
            aria-label={t('common.previous')}
            onClick={() => onChangeMonth(-1)}
            disabled={isPreviousMonthDisabled}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#121212] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <CalendarSelect label={t('bookingPage.chooseMonth')} value={String(viewMonth)} options={monthSelectOptions} onSelect={selectMonth} />
          <CalendarSelect label={t('bookingPage.chooseYear')} value={String(viewYear)} options={yearOptions.map((year) => ({ value: String(year), label: String(year) }))} onSelect={selectYear} />
          <button
            type="button"
            aria-label={t('common.next')}
            onClick={() => onChangeMonth(1)}
            disabled={isNextMonthDisabled}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#121212] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 text-center">
          {dayHeaders.map((day) => (
            <span key={day} className="font-heading text-[11px] text-[#8A8688]">{day}</span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-y-2">
          {cells.map((cell) => {
            if (!cell.inMonth) {
              return (
                <span key={cell.key} className="mx-auto flex h-10 w-10 items-center justify-center text-sm text-[#C4C4C4]">
                  {cell.day}
                </span>
              )
            }

            const isBooked = bookedDates.includes(cell.key)
            const isPast = cell.key < todayKey
            const isSelected = selectedDate === cell.key
            let style = 'text-[#121212]'
            if (isBooked) style = 'bg-[#FDE8E8] text-[#E02424] font-bold'
            if (isPast) style = 'text-[#C4C4C4] cursor-not-allowed'
            if (isSelected && !isPast && !isBooked) style = 'bg-[#265021] text-white font-bold'
            if (isSelected && !isPast && isBooked) style = 'bg-[#FDE8E8] text-[#E02424] font-bold ring-2 ring-[#9CA3AF]'

            return (
              <button
                key={cell.key}
                type="button"
                disabled={isPast}
                onClick={() => onSelectDate(cell.day)}
                className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm font-heading transition-colors cursor-pointer disabled:cursor-not-allowed ${style}`}
              >
                {cell.day}
                {isBooked && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#E02424]" />}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#E5E5E5] pt-3 text-[10px] text-[#343133]">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-[#E5E5E5] bg-white" />{t('booking.available')}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#265021]" />{t('booking.chosen')}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-[#F5B5B5] bg-[#FDE8E8]" />{t('booking.full')}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />{t('booking.past')}</span>
        </div>
      </section>
    )
  }

  const calendarCells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  return (
    <section aria-label={monthLabel} className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-5 pb-8">
      <div className="grid grid-cols-[32px_minmax(0,1fr)_84px_32px] items-center gap-1.5">
        <button type="button" aria-label={t('common.previous')} onClick={() => onChangeMonth(-1)} disabled={isPreviousMonthDisabled} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F6EF] text-[#121212] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <CalendarSelect label={t('bookingPage.chooseMonth')} value={String(viewMonth)} options={monthSelectOptions} onSelect={selectMonth} />
        <CalendarSelect label={t('bookingPage.chooseYear')} value={String(viewYear)} options={yearOptions.map((year) => ({ value: String(year), label: String(year) }))} onSelect={selectYear} />
        <button type="button" aria-label={t('common.next')} onClick={() => onChangeMonth(1)} disabled={isNextMonthDisabled} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F6EF] text-[#121212] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-[#343133]">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-[#121212] bg-white" />{t('booking.available')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#E02424]" />{t('booking.booked')}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#F59E0B]" />{t('booking.yourSelection')}</span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {dayHeaders.map((day) => (
          <span key={day} className="rounded bg-[#FDFCF7] py-1 text-center font-heading text-[11px] font-bold text-[#121212]">{day}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-x-2 gap-y-2.5">
        {calendarCells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />
          const key = toDateKey(viewYear, viewMonth, day)
          const isPast = key < todayKey
          const isBooked = bookedDates.includes(key)
          const isSelected = selectedDate === key
          let style = 'bg-[#E8EBE4] border-[#D4D4D4] text-[#121212]'
          if (isBooked) style = 'bg-[#FDE8E8] border-[#F5B5B5] text-[#E02424]'
          if (isPast) style = 'bg-[#F3F3F3] border-[#E5E5E5] text-[#B5B5B5] cursor-not-allowed'
          if (isSelected && !isBooked) style = 'bg-[#FFF4D6] border-[#F59E0B] border-2 text-[#D97706]'
          if (isSelected && isBooked) style = 'bg-[#FDE8E8] border-[#9CA3AF] border-2 text-[#E02424]'

          return (
            <button key={key} type="button" disabled={isPast} onClick={() => onSelectDate(day)} className={`h-9 rounded-md border text-xs font-heading font-bold transition-colors cursor-pointer disabled:cursor-not-allowed ${style}`}>
              {day}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default BookingCalendar