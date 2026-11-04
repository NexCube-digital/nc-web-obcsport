import { useEffect, useState } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { getPublishedTestimonials, type PublicTestimonial } from '../../../services/testimonialService'
import { useTranslation } from 'react-i18next'

function formatReviewDate(date: string, locale: string) {
	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(date))
}

function TopSportReviews() {
	const { t, i18n } = useTranslation()
	const [reviews, setReviews] = useState<PublicTestimonial[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)

	useEffect(() => {
		let active = true
		getPublishedTestimonials()
			.then((testimonials) => {
				if (!active) return
				const bestReviews = testimonials
					.filter((review) => review.source === 'sport')
					.sort((left, right) => right.rating - left.rating || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
					.slice(0, 5)
				setReviews(bestReviews)
			})
			.catch(() => {
				if (active) setHasError(true)
			})
			.finally(() => {
				if (active) setIsLoading(false)
			})

		return () => { active = false }
	}, [])

	return (
		<section className="mt-6" aria-labelledby="checkout-sport-reviews-title">
			<div className="flex items-center justify-between gap-3">
				<h2 id="checkout-sport-reviews-title" className="font-heading text-base font-bold text-[#343133]">
					{t('booking.reviews')}
				</h2>
				<a href="/#testimoni" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#404F14] underline underline-offset-2">
					{t('booking.viewMore')} <ArrowRight size={14} aria-hidden="true" />
				</a>
			</div>

			{isLoading ? (
				<p role="status" className="mt-3 text-sm text-[#6F6B6E]">{t('booking.reviewsLoading')}</p>
			) : hasError ? (
				<p role="status" className="mt-3 text-sm text-[#6F6B6E]">{t('booking.reviewsUnavailable')}</p>
			) : reviews.length === 0 ? (
				<p className="mt-3 text-sm text-[#6F6B6E]">{t('booking.reviewsEmpty')}</p>
			) : (
				<div className="mt-3 space-y-3">
					{reviews.map((review) => (
						<article key={review.id} className="rounded-xl border border-[#D4D4D4] bg-white p-3.5">
							<div className="flex items-start gap-3">
								<span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E8EBE4] font-heading text-sm font-bold text-[#404F14]" aria-hidden="true">
									{review.name.trim().charAt(0).toUpperCase()}
								</span>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
										<p className="font-heading text-sm font-semibold text-[#121212]">{review.name}</p>
										<time dateTime={review.createdAt} className="text-xs text-[#8A8688]">{formatReviewDate(review.createdAt, i18n.language)}</time>
									</div>
									<p className="mt-0.5 truncate text-xs text-[#6F6B6E]">{review.company ?? 'OBC Sport Center'}</p>
									<div className="mt-1 flex items-center gap-1" aria-label={t('booking.ratingOutOfFive', { rating: review.rating })}>
										{[1, 2, 3, 4, 5].map((value) => (
											<Star key={value} size={14} aria-hidden="true" className={value <= review.rating ? 'fill-[#F5B301] text-[#F5B301]' : 'text-[#D4D4D4]'} />
										))}
										<span className="ml-1 text-xs font-semibold text-[#343133]">{review.rating.toFixed(1)}</span>
									</div>
								</div>
							</div>
							<p className="mt-3 text-sm leading-relaxed text-[#343133]">{review.text}</p>
						</article>
					))}
				</div>
			)}
		</section>
	)
}

export default TopSportReviews