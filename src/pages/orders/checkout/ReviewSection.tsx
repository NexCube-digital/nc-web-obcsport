import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getApiErrorMessage } from '../../../services/apiService'
import { getResourceReviews, type ResourceReview, type ResourceReviews } from '../../../services/testimonialService'

type ReviewCategory = 'lapangan' | 'wc'
type ReviewFilter = 'semua' | ReviewCategory

interface FilterOption {
  id: ReviewFilter
  label: string
}

const REVIEW_FILTERS: FilterOption[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'lapangan', label: 'Kondisi Lapangan' },
  { id: 'wc', label: 'Kebersihan WC' },
]

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} size={size} className={value <= rating ? 'fill-[#F5B301] text-[#F5B301]' : 'text-[#D4D4D4]'} />
      ))}
    </div>
  )
}

function MobileStars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          size={size}
          className={index < rating ? 'fill-[#F5B301] text-[#F5B301]' : 'fill-white text-[#D4D4D4]'}
        />
      ))}
    </div>
  )
}

const getInitials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('')

interface ReviewSectionProps {
  variant: 'mobile' | 'desktop'
  resourceId: string
}

function ReviewSection({ variant, resourceId }: ReviewSectionProps) {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('semua')
  const [page, setPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)
  const [reviews, setReviews] = useState<ResourceReview[]>([])
  const [summary, setSummary] = useState<ResourceReviews['summary'] | null>(null)
  const [pagination, setPagination] = useState<ResourceReviews['pagination'] | null>(null)
  const [loadedQueryKey, setLoadedQueryKey] = useState('')
  const [loadError, setLoadError] = useState('')
  const limit = variant === 'mobile' ? 3 : 5
  const queryKey = `${resourceId}:${reviewFilter}:${page}:${retryCount}`
  const isLoading = Boolean(resourceId) && loadedQueryKey !== queryKey

  useEffect(() => {
    if (!resourceId) return
    let active = true
    const params = {
      page,
      limit,
      ...(reviewFilter !== 'semua' ? { category: reviewFilter } : {}),
    }

    getResourceReviews(resourceId, params)
      .then((result) => {
        if (!active) return
        setReviews((current) => page === 1 ? result.reviews : [...current, ...result.reviews])
        setSummary(result.summary)
        setPagination(result.pagination)
        setLoadError('')
        setLoadedQueryKey(queryKey)
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadError(getApiErrorMessage(error, 'Ulasan gagal dimuat.'))
        setLoadedQueryKey(queryKey)
      })

    return () => { active = false }
  }, [limit, page, queryKey, resourceId, reviewFilter])

  const handleFilterChange = (filter: ReviewFilter) => {
    setReviews([])
    setPage(1)
    setReviewFilter(filter)
  }

  const handleRetry = () => setRetryCount((current) => current + 1)

  const formatReviewDate = (date: string) => new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))

  const renderEmptyState = () => {
    if (isLoading) return <p role="status" className="py-4 text-center text-sm text-[#6F6B6E]">Memuat ulasan...</p>
    if (loadError) {
      return (
        <div className="py-4 text-center">
          <p role="alert" className="text-sm text-[#6F6B6E]">{loadError}</p>
          <button type="button" onClick={handleRetry} className="mt-2 text-xs font-semibold text-[#404F14] underline">Coba lagi</button>
        </div>
      )
    }
    return <p className="py-4 text-center text-sm text-[#6F6B6E]">Belum ada ulasan untuk fasilitas ini.</p>
  }

  const renderCommunityReview = (review: ResourceReview) => (
    <article key={review.id} className="rounded-xl border border-[#D4D4D4] bg-white p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EBE4] font-heading text-xs font-bold text-[#404F14]">
          {getInitials(review.customer.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-heading text-sm font-semibold text-[#121212]">{review.customer.name}</p>
            <span className="shrink-0 text-[10px] text-[#8A8688]">{formatReviewDate(review.createdAt)}</span>
          </div>
          <div className="mt-0.5"><MobileStars rating={review.rating} /></div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#6F6B6E]">{review.comment}</p>
    </article>
  )

  return (
    variant === 'mobile' ? (
      <section className="mt-6 rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-[#265021]">Ulasan Komunitas</h2>
          <span className="inline-flex items-center gap-1 text-xs text-[#6F6B6E]">
            <Star size={14} className="fill-[#F5B301] text-[#F5B301]" />
            <span className="font-heading text-sm font-bold text-[#265021]">{summary?.averageRating.toFixed(1) ?? '0.0'}</span>
            ({summary?.totalReviews ?? 0} ulasan)
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {reviews.map(renderCommunityReview)}
          {!isLoading && reviews.length === 0 && renderEmptyState()}
          {loadError && reviews.length > 0 && (
            <div className="text-center">
              <p role="alert" className="text-xs text-[#6F6B6E]">{loadError}</p>
              <button type="button" onClick={handleRetry} className="mt-1 text-xs font-semibold text-[#404F14] underline">Coba lagi</button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          {pagination && page < pagination.totalPages && (
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={isLoading}
              className="cursor-pointer rounded-lg border border-[#E5E5E5] bg-white px-5 py-2 text-xs text-[#343133] shadow-[0_2px_6px_rgba(0,0,0,0.08)] disabled:opacity-60"
            >
              {isLoading ? 'Memuat...' : 'Lihat Selengkapnya'}
            </button>
          )}
        </div>
      </section>
    ) : (
      <section className="mt-6">
        <h2 className="font-heading text-base font-bold text-[#343133]">Ulasan Pengguna</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {REVIEW_FILTERS.map((filter) => {
            const isActive = reviewFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleFilterChange(filter.id)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-heading font-semibold transition-colors ${
                  isActive
                    ? 'border-[#CDF178] bg-[#CDF178] text-[#404F14]'
                    : 'border-[#404F14] bg-white text-[#404F14] hover:bg-[#F5FAF3]'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        <div className="mt-3 space-y-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-[#D4D4D4] bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-xs font-bold text-[#121212]">{review.customer.name}</p>
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="font-heading text-sm font-semibold text-[#343133]">{review.rating.toFixed(1)} / 5.0</span>
                  <span className="text-sm text-[#343133]">{formatReviewDate(review.createdAt)}</span>
                </div>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#343133]">{review.comment}</p>
            </article>
          ))}
          {reviews.length === 0 && renderEmptyState()}
        </div>
        {loadError && reviews.length > 0 && (
          <div className="mt-2">
            <p role="alert" className="text-xs text-[#6F6B6E]">{loadError}</p>
            <button type="button" onClick={handleRetry} className="mt-1 text-xs font-semibold text-[#404F14] underline">Coba lagi</button>
          </div>
        )}
        {pagination && page < pagination.totalPages && (
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={isLoading}
            className="mt-3 cursor-pointer text-xs font-semibold text-[#404F14] underline disabled:opacity-60"
          >
            {isLoading ? 'Memuat...' : 'Lihat ulasan lainnya'}
          </button>
        )}
      </section>
    )
  )
}

export default ReviewSection