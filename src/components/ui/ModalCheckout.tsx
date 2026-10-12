import { useEffect } from 'react'
import { ShoppingCart, X } from 'lucide-react'

interface ModalCheckoutProps {
	isOpen: boolean
	facility: string
	duration: number
	dateTime: string
	total: number
	onClose: () => void
	onOrder: () => void
	onAddToCart: () => void
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function ModalCheckout({
	isOpen,
	facility,
	duration,
	dateTime,
	total,
	onClose,
	onOrder,
	onAddToCart,
}: ModalCheckoutProps) {
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}

		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
		const previousOverflow = document.body.style.overflow
		const previousPaddingRight = document.body.style.paddingRight
		const currentPaddingRight = Number.parseFloat(
			window.getComputedStyle(document.body).paddingRight,
		) || 0

		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
		}
		document.body.style.overflow = 'hidden'
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			document.body.style.paddingRight = previousPaddingRight
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-[#343133]/50 p-4"
			onClick={onClose}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="checkout-summary-title"
				onClick={(event) => event.stopPropagation()}
				className="w-full max-w-[480px] rounded-2xl bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:p-7"
			>
				<header className="flex items-center justify-between gap-4">
					<h2 id="checkout-summary-title" className="font-heading text-lg font-bold text-[#343133]">
						Ringkasan Pemesanan
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Tutup ringkasan pemesanan"
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6F6B6E] transition-colors hover:bg-[#F1F4EA] hover:text-[#004000]"
					>
						<X size={18} aria-hidden="true" />
					</button>
				</header>

				<dl className="mt-5 space-y-3 border-b border-[#D4D4D4] pb-4 text-sm">
					<div className="flex items-center justify-between gap-4">
						<dt className="text-[#343133]">Fasilitas</dt>
						<dd className="text-right font-heading font-bold text-[#121212]">{facility}</dd>
					</div>
					<div className="flex items-center justify-between gap-4">
						<dt className="text-[#343133]">Durasi</dt>
						<dd className="text-right font-heading font-bold text-[#121212]">
							{duration > 0 ? `${duration} Jam` : '-'}
						</dd>
					</div>
					<div className="flex items-start justify-between gap-4">
						<dt className="shrink-0 text-[#343133]">Tanggal &amp; Waktu</dt>
						<dd className="text-right font-heading font-bold text-[#121212]">{dateTime}</dd>
					</div>
				</dl>

				<div className="mt-4 flex items-center justify-between gap-4">
					<span className="font-heading text-sm font-bold text-[#121212]">Total Bayar</span>
					<span className="font-heading text-xl font-bold text-[#265021]">
						{formatRupiah(total)}
					</span>
				</div>

				<div className="mt-6 flex items-center gap-3">
					<button
						type="button"
						onClick={onOrder}
						className="h-11 flex-1 rounded-lg bg-[#CDF178] px-4 text-sm font-heading font-bold text-[#121212] transition-colors hover:bg-[#9AAD3E]"
					>
						Pesan Sekarang
					</button>
					<button
						type="button"
						aria-label="Tambah ke keranjang"
						onClick={onAddToCart}
						className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white text-[#6F6B6E] transition-colors hover:text-[#404F14]"
					>
						<ShoppingCart size={19} aria-hidden="true" />
					</button>
				</div>
			</section>
		</div>
	)
}

export default ModalCheckout
