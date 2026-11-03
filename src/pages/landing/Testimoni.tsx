import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import TestimonialModal from '../../components/ui/TestimonialModal'
import reviewIcon from '../../assets/icon/image.png'
import { useAuth } from '../../hooks/useAuth'
import { getSportsFacilities, type SportsFacility } from '../../services/facilityService'
import { getPublishedTestimonials, type PublicTestimonial } from '../../services/testimonialService'


interface FeaturedReview extends PublicTestimonial {
	facilityName: string
}

function Testimoni() {
	const navigate = useNavigate()
	const { isLoggedIn } = useAuth()
	const [facilities, setFacilities] = useState<SportsFacility[]>([])
	const [reviews, setReviews] = useState<FeaturedReview[]>([])
	const [activeTesti, setActiveTesti] = useState(0)
	const [isLoadingReviews, setIsLoadingReviews] = useState(true)
	const [loadError, setLoadError] = useState('')
	const [isTestimonialOpen, setIsTestimonialOpen] = useState(false)
	const testimonial = reviews[activeTesti]
	const dateLabel = new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date())
	const handlePrev = () =>
		setActiveTesti((prev) => (prev - 1 + reviews.length) % reviews.length)
	const handleNext = () => setActiveTesti((prev) => (prev + 1) % reviews.length)
	const handleWriteReview = () => {
		if (!isLoggedIn) {
			toast.info('Silakan masuk dulu untuk menulis ulasan pengalaman kamu.')
			navigate('/login', { state: { from: { pathname: window.location.pathname } } })
			return
		}
		setIsTestimonialOpen(true)
	}

	useEffect(() => {
		let active = true
		Promise.allSettled([getSportsFacilities(), getPublishedTestimonials()]).then(([facilitiesResult, reviewsResult]) => {
			if (!active) return
			if (facilitiesResult.status === 'fulfilled') setFacilities(facilitiesResult.value)
			if (reviewsResult.status === 'rejected') {
				setLoadError('Testimoni gagal dimuat.')
				setIsLoadingReviews(false)
				return
			}

			const featuredReviews: FeaturedReview[] = reviewsResult.value
				.map((review) => ({ ...review, facilityName: review.company ?? 'OBC Sport Center' }))
			featuredReviews.sort((left, right) =>
				right.rating - left.rating || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
			setReviews(featuredReviews.slice(0, 12))
			setActiveTesti(0)
			setLoadError(featuredReviews.length ? '' : 'Belum ada ulasan untuk fasilitas ini.')
			setIsLoadingReviews(false)
		})
		return () => { active = false }
	}, [])

	return (
		<section className="mx-auto flex w-full max-w-[1248px] flex-col items-center px-4 py-8 sm:px-6 sm:py-12 md:py-8 lg:py-10">
			<div className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] md:min-h-[clamp(380px,calc(100svh-16rem),480px)] md:grid-cols-[minmax(220px,36%)_1fr] lg:max-w-[1100px] lg:min-h-[clamp(420px,calc(100svh-14rem),540px)] lg:grid-cols-[minmax(340px,36%)_1fr]">
				<div className="flex items-center bg-gradient-to-br from-[#004000] to-[#404F14] px-5 py-6 sm:px-8 md:px-7 md:py-9 lg:px-10">
					<h2 className="font-heading text-xl font-semibold leading-snug text-white sm:text-2xl">
						Apa kata Pengguna OBC Sport ?
					</h2>
				</div>

				<div className="flex flex-col px-5 py-5 sm:px-8 sm:py-7 md:px-9 md:py-9">
					

					{isLoadingReviews ? (
						<p role="status" className="mt-5 text-sm text-[#343133]">Memuat ulasan...</p>
					) : testimonial ? (
						<>
							<div className="flex items-center gap-3 sm:gap-4">
								<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9AAD3E] font-heading text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
									{testimonial.name.charAt(0).toUpperCase()}
								</span>
								<div className="min-w-0">
									<p className="truncate font-heading text-base font-bold text-[#343133]">
										{testimonial.name}
									</p>
									<p className="truncate text-xs text-[#343133]">
										{testimonial.facilityName} · {testimonial.rating.toFixed(1)} ★
									</p>
								</div>
							</div>
							<p className="mt-5 text-sm italic leading-relaxed text-[#343133] md:mt-8">
								“{testimonial.text}”
							</p>
						</>
					) : (
						<p className="mt-5 text-sm leading-relaxed text-[#343133]">
							{loadError || 'Belum ada ulasan untuk fasilitas ini.'}
						</p>
					)}

					<div className="mt-auto flex items-center justify-between pt-6 md:pt-8">
						<span className="font-heading text-xs font-semibold text-[#343133]">
							{String(reviews.length ? activeTesti + 1 : 0).padStart(2, '0')}/
							{String(reviews.length).padStart(2, '0')}
						</span>
						<div className="flex items-center gap-1">
							<button
								type="button"
								aria-label="Testimoni sebelumnya"
								onClick={handlePrev}
								disabled={reviews.length < 2}
								className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-heading text-xl font-bold text-[#343133] transition-colors hover:bg-[#E8EDE3]"
							>
								&lt;
							</button>
							<button
								type="button"
								aria-label="Testimoni berikutnya"
								onClick={handleNext}
								disabled={reviews.length < 2}
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
						onClick={handleWriteReview}
						disabled={(facilities.length === 0 && !testimonial?.resourceId) || isLoadingReviews}
						className="flex h-11 w-fit max-w-full cursor-pointer items-center justify-center gap-2 rounded-[45px] border-[0.67px] border-[#CDF178] bg-[#CDF178] px-2.5 py-1 font-['Montserrat'] text-[11px] font-semibold leading-[17px] text-[#000000] shadow-[0px_3px_5.8px_0px_#0000004D] transition-colors hover:bg-[#c0e85a] disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2.5 sm:px-3 sm:text-[12px] md:h-11 md:px-3.5 md:text-[14px]"
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
						facilityName={testimonial?.facilityName ?? facilities[0]?.name ?? 'OBC Sport Center'}
						dateLabel={dateLabel}
						resourceId={testimonial?.resourceId ?? facilities[0]?.id ?? ''}
					/>,
					document.body,
				)}
		</section>
	)
}

export default Testimoni
