import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Star } from 'lucide-react'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
export interface TestimonialPayload {
  rating: number
  review: string
  photos: File[]
}

interface TestimonialModalProps {
  isOpen: boolean
  onClose: () => void
  onDefer: () => void
  /** Contoh: "Lapangan F1" */
  facilityName: string
  /** Contoh: "Senin, 12 Januari 2026" */
  dateLabel: string
  onSubmit?: (payload: TestimonialPayload) => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"
const STAR_VALUES = [1, 2, 3, 4, 5]
const DEFAULT_RATING = 5

function TestimonialModal({
  isOpen,
  onClose,
  onDefer,
  facilityName,
  dateLabel,
  onSubmit,
}: TestimonialModalProps) {
  const [rating, setRating] = useState(DEFAULT_RATING)
  const [review, setReview] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (!isOpen) return
    setRating(DEFAULT_RATING)
    setReview('')
    setPhotos([])
  }, [isOpen])

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

  const handlePickPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    setPhotos(Array.from(event.target.files ?? []))
  }

  const handleSubmit = () => {
    // TODO: kirim ke API ulasan (services/reviewService.js)
    onSubmit?.({ rating, review: review.trim(), photos })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#343133]/40 p-4"
    >
      {/* Ukuran PC pas: 556 x 525, tanpa scroll */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[calc(100vh-32px)] w-full max-w-[556px] flex-col overflow-y-auto rounded-lg bg-[#FDFCF7] shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
      >
        {/* ================= Header ================= */}
        <header className="flex h-[94px] shrink-0 flex-col justify-center border-b border-[#D4D4D4] bg-white px-[26px]">
          <h2
            id="testimonial-modal-title"
            className={`${FONT_MONTSERRAT} text-lg font-semibold leading-6 text-black`}
          >
            Berikan Ulasan anda
          </h2>
          <p className="font-heading text-base leading-5 text-black">
            {facilityName} - {dateLabel}
          </p>
        </header>

        {/* ================= Isi ================= */}
        <div className="flex flex-col px-[45px] pb-[18px] pt-[39px]">
          {/* Rating */}
          <p className="text-center font-heading text-sm leading-5 text-black">
            Bagaimana penlayanan kami secara keseluruhan?
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="flex gap-0.5" role="radiogroup" aria-label="Penilaian bintang">
              {STAR_VALUES.map((value) => {
                const isFilled = value <= rating
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={value === rating}
                    aria-label={`${value} bintang`}
                    onClick={() => setRating(value)}
                    className="cursor-pointer p-0"
                  >
                    <Star
                      size={18}
                      strokeWidth={1.5}
                      className={
                        isFilled
                          ? 'fill-[#FFF1B8] text-[#F5B301]'
                          : 'fill-transparent text-[#BDBDBD]'
                      }
                    />
                  </button>
                )
              })}
            </div>
            <span className="font-heading text-sm font-medium text-black">
              {rating.toFixed(1)} / 5.0
            </span>
          </div>

          {/* Ulasan */}
          <label
            htmlFor="testimonial-review"
            className="mt-[62px] font-heading text-xs leading-4 text-black"
          >
            Tulis Ulasan Anda
          </label>
          <textarea
            id="testimonial-review"
            value={review}
            onChange={(event) => setReview(event.target.value)}
            className="mt-[7px] h-[93px] w-full resize-none rounded-lg border border-[#D4D4D4] bg-white px-3 py-2 font-heading text-sm text-[#343133] focus:border-[#404F14] focus:outline-none"
          />

          {/* Tambah foto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handlePickPhotos}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#BDBDBD] bg-[#FDFCF7] font-heading text-xs text-black transition-colors hover:bg-white"
          >
            {photos.length > 0 ? (
              <span>
                <span aria-hidden="true">📷</span> {photos.length} foto dipilih (klik untuk
                mengganti)
              </span>
            ) : (
              <span>
                <span aria-hidden="true">📷</span> + Tambah Foto Lapangan (Opsional)
              </span>
            )}
          </button>

          {/* Kirim */}
          <div className="mx-auto mt-[50px] flex w-full max-w-[379px] items-center gap-3">
            <button
              type="button"
              onClick={onDefer}
              className="h-10 shrink-0 cursor-pointer rounded-md border border-[#D4D4D4] bg-white px-4 font-heading text-xs font-bold text-[#343133] transition-colors hover:bg-[#F5FAF3]"
            >
              Nanti
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0}
              className="h-10 flex-1 cursor-pointer rounded-md bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Konfirmasi Ulasan
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TestimonialModal