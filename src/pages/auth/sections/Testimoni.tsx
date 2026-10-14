import { useState } from 'react'

interface Testimonial {
	id: string
	name: string
	role: string
	quote: string
}

const TESTIMONIALS: Testimonial[] = [
	{
		id: 'testi-1',
		name: 'Ahmad sukron',
		role: 'Pelanggan OBC Sport',
		quote:
			'“OBC Sport Center benar-benar mengubah cara tim kami menyewa lapangan. Proses booking-nya instan tanpa ribet chat admin, lapangannya sangat premium dengan pencahayaan LED yang nyaman. Pilihan terbaik untuk mabar maupun turnamen rutin.”',
	},
	{
		id: 'testi-2',
		name: 'Ahmad sukron',
		role: 'Pelanggan OBC Sport',
		quote:
			'“OBC Sport Center benar-benar mengubah cara tim kami menyewa lapangan. Proses booking-nya instan tanpa ribet chat admin, lapangannya sangat premium dengan pencahayaan LED yang nyaman. Pilihan terbaik untuk mabar maupun turnamen rutin.”',
	},
	{
		id: 'testi-3',
		name: 'Ahmad sukron',
		role: 'Pelanggan OBC Sport',
		quote:
			'“OBC Sport Center benar-benar mengubah cara tim kami menyewa lapangan. Proses booking-nya instan tanpa ribet chat admin, lapangannya sangat premium dengan pencahayaan LED yang nyaman. Pilihan terbaik untuk mabar maupun turnamen rutin.”',
	},
]

function Testimoni() {
	const [activeTesti, setActiveTesti] = useState(1)
	const testimonial = TESTIMONIALS[activeTesti]
	const handlePrev = () =>
		setActiveTesti((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
	const handleNext = () => setActiveTesti((prev) => (prev + 1) % TESTIMONIALS.length)

	return (
		<section className="mx-auto max-w-[1248px] px-4 pt-10 sm:px-6 sm:pt-12 md:flex md:items-center md:justify-center md:py-6">
			<div className="mx-auto grid max-w-[1160px] overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] md:min-h-[clamp(430px,calc(100svh-10rem),560px)] md:grid-cols-[minmax(240px,35%)_1fr] lg:min-h-[clamp(400px,calc(100svh-10rem),600px)] lg:grid-cols-[460px_1fr]">
				<div className="flex items-center bg-gradient-to-br from-[#004000] to-[#404F14] px-6 py-8 sm:px-10 md:px-8 md:py-12 lg:px-12">
					<h2 className="font-heading text-xl font-semibold leading-snug text-white sm:text-2xl">
						Apa kata Pengguna OBC Sport ?
					</h2>
				</div>

				<div className="flex flex-col px-6 py-6 sm:px-10 sm:py-8 md:px-12 md:py-12">
					<div className="flex items-center gap-3 sm:gap-4">
						<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9AAD3E] font-heading text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
							{testimonial.name.charAt(0).toUpperCase()}
						</span>
						<div className="min-w-0">
							<p className="truncate font-heading text-base font-bold text-[#343133]">
								{testimonial.name}
							</p>
							<p className="text-xs text-[#343133]">{testimonial.role}</p>
						</div>
					</div>

					<p className="mt-6 text-sm italic leading-relaxed text-[#343133] md:mt-12">
						{testimonial.quote}
					</p>

					<div className="mt-auto flex items-center justify-between pt-8 md:pt-10">
						<span className="font-heading text-xs font-semibold text-[#343133]">
							{String(activeTesti + 1).padStart(2, '0')}/
							{String(TESTIMONIALS.length).padStart(2, '0')}
						</span>
						<div className="flex items-center gap-1">
							<button
								type="button"
								aria-label="Testimoni sebelumnya"
								onClick={handlePrev}
								className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-heading text-xl font-bold text-[#343133] transition-colors hover:bg-[#E8EDE3]"
							>
								&lt;
							</button>
							<button
								type="button"
								aria-label="Testimoni berikutnya"
								onClick={handleNext}
								className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-heading text-xl font-bold text-[#343133] transition-colors hover:bg-[#E8EDE3]"
							>
								&gt;
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Testimoni
