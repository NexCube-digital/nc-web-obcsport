import { ArrowRight, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../hooks/useAuth'
import type { AvailabilitySlot, SportsFacility } from '../../../services/facilityService'
import { getCourtImages } from '../publicCourt'
import type { FacilityCard } from '../../main/home/Court'
import { isPastSlot, minutesToTime } from '../../../utils/orders/checkoutDateUtils'

export type SelectedBookingSlot = {
	facility: SportsFacility
	slot: AvailabilitySlot
	sport: string
}

type BookingModalProps = {
	selected: SelectedBookingSlot
	date: string
	bookingDate: string
	language: string
	onClose: () => void
}

function humanize(value: string) {
	return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatSlotTime(value: string) {
	return value.replace(':', '.')
}

export default function BookingModal({ selected, date, bookingDate, language, onClose }: BookingModalProps) {
	const { t } = useTranslation()
	const { isLoggedIn } = useAuth()
	const { facility, slot, sport } = selected
	const available = slot.status === 'available' && !isPastSlot(bookingDate, slot.startTime, new Date())
	const price = slot.priceFormatted ?? (slot.price === null
		? t('bookingPage.priceUnavailable')
		: new Intl.NumberFormat(language, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(slot.price))
	const duration = sport === 'sepakbola' ? 120 : slot.endMinute - slot.startMinute
	const checkoutEndTime = sport === 'sepakbola'
		? minutesToTime(slot.startMinute + duration)
		: slot.endTime
	const status = isPastSlot(bookingDate, slot.startTime, new Date())
		? t('bookingPage.past')
		: slot.status === 'available'
		? t('bookingPage.available')
		: slot.status === 'booked'
			? t('bookingPage.occupied')
			: slot.status === 'locked'
				? t('bookingPage.processing')
				: slot.status === 'maintenance'
					? t('bookingPage.maintenance')
					: t('bookingPage.closed')
	const checkoutFacility: FacilityCard = {
		id: facility.id,
		name: facility.name,
		description: facility.description || facility.resourceType,
		badge: t('landing.courtAvailable'),
		buttonLabel: t('landing.courtBookNow'),
		image: getCourtImages(facility)[0] ?? '',
		sportTypes: facility.sportTypes,
		slotMinutes: facility.slotMinutes,
		fromPrice: facility.fromPrice,
		fromPriceFormatted: facility.fromPriceFormatted,
		amenities: facility.amenities,
		location: facility.location,
	}

	return (
		<div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
			<section role="dialog" aria-modal="true" aria-labelledby="slot-detail-title" className="w-full max-w-lg rounded-t-xl bg-white p-5 shadow-2xl sm:rounded-xl sm:p-6">
				<header className="flex items-start justify-between gap-4 border-b border-[#E1E8DD] pb-4">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#62751E]">{t('bookingPage.slotDetails')}</p>
						<h2 id="slot-detail-title" className="mt-1 font-heading text-lg font-bold text-[#263626]">{facility.name}</h2>
					</div>
					<button type="button" aria-label={t('bookingPage.close')} onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg text-[#687269] hover:bg-[#F3F6EE] hover:text-[#263626]"><X size={18} /></button>
				</header>
				<dl className="grid grid-cols-2 gap-x-4 gap-y-4 py-5 text-sm">
					<DetailItem label={t('bookingPage.date')} value={date} />
					<DetailItem label={t('bookingPage.time')} value={formatSlotTime(slot.startTime)} />
					<DetailItem label={t('bookingPage.sport')} value={humanize(sport)} />
					<DetailItem label={t('bookingPage.status')} value={status} />
					<DetailItem label={t('bookingPage.duration')} value={`${duration} ${t('bookingPage.minutes')}`} />
					<DetailItem label={t('bookingPage.price')} value={price} />
					<div className="col-span-2">
						<dt className="text-[10px] uppercase tracking-wide text-[#899187]">{t('bookingPage.location')}</dt>
						<dd className="mt-1 flex items-center gap-1.5 font-semibold text-[#263626]">
							<MapPin size={14} className="text-[#617B28]" aria-hidden="true" />
							{facility.location ? `${facility.location.name}, ${facility.location.city}` : t('bookingPage.locationUnavailable')}
						</dd>
					</div>
				</dl>
				<footer className="flex flex-col-reverse gap-2 border-t border-[#E1E8DD] pt-4 sm:flex-row sm:justify-end">
					<button type="button" onClick={onClose} className="h-10 rounded-lg border border-[#D8E1D2] px-4 text-xs font-semibold text-[#59635A] hover:bg-[#F3F6EE]">{t('bookingPage.close')}</button>
					{available && (
						<Link
							to={isLoggedIn ? '/checkout' : '/login'}
							state={isLoggedIn ? {
								resourceId: facility.id,
								sportType: sport,
								bookingDate,
								startTime: slot.startTime,
								endTime: checkoutEndTime,
								facility: checkoutFacility,
							} : undefined}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#CDF178] px-4 text-xs font-bold text-[#34410D] hover:bg-[#B5DC52]"
						>
							{isLoggedIn ? t('bookingPage.goToCheckout') : t('bookingPage.loginToBook')}<ArrowRight size={14} aria-hidden="true" />
						</Link>
					)}
				</footer>
			</section>
		</div>
	)
}

function DetailItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-0">
			<dt className="text-[10px] uppercase tracking-wide text-[#899187]">{label}</dt>
			<dd className="mt-1 break-words font-semibold text-[#263626]">{value}</dd>
		</div>
	)
}
