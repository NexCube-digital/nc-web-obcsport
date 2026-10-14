import { useState } from 'react'
import { createPortal } from 'react-dom'
import TestimonialModal from '../../../components/ui/TestimonialModal'
import reviewIcon from '../../../assets/icon/image.png'


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
	const [isTestimonialOpen, setIsTestimonialOpen] = useState(false)
	const testimonial = TESTIMONIALS[activeTesti]
	const dateLabel = new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date())
	const handlePrev = () =>
		setActiveTesti((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
	const handleNext = () => setActiveTesti((prev) => (prev + 1) % TESTIMONIALS.length)

	return (
		<section className="mx-auto flex w-full max-w-[1248px] flex-col items-center px-4 py-8 sm:px-6 sm:py-12 md:py-8 lg:py-10">
			<div className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] md:min-h-[clamp(380px,calc(100svh-16rem),480px)] md:grid-cols-[minmax(220px,36%)_1fr] lg:max-w-[1100px] lg:min-h-[clamp(420px,calc(100svh-14rem),540px)] lg:grid-cols-[minmax(340px,36%)_1fr]">
				<div className="flex items-center bg-gradient-to-br from-[#004000] to-[#404F14] px-5 py-6 sm:px-8 md:px-7 md:py-9 lg:px-10">
					<h2 className="font-heading text-xl font-semibold leading-snug text-white sm:text-2xl">
						Apa kata Pengguna OBC Sport ?
					</h2>
				</div>

				<div className="flex flex-col px-5 py-5 sm:px-8 sm:py-7 md:px-9 md:py-9">
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

					<p className="mt-5 text-sm italic leading-relaxed text-[#343133] md:mt-8">
						{testimonial.quote}
					</p>
					

					<div className="mt-auto flex items-center justify-between pt-6 md:pt-8">
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

			{/* Tombol ulasan: membuka modal */}
			<div className="mt-8 flex w-full justify-center sm:mt-6">
					<button
						type="button"
						onClick={() => setIsTestimonialOpen(true)}
						className="flex h-11 w-fit max-w-full cursor-pointer items-center justify-center gap-2 rounded-[45px] border-[0.67px] border-[#CDF178] bg-[#CDF178] px-2.5 py-1 font-['Montserrat'] text-[11px] font-semibold leading-[17px] text-[#000000] shadow-[0px_3px_5.8px_0px_#0000004D] transition-colors hover:bg-[#c0e85a] sm:gap-2.5 sm:px-3 sm:text-[12px] md:h-11 md:px-3.5 md:text-[14px]"
					>
						<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#004000] text-[#CDF178] md:h-8 md:w-8">
							<img src={reviewIcon} alt="" aria-hidden="true" className="h-4 w-4" />
						</span>
						<span className="block whitespace-nowrap text-center leading-[17px]">
							Tulis Ulasan Pengalaman Kamu Disini
						</span>
					</button>
				</div>

			{isTestimonialOpen &&
				createPortal(
					<TestimonialModal
						isOpen={isTestimonialOpen}
						onClose={() => setIsTestimonialOpen(false)}
						onDefer={() => setIsTestimonialOpen(false)}
						facilityName="OBC Sport Center"
						dateLabel={dateLabel}
					/>,
					document.body,
				)}
		</section>
	)
}

export default Testimoni
