import { useEffect, useState } from 'react'
import { Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getApiErrorMessage } from '../../services/apiService'
import { createResourceReview } from '../../services/testimonialService'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
export interface TestimonialPayload {
  rating: number
  text: string
}

interface TestimonialModalProps {
  isOpen: boolean
  onClose: () => void
  onDefer: () => void
  /** Contoh: "Lapangan F1" */
  facilityName: string
  /** Contoh: "Senin, 12 Januari 2026" */
  dateLabel: string
  resourceId: string
  bookingId?: string
  onSubmit?: (payload: TestimonialPayload) => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"
const STAR_VALUES = [1, 2, 3, 4, 5]
const DEFAULT_RATING = 5
const MIN_REVIEW_LENGTH = 20
const MAX_REVIEW_LENGTH = 2000

function TestimonialModal({
  isOpen,
  onClose,
  onDefer,
  facilityName,
  dateLabel,
  resourceId,
  bookingId,
  onSubmit,
}: TestimonialModalProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(DEFAULT_RATING)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Kunci scroll halaman selama modal aktif; modal hanya ditutup setelah ulasan dikirim atau ditunda.
  useEffect(() => {
    if (!isOpen) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const currentPaddingRight =
      Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async () => {
    const trimmedReview = review.trim()
    if (trimmedReview.length < 3 || isSubmitting) return

    setIsSubmitting(true)
    try {
      await createResourceReview(resourceId, {
        rating,
        comment: trimmedReview,
        ...(bookingId ? { bookingId } : {}),
      })
      toast.success(t('testimonialModal.success'))
      onSubmit?.({ rating, text: trimmedReview })
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('testimonialModal.failure')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      {/* Ukuran PC pas: 556 x 525, tanpa scroll */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-[720px] flex-col overflow-y-auto rounded-t-[25px] border border-[#ececec] bg-white p-5 shadow-[0_5px_80px_0_rgba(0,0,0,0.25)] max-[400px]:p-4 sm:max-h-[calc(100dvh-40px)] sm:rounded-[25px] sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('testimonialModal.close')}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border-[0.67px] border-[#1F3320] bg-white text-[#1F3320] transition-colors hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#404F14]"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {/* ================= Header ================= */}
        <header className="shrink-0 border-b border-[#ececec] pb-4 pr-10">
          <span className="block font-['Montserrat'] text-[13px] font-semibold uppercase tracking-[1.4px] text-[#000000CC]">
            {t('testimonialModal.eyebrow')}
          </span>
          <h2
            id="testimonial-modal-title"
            className={`${FONT_MONTSERRAT} mt-1 text-[22px] font-bold leading-[30px] text-[#1F3320] sm:text-[26px] sm:leading-[34px]`}
          >
            {t('testimonialModal.title')}
          </h2>
          <p className="mt-2 font-['Montserrat'] text-[13px] leading-[20px] text-[#4b5563]">
            {facilityName} · {dateLabel}
          </p>
        </header>

        <div className="flex flex-col pt-5">
          {/* Rating */}
          <p className="font-['Montserrat'] text-[13px] font-semibold text-[#1F3320]">
            {t('testimonialModal.ratingPrompt')}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <div className="flex gap-0.5" role="radiogroup" aria-label={t('testimonialModal.ratingLabel')}>
              {STAR_VALUES.map((value) => {
                const isFilled = value <= rating
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={value === rating}
                    aria-label={t('testimonialModal.stars', { count: value })}
                    onClick={() => setRating(value)}
                    className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      strokeWidth={1.5}
                      className={
                        isFilled
                          ? 'fill-current text-[#f5a623]'
                            : 'fill-transparent text-[#d1d5db]'
                      }
                    />
                  </button>
                )
              })}
            </div>
            <span className="ml-2 font-['Montserrat'] text-[16px] font-semibold text-[#1F3320]">{rating}.0</span>
          </div>

          {/* Ulasan */}
          <label
            htmlFor="testimonial-review"
            className="mb-1.5 mt-5 font-['Montserrat'] text-[13px] font-semibold text-[#1F3320]"
          >
            {t('testimonialModal.reviewLabel')}
          </label>
          <textarea
            id="testimonial-review"
            value={review}
            onChange={(event) => setReview(event.target.value)}
            maxLength={MAX_REVIEW_LENGTH}
            placeholder={t('testimonialModal.placeholder')}
            className="h-28 w-full resize-none rounded-[12px] border border-[#e5e5e5] bg-white px-4 py-3 font-['Montserrat'] text-[14px] text-[#000000] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#004000] focus:ring-2 focus:ring-[#CDF178]"
          />

          {/* Kirim */}
          <div className="mt-1 flex justify-between font-['Montserrat'] text-[12px]">
            <p className={review.trim().length > 0 && review.trim().length < MIN_REVIEW_LENGTH ? 'text-red-500' : 'text-[#6b7280]'}>
              {review.trim().length > 0 && review.trim().length < MIN_REVIEW_LENGTH
                ? t('testimonialModal.minimumCharacters', { count: MIN_REVIEW_LENGTH })
                : ' '}
            </p>
            <span className="shrink-0 text-[#6b7280]">{review.length}/{MAX_REVIEW_LENGTH}</span>
          </div>
          <div className="mt-4 flex w-full items-center justify-end gap-3">
            <button
              type="button"
              onClick={onDefer}
              className="h-10 shrink-0 cursor-pointer rounded-[45px] border border-[#D4D4D4] bg-white px-5 font-['Montserrat'] text-[13px] font-semibold text-[#343133] transition-colors hover:bg-[#F5FAF3]"
            >
              {t('testimonialModal.defer')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={review.trim().length < MIN_REVIEW_LENGTH || isSubmitting}
              className="h-11 cursor-pointer rounded-[45px] border-[0.67px] border-[#CDF178] bg-[#CDF178] px-5 font-['Montserrat'] text-[13px] font-semibold text-[#000000] shadow-[0px_3px_5.8px_0px_#0000004D] transition-colors hover:bg-[#c0e85a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t('testimonialModal.submitting') : t('testimonialModal.submit')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TestimonialModal