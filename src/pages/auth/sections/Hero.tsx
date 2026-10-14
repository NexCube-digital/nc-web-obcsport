import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import lapangF1 from '../../../assets/layanan/Lapang F1.png'
import futsalF2 from '../../../assets/layanan/Futsal F2.png'
import lapangF2 from '../../../assets/layanan/Lapang F2.png'
import mejaBilliard from '../../../assets/layanan/Meja Billiard.png'

const HERO_IMAGES = [lapangF1, futsalF2, lapangF2, mejaBilliard]

function Hero() {
	const [activeSlide, setActiveSlide] = useState(0)
	const navigate = useNavigate()

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length)
		}, 4000)

		return () => window.clearTimeout(timeoutId)
	}, [activeSlide])

	return (
		<>
			<style>{`
				@keyframes hero-fade {
					from {
						opacity: 0;
						transform: scale(1.08) translateX(12px);
					}
					to {
						opacity: 1;
						transform: scale(1) translateX(0);
					}
				}

				@keyframes hero-progress {
					from { width: 0; }
					to { width: 100%; }
				}

				@media (prefers-reduced-motion: reduce) {
					.hero-anim { animation: none !important; }
				}
			`}</style>

			<section className="relative min-h-[calc(100svh-4rem)] min-[360px]:min-h-[calc(100svh-5rem)] sm:min-h-[calc(100svh-6.25rem)] overflow-hidden bg-[#E9E7E0] md:hidden">
				<img
					key={activeSlide}
					src={HERO_IMAGES[activeSlide]}
					alt="Fasilitas olahraga OBC Sport Center"
					className="hero-anim absolute inset-0 h-full w-full object-cover"
					style={{ animation: 'hero-fade 0.7s ease-in-out' }}
				/>
				<div
					className="absolute inset-0"
					style={{
						background:
							'linear-gradient(to bottom, #E9E7E0 0%, rgba(233,231,224,0) 38%, rgba(20,61,31,0.92) 100%)',
					}}
				/>

				<div className="absolute inset-x-0 bottom-0 px-6 pb-32 text-center text-white">
					<h1 className="line-clamp-3 font-heading text-2xl font-bold leading-tight">
						Fasilitas Olahraga Premium Dalam Genggaman Anda
					</h1>
					<p className="mx-auto mt-3 line-clamp-3 max-w-[340px] text-sm leading-relaxed">
						Temukan dan sewa lapangan olahraga terbaik pilihan Anda dalam genggaman.
						Nikmati fasilitas modern premium di kota Anda.
					</p>

					<div className="mt-6 flex justify-center gap-2">
						{HERO_IMAGES.map((_, index) => (
							<button
								key={index}
								type="button"
								aria-label={`Tampilkan foto ${index + 1}`}
								aria-pressed={index === activeSlide}
								onClick={() => setActiveSlide(index)}
								className="relative h-1.5 w-9 cursor-pointer overflow-hidden rounded-full bg-white/50"
							>
								{index === activeSlide && (
									<span
										key={activeSlide}
										className="hero-anim absolute inset-y-0 left-0 rounded-full bg-white"
										style={{ animation: 'hero-progress 4s linear forwards' }}
									/>
								)}
							</button>
						))}
					</div>
				</div>
			</section>

			<section className="hidden border-y border-[#D4D4D4] bg-[#FDFCF7] md:flex md:min-h-[min(100svh,760px)] md:items-center">
				<div className="mx-auto grid max-w-[1248px] items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 md:py-16 lg:grid-cols-2 lg:gap-16 lg:py-16">
					<div className="text-center lg:text-left">
						<span className="inline-block rounded-full bg-[#E8EDE3] px-3 py-1.5 font-heading text-[10px] font-bold tracking-wide text-[#404F14] sm:px-4 sm:py-2 sm:text-xs">
							PROMOSI DAN SEWA LAPANGAN TERBAIK
						</span>

						<h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-[#343133] sm:mt-5 sm:text-4xl lg:text-5xl">
							Fasilitas Olahraga Premium Dalam Genggaman Anda
						</h1>

						<p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#343133] sm:mt-5 sm:text-base lg:mx-0">
							Temukan dan sewa lapangan olahraga terbaik pilihan Anda dalam genggaman.
							Nikmati fasilitas modern premium di kota Anda.
						</p>

						<div className="mt-6 sm:mt-8">
							<button
								type="button"
								onClick={() => navigate('/register')}
								className="w-full cursor-pointer rounded-lg bg-[#CDF178] px-6 py-3 font-heading font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] sm:w-auto"
							>
								Mulai Sewa Sekarang
							</button>
						</div>
					</div>

					<div className="relative mx-auto aspect-[534/418] w-full max-w-[580px] overflow-hidden rounded-2xl bg-[#E9E7E0] shadow-[0_18px_40px_rgba(52,49,51,0.08)] sm:rounded-3xl lg:ml-auto lg:mr-0">
						<img
							key={activeSlide}
							src={HERO_IMAGES[activeSlide]}
							alt="Fasilitas olahraga OBC Sport Center"
							className="hero-anim h-full w-full object-cover"
							style={{ animation: 'hero-fade 0.7s ease-in-out' }}
						/>
						<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
							{HERO_IMAGES.map((_, index) => (
								<button
									key={index}
									type="button"
									aria-label={`Tampilkan foto ${index + 1}`}
									aria-pressed={index === activeSlide}
									onClick={() => setActiveSlide(index)}
									className="relative h-1.5 w-7 cursor-pointer overflow-hidden rounded-full bg-white/60 sm:w-9"
								>
									{index === activeSlide && (
										<span
											key={activeSlide}
											className="hero-anim absolute inset-y-0 left-0 rounded-full bg-[#343133]"
											style={{ animation: 'hero-progress 4s linear forwards' }}
										/>
									)}
								</button>
							))}
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default Hero
