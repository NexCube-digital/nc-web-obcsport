import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CalendarSelect from '../../../components/ui/CalendarSelect'

type KalenderProps = {
	selectedDate: string
	onSelectDate: (date: string) => void
}

function localDateValue(date = new Date()) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export default function Kalender({ selectedDate, onSelectDate }: KalenderProps) {
	const { t, i18n } = useTranslation()
	const [visibleMonth, setVisibleMonth] = useState(() => {
		const today = new Date()
		return new Date(today.getFullYear(), today.getMonth(), 1)
	})
	const todayValue = localDateValue()
	const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
	const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'id-ID'
	const monthOptions = Array.from({ length: 12 }, (_, month) => ({
		value: String(month),
		label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, month, 1)),
	}))
	const yearOptions = Array.from({ length: 11 }, (_, offset) => currentMonth.getFullYear() + offset)
	const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(visibleMonth)
	const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
	const leadingDays = (monthStart.getDay() + 6) % 7
	const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
	const calendarDays = Array.from({ length: Math.ceil((leadingDays + daysInMonth) / 7) * 7 }, (_, index) => {
		const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - leadingDays + 1)
		return { date, value: localDateValue(date), inMonth: date.getMonth() === visibleMonth.getMonth() }
	})
	const weekdays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, index + 1)))
	const selectedDateLabel = selectedDate
		? new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${selectedDate}T00:00:00`))
		: ''

	return (
		<aside aria-label={t('bookingPage.chooseDate')} className="self-start rounded-lg border border-[#D8E1D2] bg-white p-4 shadow-[0_8px_24px_rgba(47,76,39,0.07)] sm:p-5 lg:sticky lg:top-28">
			<div className="flex items-center justify-between gap-3">
				<p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#62751E]">
					<CalendarDays size={13} aria-hidden="true" />{t('bookingPage.chooseDate')}
				</p>
				<div className="flex gap-1">
					<button type="button" aria-label={t('bookingPage.previousMonth')} disabled={monthStart <= currentMonth} onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid size-8 place-items-center rounded-lg border border-[#E1E8DD] text-[#52634A] transition-colors hover:bg-[#F3F6EE] disabled:cursor-not-allowed disabled:opacity-35">
						<ChevronLeft size={16} aria-hidden="true" />
					</button>
					<button type="button" aria-label={t('bookingPage.nextMonth')} onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid size-8 place-items-center rounded-lg border border-[#E1E8DD] text-[#52634A] transition-colors hover:bg-[#F3F6EE]">
						<ChevronRight size={16} aria-hidden="true" />
					</button>
				</div>
			</div>

			<div className="mt-3 grid grid-cols-[minmax(0,1fr)_86px] gap-2">
				<CalendarSelect
					label={t('bookingPage.chooseMonth')}
					value={String(visibleMonth.getMonth())}
					options={monthOptions.map((month) => ({
						...month,
						disabled: visibleMonth.getFullYear() === currentMonth.getFullYear() && Number(month.value) < currentMonth.getMonth(),
					}))}
					onSelect={(value) => setVisibleMonth((month) => new Date(month.getFullYear(), Number(value), 1))}
				/>
				<CalendarSelect
					label={t('bookingPage.chooseYear')}
					value={String(visibleMonth.getFullYear())}
					options={yearOptions.map((year) => ({ value: String(year), label: String(year) }))}
					onSelect={(value) => {
						const year = Number(value)
						setVisibleMonth((month) => new Date(year, year === currentMonth.getFullYear() ? Math.max(month.getMonth(), currentMonth.getMonth()) : month.getMonth(), 1))
					}}
				/>
			</div>

			<div className="mt-4 grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel}>
				{weekdays.map((weekday, index) => (
					<div key={`${weekday}-${index}`} role="columnheader" className="grid h-8 place-items-center text-[10px] font-semibold uppercase text-[#899187]">{weekday}</div>
				))}
				{calendarDays.map(({ date, value, inMonth }) => {
					const disabled = !inMonth || value < todayValue
					const isSelected = value === selectedDate
					const isToday = value === todayValue
					return (
						<button key={value} type="button" role="gridcell" disabled={disabled} aria-label={new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date)} aria-current={isToday ? 'date' : undefined} aria-pressed={isSelected} onClick={() => onSelectDate(value)} className={`mx-auto grid size-9 place-items-center rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5A2A] ${isSelected ? 'bg-[#1F5A2A] text-white shadow-sm ring-2 ring-[#1F5A2A]/20 ring-offset-2' : isToday ? 'bg-[#EAF4D7] text-[#1F5A2A] ring-1 ring-inset ring-[#B8CE8A] hover:bg-[#DDECC2]' : 'text-[#34413A] hover:bg-[#F3F6EE]'} disabled:cursor-default disabled:text-[#C7CCC3]`}>
							{inMonth ? date.getDate() : ''}
						</button>
					)
				})}
			</div>

			<div className="mt-3 flex items-center justify-between border-t border-[#E8ECE4] pt-3">
				<span className="flex min-w-0 items-center gap-2 text-[10px] text-[#687269]">
					<span className="size-2 shrink-0 rounded-full bg-[#1F5A2A]" />
					<span className="min-w-0">
						<span className="block">{t('bookingPage.selectedDate')}</span>
						<span className="block truncate font-semibold text-[#34413A]">{selectedDateLabel}</span>
					</span>
				</span>
				<button type="button" onClick={() => { onSelectDate(todayValue); setVisibleMonth(currentMonth) }} className="text-[11px] font-semibold text-[#1F5A2A] hover:underline">{t('bookingPage.today')}</button>
			</div>
		</aside>
	)
}

