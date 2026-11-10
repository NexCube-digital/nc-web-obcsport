import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import studentPromo from '../../assets/promo/Famplet_Futsal_&_Basket.png'
import membershipPromo from '../../assets/promo/Famplet_Membership.png'
import pickleballPromo from '../../assets/promo/Famplet_Pickleball.png'

const PROMO_IMAGES = [studentPromo, membershipPromo, pickleballPromo]

function Promo() {
	const { t } = useTranslation()
	const promos = t('landing.promos', { returnObjects: true }) as Array<{ title: string; description: string }>
	const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)
	const [isImageZoomed, setIsImageZoomed] = useState(false)

	const dialogRef = useRef<HTMLDivElement>(null)
	const closeButtonRef = useRef<HTMLButtonElement>(null)

	const closePreview = useCallback(() => {
		setPreviewImage(null)
		setIsImageZoomed(false)
	}, [])

	// Klik area kosong (bukan gambar/tombol) menutup modal
	const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) closePreview()
	}

	useEffect(() => {
		if (!previewImage) return

		const previouslyFocused = document.activeElement as HTMLElement | null
		const previousOverflow = document.body.style.overflow

		document.body.style.overflow = 'hidden'
		closeButtonRef.current?.focus()

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closePreview()
				return
			}

			if (event.key === 'Tab' && dialogRef.current) {
				const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
					'button, [href], [tabindex]:not([tabindex="-1"])',
				)
				if (focusable.length === 0) return

				const first = focusable[0]
				const last = focusable[focusable.length - 1]

				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault()
					last.focus()
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault()
					first.focus()
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', handleKeyDown)
			previouslyFocused?.focus()
		}
	}, [previewImage, closePreview])

	return (
		<section className="mx-auto max-w-[1384px] px-4 pt-10 sm:px-6 sm:pt-12">
			<h2 className="font-['Montserrat',sans-serif] text-base font-bold text-[#265021] min-[360px]:text-lg sm:text-xl">
				{t('landing.promoTitle')}
			</h2>

			<div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pt-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 min-[1200px]:mx-0 min-[1200px]:grid min-[1200px]:grid-cols-3 min-[1200px]:gap-5 min-[1200px]:overflow-visible min-[1200px]:px-0 min-[1200px]:pb-0">
				{promos.map((promo, index) => (
					<article
						key={PROMO_IMAGES[index]}
						className="flex w-[min(360px,88vw)] min-w-[300px] shrink-0 snap-start items-center gap-4 rounded-lg border border-[#E5E5E5] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:gap-5 sm:p-4 min-[1200px]:w-auto min-[1200px]:min-w-0 min-[1200px]:p-4"
					>
						<div className="h-[150px] w-[112px] shrink-0 overflow-hidden rounded-md bg-[#F2F4EF] sm:h-[168px] sm:w-[126px] min-[1200px]:h-[160px] min-[1200px]:w-[120px]">
							<button
								type="button"
								onClick={() => {
									setIsImageZoomed(false)
									setPreviewImage({ src: PROMO_IMAGES[index], alt: promo.title })
								}}
								aria-label={t('landing.zoomImage', { title: promo.title })}
								className="h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#404F14]"
							>
								<img
									src={PROMO_IMAGES[index]}
									alt=""
									className="h-full w-full object-contain"
									loading="lazy"
									decoding="async"
								/>
							</button>
						</div>
						<div className="min-w-0 flex-1">
							<span className="inline-block rounded bg-[#E6F0E0] px-2.5 py-1.5 text-[11px] font-bold leading-none text-[#404F14] font-heading">
								{t('landing.promoBadge')}
							</span>
							<h3 className="mt-2 break-words font-['Montserrat',sans-serif] text-sm font-semibold leading-snug text-[#265021] sm:text-base">
								{promo.title}
							</h3>
							<p className="mt-1 break-words text-sm text-[#343133] font-heading">
								{promo.description}
							</p>
						</div>
					</article>
				))}
			</div>

			{previewImage &&
				createPortal(
					<div
						ref={dialogRef}
						role="dialog"
						aria-modal="true"
						aria-label={previewImage.alt}
						onClick={handleBackdropClick}
						className="fixed inset-0 z-[9999] bg-black/90"
					>
						<div className="absolute right-4 top-4 z-10 flex gap-2">
							<button
								type="button"
								onClick={() => setIsImageZoomed((zoomed) => !zoomed)}
								aria-label={isImageZoomed ? t('landing.zoomOut') : t('landing.zoomIn')}
								className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
							>
								{isImageZoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
							</button>
							<button
								ref={closeButtonRef}
								type="button"
								onClick={closePreview}
								aria-label={t('landing.closeImage')}
								className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
							>
								<X size={22} />
							</button>
						</div>

						<div className="h-full w-full overflow-auto overscroll-contain" onClick={handleBackdropClick}>
							<div
								className="flex min-h-full w-max min-w-full items-center justify-center p-4 pt-20"
								onClick={handleBackdropClick}
							>
								<img
									src={previewImage.src}
									alt={previewImage.alt}
									onClick={() => setIsImageZoomed((zoomed) => !zoomed)}
									draggable={false}
									className={
										isImageZoomed
											? 'w-[min(200vw,1600px)] max-w-none cursor-zoom-out select-none'
											: 'max-h-[calc(100vh-6rem)] max-w-full cursor-zoom-in select-none object-contain'
									}
								/>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</section>
	)
}

export default Promo