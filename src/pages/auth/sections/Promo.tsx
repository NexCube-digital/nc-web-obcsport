import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import promoBanner from '../../../assets/slider/Rectangle 48.png'

interface PromoSlide {
	id: string
	title: string
	subtitle: string
}

const PROMO_SLIDES: PromoSlide[] = [
	{ id: 'promo-1', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
	{ id: 'promo-2', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
	{ id: 'promo-3', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
	{ id: 'promo-4', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
]

function Promo() {
	const [activePromo, setActivePromo] = useState(1)
	const handlePrev = () =>
		setActivePromo((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length)
	const handleNext = () => setActivePromo((prev) => (prev + 1) % PROMO_SLIDES.length)

	return (
		<section className="mx-auto max-w-[1384px] px-4 pt-10 sm:px-6 sm:pt-12">
			<h2 className="text-center font-heading text-xl font-semibold text-[#343133] sm:text-2xl">
				Promo dan penawaran dari OBC Sport
			</h2>

			<div className="relative mt-5 overflow-hidden rounded-xl sm:mt-6 sm:rounded-2xl">
				<img
					src={promoBanner}
					alt="Join OBC Sport, unlock your potential"
					className="block h-auto min-h-[140px] w-full object-cover"
				/>

				<button
					type="button"
					aria-label="Promo sebelumnya"
					onClick={handlePrev}
					className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#343133]/60 text-white transition-colors hover:bg-[#343133]/80 sm:left-4 sm:h-11 sm:w-11 lg:left-6 lg:h-12 lg:w-12"
				>
					<ChevronLeft className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
				</button>
				<button
					type="button"
					aria-label="Promo berikutnya"
					onClick={handleNext}
					className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#343133]/60 text-white transition-colors hover:bg-[#343133]/80 sm:right-4 sm:h-11 sm:w-11 lg:right-6 lg:h-12 lg:w-12"
				>
					<ChevronRight className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
				</button>
			</div>

			<div className="mt-4 flex justify-center gap-2">
				{PROMO_SLIDES.map((slide, index) => (
					<button
						key={slide.id}
						type="button"
						aria-label={`Tampilkan promo ${index + 1}`}
						aria-pressed={index === activePromo}
						onClick={() => setActivePromo(index)}
						className={`h-1.5 w-6 cursor-pointer rounded-full border transition-colors ${
							index === activePromo
								? 'border-[#D4D4D4] bg-[#D4D4D4]'
								: 'border-[#D4D4D4] bg-white'
						}`}
					/>
				))}
			</div>
		</section>
	)
}

export default Promo
