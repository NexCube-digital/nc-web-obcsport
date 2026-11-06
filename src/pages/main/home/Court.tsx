import { useTranslation } from 'react-i18next'
import fallbackCourtImage from '../../../assets/no-image.webp'

export interface FacilityCard {
	id: string
	key?: string
	name: string
	description: string
	badge: string
	buttonLabel: string
	image: string
	sportTypes?: string[]
	bookingOptions?: Array<{ id: string; label: string; icon: 'futsal' | 'badminton' | 'pickleball' | 'basket' | 'sepakbola' | 'tenismeja' | 'biliard'; resourceId: string; sportType: string }>
	selectionTitle?: string
	slotMinutes?: number
	fromPrice?: number | null
	fromPriceFormatted?: string | null
	amenities?: string[]
	location?: { name: string; city: string; address: string } | null
}

interface PreviewImage {
	src: string
	alt: string
}

interface CourtProps {
	submittedSearch: string
	onPreviewImage: (image: PreviewImage) => void
	onSelectFacility: (facility: FacilityCard) => void
	facilities?: FacilityCard[]
	loadStatus?: 'loading' | 'ready' | 'error'
	onRetry?: () => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

function Court({ submittedSearch, onPreviewImage, onSelectFacility, facilities = [], loadStatus = 'ready', onRetry }: CourtProps) {
	const { t } = useTranslation()
	const normalizedSearch = submittedSearch.toLocaleLowerCase('id-ID')
	const filteredFacilities = facilities.filter((facility) =>
		`${facility.name} ${facility.description}`.toLocaleLowerCase('id-ID').includes(normalizedSearch),
	)

	return (
		<section className="mt-4 sm:mt-6">
			<h2
				className={`${FONT_MONTSERRAT} border-b border-[#D4D4D4] pb-2 text-base font-bold text-[#265021] min-[360px]:text-lg sm:text-xl`}
			>
				{t('booking.courtAvailability')}
			</h2>

			
			<div className="mt-3 grid grid-cols-1 gap-2 min-[300px]:grid-cols-2 min-[360px]:gap-3 sm:gap-4 lg:grid-cols-3">
				{loadStatus === 'loading' && (
					<p role="status" className="col-span-full py-8 text-center text-sm text-[#6F6B6E]">
						{t('booking.loadingCourts')}
					</p>
				)}
				{loadStatus === 'error' && (
					<div className="col-span-full flex flex-col items-center gap-3 py-8 text-center">
						<p role="alert" className="text-sm text-[#6F6B6E]">{t('booking.facilitiesLoadError')}</p>
						<button type="button" onClick={onRetry} className="rounded-lg bg-[#CDF178] px-4 py-2 text-xs font-semibold text-[#404F14] transition-colors hover:bg-[#9AAD3E]">
							{t('booking.retryFacilities')}
						</button>
					</div>
				)}
				{loadStatus === 'ready' && filteredFacilities.map((facility) => (
					<div
						key={facility.key ?? facility.id}
						className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] min-[300px]:[&:last-child:nth-child(odd)]:col-span-2 lg:[&:last-child:nth-child(odd)]:col-span-1 sm:min-h-60 lg:min-h-52"
					>
						<button
							type="button"
							onClick={() => onPreviewImage({ src: facility.image, alt: facility.name })}
							aria-label={t('booking.zoomImage', { name: facility.name })}
							className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#404F14]"
						/>
						<div className="aspect-video w-full shrink-0 overflow-hidden lg:aspect-auto lg:h-36">
							{facility.image ? (
								<img
									src={facility.image || fallbackCourtImage}
									alt=""
									onError={(event) => { event.currentTarget.src = fallbackCourtImage }}
									className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
									loading="lazy"
									decoding="async"
								/>
							) : (
								<div className="grid h-full place-items-center bg-[#EEF0EA] text-xs text-[#6F6B6E]">
									{t('booking.imageUnavailable')}
								</div>
							)}
						</div>
						<div className="pointer-events-none relative flex flex-1 flex-col px-2.5 pt-2.5 pb-2.5 min-[360px]:px-3 min-[360px]:pt-3 min-[360px]:pb-3 sm:pb-4">
							{/* Mobile: nama di atas, badge di bawahnya (selalu rapi). >= sm: sebaris */}
							<div className="flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-1">
								<h3 className="min-w-0 break-words text-[13px] font-semibold leading-tight text-[#121212] font-heading min-[360px]:text-sm">
									{facility.name}
								</h3>
								<span className="shrink-0 rounded bg-[#E6F0E0] px-2 py-1 text-[10px] font-bold leading-none text-[#404F14] font-heading">
									{facility.badge}
								</span>
							</div>
							<p className="mt-1.5 mb-2.5 break-words text-[11px] leading-4 text-[#6F6B6E] font-heading min-[360px]:text-xs sm:mt-2 sm:mb-3">
								{facility.description}
							</p>
							<button
								type="button"
								onClick={() => onSelectFacility(facility)}
								className="pointer-events-auto relative z-20 mt-auto h-9 w-full cursor-pointer rounded-md bg-[#CDF178] text-[11px] font-semibold text-[#404F14] transition-colors hover:bg-[#9AAD3E] font-heading min-[360px]:text-xs sm:h-[30px] sm:text-[13px]"
							>
								{facility.buttonLabel}
							</button>
						</div>
					</div>
				))}
				{loadStatus === 'ready' && filteredFacilities.length === 0 && (
					<p className="col-span-full py-8 text-center text-sm text-[#6F6B6E]">
						{submittedSearch
							? t('booking.noMatchingCourts', { query: submittedSearch })
							: t('booking.noCourtsAvailable')}
					</p>
				)}
			</div>
		</section>
	)
}

export default Court