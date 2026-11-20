import { useTranslation } from 'react-i18next'
import lapangF1 from '../../assets/images/lapang/Lapang F1.webp'
import futsalF2 from '../../assets/images/lapang/academy2.webp'
import sepakbola from '../../assets/images/lapang/lapang-bola.webp'
import lapangF2 from '../../assets/images/lapang/Lapang F2.webp'
import mejaBilliard from '../../assets/images/lapang/Meja Billiard.webp'

const COLLAGE_IMG =
	'w-full rounded-lg sm:rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)]'

function Booking() {
	const { t } = useTranslation()
	const courtImages = t('landing.courtImages', { returnObjects: true }) as string[]
	return (
		<section className="border-y border-[#D4D4D4] bg-white lg:flex lg:items-center">
			<div className="mx-auto grid max-w-[1248px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
				<div className="flex h-full flex-col lg:min-h-[480px]">
					<span className="inline-block self-start rounded-full bg-[#E8EDE3] px-4 py-2 font-heading text-xs font-medium text-[#404F14]">
						OBC Sport
					</span>
					<h2 className="mt-3 max-w-[480px] font-heading text-xl font-semibold leading-snug text-[#343133] sm:text-2xl">
						{t('landing.bookingTitle')}
					</h2>
					<p className="mt-3 max-w-[460px] text-sm leading-relaxed text-[#343133]">
						{t('landing.bookingDescription')}
					</p>
				</div>

				<div className="mx-auto flex w-full max-w-[520px] gap-3 sm:gap-4 lg:mr-0 lg:justify-end">
					<div className="flex min-w-0 flex-[259] flex-col gap-3 pt-8 sm:gap-5 sm:pt-14">
						<img
							src={lapangF1}
							alt={courtImages[0]}
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[259/194]`}
						/>
						<img
							src={lapangF2}
							alt={courtImages[1]}
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[259/133]`}
						/>
					</div>
					<div className="flex min-w-0 flex-[193] flex-col gap-3 sm:gap-5">
						<img
							src={futsalF2}
							alt={courtImages[2]}
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[193/112]`}
						/>
						<img
							src={mejaBilliard}
							alt={courtImages[3]}
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[193/194]`}
						/>
						<img
							src={sepakbola}
							alt={courtImages[4]}
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[193/111]`}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Booking