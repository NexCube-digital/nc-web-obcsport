import lapangF1 from '../../assets/layanan/Lapang F1.png'
import lapangF2 from '../../assets/layanan/Lapang F2.png'
import futsalF2 from '../../assets/layanan/Futsal F2.png'
import mejaBilliard from '../../assets/layanan/Meja Billiard.png'

export interface FacilityCard {
	id: string
	name: string
	description: string
	badge: string
	buttonLabel: string
	image: string
}

interface PreviewImage {
	src: string
	alt: string
}

interface CourtProps {
	submittedSearch: string
	onPreviewImage: (image: PreviewImage) => void
	onSelectFacility: (facility: FacilityCard) => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const FACILITIES: FacilityCard[] = [
	{
		id: 'lapangan-f1',
		name: 'Lapangan F1',
		description: 'Futsal 1, Badminton, Voli, Pickleball',
		badge: 'TERSEDIA',
		buttonLabel: 'Booking Sekarang',
		image: lapangF1,
	},
	{
		id: 'lapangan-f2',
		name: 'Lapangan F2',
		description: 'Futsal 2, Basket',
		badge: 'TERSEDIA',
		buttonLabel: 'Booking Sekarang',
		image: lapangF2,
	},
	{
		id: 'lapang-sepak-bola',
		name: 'Lapang Sepak Bola',
		description: 'Sepak Bola',
		badge: 'TERSEDIA',
		buttonLabel: 'Booking Sekarang',
		image: futsalF2,
	},
	{
		id: 'ruang-tenis-meja',
		name: 'Ruang Tenis Meja',
		description: 'Tenis Meja',
		badge: 'TERSEDIA',
		buttonLabel: 'Booking Sekarang',
		image: futsalF2,
	},
	{
		id: 'ruang-biliard',
		name: 'Ruang Biliard',
		description: 'Biliard',
		badge: 'TERSEDIA',
		buttonLabel: 'Booking Sekarang',
		image: mejaBilliard,
	},
]

function Court({ submittedSearch, onPreviewImage, onSelectFacility }: CourtProps) {
	const normalizedSearch = submittedSearch.toLocaleLowerCase('id-ID')
	const filteredFacilities = FACILITIES.filter((facility) =>
		`${facility.name} ${facility.description}`
			.toLocaleLowerCase('id-ID')
			.includes(normalizedSearch),
	)

	return (
		<section className="mt-4 sm:mt-6">
			<h2
				className={`${FONT_MONTSERRAT} border-b border-[#D4D4D4] pb-2 text-base font-bold text-[#265021] min-[360px]:text-lg sm:text-xl`}
			>
				Ketersediaan Lapangan Premium
			</h2>

			<div className="mt-3 grid grid-cols-1 gap-2 min-[300px]:grid-cols-2 min-[360px]:gap-3 sm:gap-4 lg:grid-cols-3">
				{filteredFacilities.map((facility) => (
					<div
						key={facility.id}
						className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
					>
						<button
							type="button"
							onClick={() => onPreviewImage({ src: facility.image, alt: facility.name })}
							aria-label={`Perbesar gambar ${facility.name}`}
							className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#404F14]"
						/>
						<div className="block h-16 w-full overflow-hidden min-[360px]:h-20">
							<img
								src={facility.image}
								alt=""
								className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
								loading="lazy"
							/>
						</div>
						<div className="pointer-events-none relative flex flex-1 flex-col px-2.5 pt-2.5 pb-3 min-[360px]:px-3 min-[360px]:pt-3 min-[360px]:pb-4 sm:pb-6">
							<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
								<h3 className="min-w-0 break-words text-sm font-semibold text-[#121212] font-heading">
									{facility.name}
								</h3>
								<span className="shrink-0 rounded bg-[#E6F0E0] px-2 py-1 text-[10px] font-bold leading-none text-[#404F14] font-heading">
									{facility.badge}
								</span>
							</div>
							<p className="mt-2 mb-3 break-words text-xs text-[#6F6B6E] font-heading">
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
				{filteredFacilities.length === 0 && (
					<p className="col-span-full py-8 text-center text-sm text-[#6F6B6E]">
						Tidak ada lapangan yang cocok dengan “{submittedSearch}”.
					</p>
				)}
			</div>
		</section>
	)
}

export default Court
