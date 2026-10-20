import promoSport from '../../../assets/promo/Famplet_OBC_SPORT.jpeg'

interface PromoItem {
	id: string
	image: string
	title: string
	description: string
}

interface PreviewImage {
	src: string
	alt: string
}

interface EventProps {
	onPreviewImage: (image: PreviewImage) => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const PROMOS: PromoItem[] = [
	{
		id: 'promo-1',
		image: promoSport,
		title: 'Registrasi Liga Badminton',
		description: 'Pendaftaran tim dibuka s/d akhir Maret',
	},
	{
		id: 'promo-2',
		image: promoSport,
		title: 'Registrasi Liga Badminton',
		description: 'Pendaftaran tim dibuka s/d akhir Maret',
	},
	{
		id: 'promo-3',
		image: promoSport,
		title: 'Registrasi Liga Badminton',
		description: 'Pendaftaran tim dibuka s/d akhir Maret',
	},
]

function Event({ onPreviewImage }: EventProps) {
	return (
		<section className="mt-4 sm:mt-6">
			<h2 className={`${FONT_MONTSERRAT} text-base font-bold text-[#265021] min-[360px]:text-lg sm:text-xl`}>
				Promosi &amp; Event Terbaru
			</h2>
			<div className="-mx-3 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-3 pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[360px]:-mx-4 min-[360px]:scroll-px-4 min-[360px]:px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 min-[833px]:mx-0 min-[833px]:grid min-[833px]:grid-cols-3 min-[833px]:gap-3 min-[833px]:overflow-visible min-[833px]:px-0 min-[833px]:scroll-px-0 min-[833px]:pb-0 lg:gap-[13px]">
				{PROMOS.map((promo) => (
					<div
						key={promo.id}
						className="relative flex w-[min(260px,88%)] min-w-[210px] shrink-0 snap-start items-center gap-2 rounded-2xl border border-[#E5E5E5] bg-white p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] min-[360px]:gap-3 sm:p-3 min-[833px]:w-auto min-[833px]:min-w-0 min-[833px]:p-3.5"
					>
						<button
							type="button"
							onClick={() => onPreviewImage({ src: promo.image, alt: promo.title })}
							aria-label={`Perbesar gambar ${promo.title}`}
							className="absolute inset-0 z-10 cursor-zoom-in rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#404F14]"
						/>
						<div className="h-[88px] w-14 shrink-0 overflow-hidden rounded-lg min-[360px]:h-[110px] min-[360px]:w-[72px] min-[833px]:h-[120px] min-[833px]:w-20">
							<img
								src={promo.image}
								alt=""
								className="h-full w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
						</div>
						<div className="pointer-events-none relative min-w-0">
							<span className="inline-block rounded bg-[#E6F0E0] px-2 py-1 text-[10px] font-bold leading-none text-[#404F14] font-heading">
								PROMO SPESIAL
							</span>
							<h3
								className={`mt-1 ${FONT_MONTSERRAT} break-words text-[13px] font-semibold leading-snug text-[#265021] min-[360px]:text-sm`}
							>
								{promo.title}
							</h3>
							<p className="mt-0.5 break-words text-xs text-[#343133] font-heading">{promo.description}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

export default Event