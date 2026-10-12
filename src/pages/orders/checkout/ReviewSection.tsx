import { useState } from 'react'
import { Star } from 'lucide-react'

type ReviewCategory = 'lapangan' | 'wc'
type ReviewFilter = 'semua' | ReviewCategory

interface Review {
  id: string
  name: string
  category: ReviewCategory
  text: string
}

interface CommunityReview {
  id: string
  name: string
  date: string
  rating: number
  text: string
}

interface FilterOption {
  id: ReviewFilter
  label: string
}

const REVIEW_TEXT =
  'Kondisi lapangan sangat prima, interlock-nya rapi tidak licin sama sekali. Kamar mandi juga bersih setelah direnovasi. Sangat direkomendasikan untuk mabar malam.'

const REVIEWS: Review[] = [
  { id: 'r1', name: 'Budi Santoso', category: 'lapangan', text: REVIEW_TEXT },
  { id: 'r2', name: 'Budi Santoso', category: 'wc', text: REVIEW_TEXT },
  { id: 'r3', name: 'Budi Santoso', category: 'lapangan', text: REVIEW_TEXT },
  { id: 'r4', name: 'Budi Santoso', category: 'wc', text: REVIEW_TEXT },
  { id: 'r5', name: 'Budi Santoso', category: 'lapangan', text: REVIEW_TEXT },
]

const REVIEW_FILTERS: FilterOption[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'lapangan', label: 'Kondisi Lapangan' },
  { id: 'wc', label: 'Kebersihan WC' },
]

const COMMUNITY_REVIEWS: CommunityReview[] = [
  {
    id: 'c1',
    name: 'Budi Santoso',
    date: '14 Sep 2026',
    rating: 5,
    text: 'Grip lapangan badmintonnya luar biasa kesat, karet vinyl tebal standar internasional. Kamar mandi bersih dan wangi melati, mantap dipertahankan!',
  },
  {
    id: 'c2',
    name: 'Dewi Lestari',
    date: '10 Sep 2026',
    rating: 4,
    text: 'Lampu lapangan futsal sangat terang, tidak menyilaukan mata saat menengadah bola lambung. Sedikit masukan agar area parkir motor diperluas.',
  },
  {
    id: 'c3',
    name: 'Rian Hidayat',
    date: '05 Sep 2026',
    rating: 5,
    text: 'Proses check-in lapangan lewat QR code sangat praktis. Stafnya ramah dan sigap membantu mencarikan bola voli cadangan saat bola kami tersangkut di atap.',
  },
]

function Stars({ size = 16 }: { size?: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => (
        <Star key={index} size={size} className={index < 4 ? 'text-[#F5B301]' : 'text-[#D4D4D4]'} />
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

function ReviewSection() {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('semua')
  const filteredReviews = REVIEWS.filter(
    (review) => reviewFilter === 'semua' || review.category === reviewFilter,
  )

  return (
    <>
      <section className="mt-6 rounded-2xl border border-[#E5E5E5] bg-white p-4 md:hidden">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-[#265021]">Ulasan Komunitas</h2>
          <span className="inline-flex items-center gap-1 text-xs text-[#6F6B6E]">
            <Star size={14} className="fill-[#F5B301] text-[#F5B301]" />
            <span className="font-heading text-sm font-bold text-[#265021]">4.8</span>
            (124 ulasan)
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {COMMUNITY_REVIEWS.map((review) => (
            <article key={review.id} className="rounded-xl border border-[#D4D4D4] bg-white p-3.5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8EBE4] font-heading text-xs font-bold text-[#404F14]">
                  {getInitials(review.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-heading text-sm font-semibold text-[#121212]">
                      {review.name}
                    </p>
                    <span className="shrink-0 text-[10px] text-[#8A8688]">{review.date}</span>
                  </div>
                  <div className="mt-0.5"><MobileStars rating={review.rating} /></div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#6F6B6E]">{review.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-[#E5E5E5] bg-white px-5 py-2 text-xs text-[#343133] shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          >
            Lihat Selengkapnya 11+
          </button>
        </div>
      </section>

      <section className="mt-6 hidden md:block">
        <h2 className="font-heading text-base font-bold text-[#343133]">Ulasan Pengguna</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {REVIEW_FILTERS.map((filter) => {
            const isActive = reviewFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setReviewFilter(filter.id)}
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
          {filteredReviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-[#D4D4D4] bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-xs font-bold text-[#121212]">{review.name}</p>
                <div className="flex items-center gap-2">
                  <Stars />
                  <span className="font-heading text-sm font-semibold text-[#343133]">5.0 / 5.0</span>
                  <span className="text-sm text-[#343133]">(1 Ulasan Terverifikasi)</span>
                </div>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#343133]">{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default ReviewSection