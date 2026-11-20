import { useEffect, useState } from 'react'
import { Clock3, MapPin, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LandingNavbar from '../../../components/layout/LandingNavbar'
import LandingFooter from '../../../components/layout/Footer'
import Kalender from './Kalender'
import BookingModal, { type SelectedBookingSlot } from './Modal'
import { isPastSlot } from '../../../utils/orders/checkoutDateUtils'
import {
	getFacilityAvailability,
	getSportsFacilities,
	type FacilityAvailability,
	type SportsFacility,
} from '../../../services/facilityService'

type LoadStatus = 'loading' | 'ready' | 'error'

function localDateValue(date = new Date()) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function humanize(value: string) {
	return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatSlotTime(value: string) {
	return value.replace(':', '.')
}

export default function Booking() {
	const { t, i18n } = useTranslation()
	const [facilities, setFacilities] = useState<SportsFacility[]>([])
	const [facilityStatus, setFacilityStatus] = useState<LoadStatus>('loading')
	const [availabilityResult, setAvailabilityResult] = useState<{
		key: string
		data: Record<string, FacilityAvailability>
		error: boolean
	} | null>(null)
	const [selectedDate, setSelectedDate] = useState(localDateValue)
	const [currentTime, setCurrentTime] = useState(() => new Date())
	const [selectedSport, setSelectedSport] = useState('')
	const [selectedSlot, setSelectedSlot] = useState<SelectedBookingSlot | null>(null)
	const [refreshVersion, setRefreshVersion] = useState(0)

	useEffect(() => {
		let active = true
		getSportsFacilities()
			.then((items) => {
				if (active) {
					setFacilities(items)
					setFacilityStatus('ready')
				}
			})
			.catch(() => {
				if (active) setFacilityStatus('error')
			})
		return () => { active = false }
	}, [])

	useEffect(() => {
		const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
		return () => window.clearInterval(timer)
	}, [])

	const sports = Array.from(new Set(facilities.flatMap((facility) => facility.sportTypes)))
	const activeSport = sports.includes(selectedSport) ? selectedSport : sports[0]
	const visibleFacilities = facilities.filter((facility) => activeSport && facility.sportTypes.includes(activeSport))
	const resourceKey = visibleFacilities.map((facility) => facility.id).join(',')
	const scheduleKey = `${selectedDate}|${activeSport ?? ''}|${resourceKey}|${refreshVersion}`
	const currentAvailability = availabilityResult?.key === scheduleKey ? availabilityResult : null
	const availability = currentAvailability?.data ?? {}
	const availabilityStatus: LoadStatus = facilityStatus !== 'ready'
		? facilityStatus
		: !activeSport || currentAvailability
			? currentAvailability?.error ? 'error' : 'ready'
			: 'loading'

	useEffect(() => {
		let active = true
		if (facilityStatus !== 'ready' || !activeSport) {
			return () => { active = false }
		}

		Promise.all(facilities.filter((facility) => activeSport && facility.sportTypes.includes(activeSport)).map(async (facility) => [
			facility.id,
			await getFacilityAvailability(facility.id, selectedDate, activeSport),
		] as const))
			.then((results) => {
				if (active) {
					setAvailabilityResult({ key: scheduleKey, data: Object.fromEntries(results), error: false })
				}
			})
			.catch(() => {
				if (active) setAvailabilityResult({ key: scheduleKey, data: {}, error: true })
			})

		return () => { active = false }
	}, [activeSport, facilities, facilityStatus, resourceKey, scheduleKey, selectedDate])

	const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'id-ID'
	const dateLabel = selectedDate
		? new Intl.DateTimeFormat(locale, {
				weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
			}).format(new Date(`${selectedDate}T00:00:00`))
		: ''

	const retry = () => {
		if (facilityStatus === 'error') {
			setFacilityStatus('loading')
			getSportsFacilities()
				.then((items) => {
					setFacilities(items)
					setFacilityStatus('ready')
				})
				.catch(() => setFacilityStatus('error'))
			return
		}
		setRefreshVersion((version) => version + 1)
	}

	return (
		<div className="min-h-screen bg-[#FDFCF7] font-body text-[#343133]">
			<LandingNavbar />
			<main>
				<section className="border-b border-[#DDE5D5] bg-[#F3F6EE] px-4 py-8 sm:px-6 sm:py-12">
					<div className="mx-auto max-w-[1200px]">
						<p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[#62751E]">OBC Sport Center</p>
						<h1 className="mt-2 font-heading text-2xl font-bold leading-tight text-[#243523] sm:text-3xl">
							{t('bookingPage.title')}
						</h1>
						<p className="mt-2 max-w-2xl text-sm leading-6 text-[#59635A]">
							{t('bookingPage.subtitle')}
						</p>
					</div>
				</section>

				<section className="mx-auto grid max-w-[1200px] items-start gap-5 px-4 py-7 sm:px-6 sm:py-9 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-7">
					<Kalender selectedDate={selectedDate} onSelectDate={setSelectedDate} />
					<div className="min-w-0">
					<div className="flex flex-col gap-4 border-b border-[#E1E8DD] pb-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#62751E]">
								{t('bookingPage.schedule')}
							</p>
							<h2 className="mt-1 font-heading text-lg font-bold text-[#263626]">{dateLabel}</h2>
						</div>
						{sports.length > 0 && (
							<div role="tablist" aria-label={t('bookingPage.sportCategories')} className="flex gap-2 overflow-x-auto pb-1">
								{sports.map((sport) => (
									<button
										key={sport}
										type="button"
										role="tab"
										aria-selected={activeSport === sport}
										onClick={() => setSelectedSport(sport)}
										className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
											activeSport === sport
												? 'border-[#1F5A2A] bg-[#1F5A2A] text-white'
												: 'border-[#D8E1D2] bg-white text-[#59635A] hover:border-[#1F5A2A] hover:text-[#1F5A2A]'
										}`}
									>
										{humanize(sport)}
									</button>
								))}
							</div>
						)}
					</div>

					{facilityStatus === 'loading' && (
						<div role="status" className="py-16 text-center text-sm text-[#687269]">{t('bookingPage.loadingFacilities')}</div>
					)}
					{(facilityStatus === 'error' || availabilityStatus === 'error') && (
						<div role="alert" className="mt-6 border-y border-[#E4D7D1] py-8 text-center">
							<p className="text-sm text-[#73564D]">{t('bookingPage.loadError')}</p>
							<button type="button" onClick={retry} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1F5A2A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#174622]">
								<RefreshCw size={14} aria-hidden="true" />{t('bookingPage.retry')}
							</button>
						</div>
					)}
					{facilityStatus === 'ready' && !visibleFacilities.length && (
						<div className="py-16 text-center text-sm text-[#687269]">{t('bookingPage.noFacilities')}</div>
					)}
					{facilityStatus === 'ready' && availabilityStatus === 'loading' && (
						<div role="status" className="py-16 text-center text-sm text-[#687269]">{t('bookingPage.loadingSchedule')}</div>
					)}
					{facilityStatus === 'ready' && availabilityStatus === 'ready' && visibleFacilities.length > 0 && (
						<div className="divide-y divide-[#E1E8DD]">
							{visibleFacilities.map((facility) => {
								const schedule = availability[facility.id]
								const openMinute = schedule?.operatingHours
									? Number(schedule.operatingHours.openTime.slice(0, 2)) * 60 + Number(schedule.operatingHours.openTime.slice(3, 5))
									: 0
								const slots = schedule?.slots.filter((slot) => (slot.startMinute - openMinute) % Math.max(facility.slotMinutes, 15) === 0) ?? []

								return (
									<article key={facility.id} className="py-5 first:pt-5 sm:py-6">
										<header className="flex flex-wrap items-start justify-between gap-3">
											<div className="min-w-0">
												<h3 className="font-heading text-base font-bold text-[#263626]">{facility.name}</h3>
												<p className="mt-1 flex items-center gap-1.5 text-xs text-[#687269]">
													<MapPin size={14} className="shrink-0 text-[#617B28]" aria-hidden="true" />
													{facility.location ? `${facility.location.name}, ${facility.location.city}` : t('bookingPage.locationUnavailable')}
												</p>
											</div>
											{schedule?.operatingHours && (
												<p className="flex items-center gap-1.5 text-xs text-[#687269]">
													<Clock3 size={14} aria-hidden="true" />
													{formatSlotTime(schedule.operatingHours.openTime)} {t('bookingPage.until')} {formatSlotTime(schedule.operatingHours.closeTime)}
												</p>
											)}
										</header>

										{!schedule || schedule.isClosed || slots.length === 0 ? (
											<p className="mt-4 text-sm text-[#687269]">{t('bookingPage.noSchedule')}</p>
										) : (
											<>
												<div className="mt-4 grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
													{slots.map((slot) => {
														const available = slot.status === 'available'
														const occupied = slot.status === 'booked'
														const past = isPastSlot(selectedDate, slot.startTime, currentTime)
														const slotStatus = past
															? t('bookingPage.past')
															: available
															? t('bookingPage.available')
															: occupied
																? t('bookingPage.occupied')
																: slot.status === 'locked'
																	? t('bookingPage.processing')
																	: slot.status === 'maintenance'
																		? t('bookingPage.maintenance')
																		: t('bookingPage.closed')
														return (
															<button
																key={`${slot.startTime}-${slot.endTime}`}
																type="button"
																disabled={past}
																onClick={() => {
																	if (isPastSlot(selectedDate, slot.startTime, new Date())) return
																	setSelectedSlot({ facility, slot, sport: activeSport ?? '' })
																}}
																aria-label={`${formatSlotTime(slot.startTime)}, ${slotStatus}`}
																className={`flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5A2A] ${
																	available && !past
																		? 'border-[#D8E1D2] bg-[#F3F8E8] text-[#1F5A2A] hover:border-[#1F5A2A]'
																		: occupied
																			? 'border-[#EBCBC7] bg-[#FDF2F2] text-[#A53B3B] hover:border-[#B42318]'
																			: 'border-[#E1E2DA] bg-[#F1EFE8] text-[#687269] hover:border-[#899187]'
																}`}
															>
																<span className="text-xs font-bold">{formatSlotTime(slot.startTime)}</span>
																<span className="text-[10px]">{slotStatus}</span>
															</button>
														)
													})}
												</div>
												<div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#687269]">
													<span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#F3F8E8] ring-1 ring-[#D8E1D2]" />{t('bookingPage.available')}</span>
													<span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#FDF2F2] ring-1 ring-[#EBCBC7]" />{t('bookingPage.occupied')}</span>
													<span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#F1EFE8] ring-1 ring-[#E1E2DA]" />{t('bookingPage.unavailable')}</span>
												</div>
											</>
										)}
									</article>
								)
							})}
						</div>
					)}
					</div>
				</section>
			</main>
			<LandingFooter />
			{selectedSlot && (
				<BookingModal
					selected={selectedSlot}
					date={dateLabel}
					bookingDate={selectedDate}
					language={locale}
					onClose={() => setSelectedSlot(null)}
				/>
			)}
		</div>
	)
}

