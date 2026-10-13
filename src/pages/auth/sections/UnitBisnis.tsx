import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import sportCenterLogo from '../../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import guestHouseLogo from '../../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER (1).png'
import villaLogo from '../../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER (3).png'
import laundryLogo from '../../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER (4).png'
import foodCourtLogo from '../../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER (5).png'
import coffeeLogo from '../../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER (6).png'
import agribusinessLogo from '../../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER (7).png'

/* PERUBAHAN: teks ditulis langsung (tanpa i18n) supaya tidak muncul key mentah */
const TEXT = {
	badge: 'Bisnis Kami',
	title: 'Beragam Layanan dalam Satu Ekosistem',
	booking: 'Booking Now',
	detail: 'Detail Unit',
}

type Unit = {
	name: string
	image: string
	link: string
	isExternal: boolean
}

const units: Unit[] = [
	{ name: 'OBC Sport Center', image: sportCenterLogo, link: 'https://sport.obcgroup.id/', isExternal: true },
	{ name: 'OBC Guest House', image: guestHouseLogo, link: '/unit-bisnis/guest-house', isExternal: false },
	{ name: 'OBC Villa', image: villaLogo, link: '/unit-bisnis/villa', isExternal: false },
	{ name: 'OBC Laundry', image: laundryLogo, link: '/unit-bisnis/laundry', isExternal: false },
	{ name: 'OBC Food Court', image: foodCourtLogo, link: '/unit-bisnis/food-court', isExternal: false },
	{ name: 'OBC Coffee', image: coffeeLogo, link: '/unit-bisnis/coffee', isExternal: false },
	{ name: 'OBC Agribisnis', image: agribusinessLogo, link: '/unit-bisnis/agribisnis', isExternal: false },
]

/* PERUBAHAN: font Montserrat dipaksa lewat kelas (sesuai desain). Pastikan Montserrat sudah di-load di index.html */
const FONT = "font-['Montserrat',sans-serif]"

/* PERUBAHAN: gaya tombol dibuat inline, tidak lagi bergantung .btn-booking-now */
const bookingClass = `${FONT} inline-flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-3 text-[11px] font-bold text-black shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#004000] hover:text-white`
const detailClass = `${FONT} inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-black transition-colors hover:text-[#004000]`

type UnitCardProps = {
	unit: Unit
	isFavorite: boolean
	onToggleFavorite: (name: string) => void
	className?: string
}

function UnitCard({ unit, isFavorite, onToggleFavorite, className = '' }: UnitCardProps) {
	const [isHeartHovered, setIsHeartHovered] = useState(false)
	const stretchedClass = 'absolute inset-0 z-0 rounded-[20px]'

	const BookingLink = unit.isExternal ? (
		<a className={bookingClass} href={unit.link} target="_blank" rel="noreferrer">
			{TEXT.booking}
		</a>
	) : (
		<Link className={bookingClass} to={unit.link}>
			{TEXT.booking}
		</Link>
	)

	const DetailLink = unit.isExternal ? (
		<a className={detailClass} href={unit.link} target="_blank" rel="noreferrer">
			{TEXT.detail} <ArrowRight size={14} />
		</a>
	) : (
		<Link className={detailClass} to={unit.link}>
			{TEXT.detail} <ArrowRight size={14} />
		</Link>
	)

	return (
		<article
			className={`group relative flex cursor-pointer flex-col rounded-[20px] bg-white p-3 pb-4 shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,64,0,0.18)] md:p-4 md:pb-5 lg:p-3 lg:pb-4 ${className}`}
		>
			{/* Stretched link ke halaman unit */}
			{unit.isExternal ? (
				<a className={stretchedClass} href={unit.link} target="_blank" rel="noreferrer" aria-label={`Buka ${unit.name}`} />
			) : (
				<Link className={stretchedClass} to={unit.link} aria-label={`Buka ${unit.name}`} />
			)}

			{/* Tombol favorit: ikon hati outline tanpa lingkaran (sesuai desain) */}
			<button
				type="button"
				className="absolute right-3 top-3 z-10 grid h-8 w-8 cursor-pointer place-items-center bg-transparent text-black"
				onMouseEnter={() => setIsHeartHovered(true)}
				onMouseLeave={() => setIsHeartHovered(false)}
				onClick={(e) => {
					e.stopPropagation()
					onToggleFavorite(unit.name)
				}}
				aria-label={isFavorite ? `Hapus ${unit.name} dari favorit` : `Tambah ${unit.name} ke favorit`}
			>
				<Heart
					className={`h-[20px] w-[20px] ${
						isFavorite ? 'fill-red-500 text-red-500' : isHeartHovered ? 'fill-[#004000] text-[#004000]' : ''
					}`}
				/>
			</button>

			{/* Logo di tengah */}
			<div className="pointer-events-none relative z-10 mx-auto mt-4 grid h-[96px] w-[96px] place-items-center md:mt-3 md:h-[clamp(96px,17svh,144px)] md:w-[clamp(96px,17svh,144px)] lg:mt-2 lg:h-[clamp(88px,13svh,144px)] lg:w-[clamp(88px,13svh,144px)]">
				<img
					className="block max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
					src={unit.image}
					alt={`Logo ${unit.name}`}
					loading="lazy"
					decoding="async"
				/>
			</div>

			{/* Nama + tombol, rata kiri seperti desain */}
			<div className="relative z-10 mt-3 w-full px-1 md:mt-4 md:px-2 lg:mt-2">
				<h3 className={`${FONT} text-[15px] font-bold leading-tight text-black md:text-[17px]`}>{unit.name}</h3>
				<div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
					{BookingLink}
					{DetailLink}
				</div>
			</div>
		</article>
	)
}

export default function UnitBisnis() {
	const [favorites, setFavorites] = useState<string[]>([])

	const toggleFavorite = (name: string) => {
		setFavorites((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
	}

	return (
		<section
			className="mx-auto flex min-h-[100svh] w-[calc(100%-32px)] max-w-[1280px] flex-col justify-center py-10 md:w-[calc(100%-48px)] md:py-14 lg:py-6"
			id="layanan"
		>
			{/* Label kecil kapital abu-abu */}
			<span className={`${FONT} mb-2 block text-center text-[14px] font-medium uppercase tracking-[2px] text-[#000000B3] md:text-[18px]`}>
				{TEXT.badge}
			</span>
			<h2 className={`${FONT} mx-auto w-full max-w-[1098px] text-center text-[24px] font-bold leading-[32px] tracking-[0.5px] text-black md:text-[36px] md:leading-[45px] md:tracking-[1.5px]`}>
				{TEXT.title}
			</h2>
			<div className="mx-auto mt-4 w-full max-w-[812px] border-t-2 border-[#00000080]" aria-hidden="true" />

			{/* Baris 1: 4 unit */}
			<div className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 lg:gap-4">
				{units.slice(0, 4).map((unit) => (
					<UnitCard
						key={unit.name}
						unit={unit}
						isFavorite={favorites.includes(unit.name)}
						onToggleFavorite={toggleFavorite}
					/>
				))}
			</div>

			{/* Baris 2: 3 unit, di tengah */}
			<div className="mx-auto mt-4 grid w-full grid-cols-2 gap-4 md:mt-6 md:gap-6 lg:mt-4 lg:max-w-[calc(3*280px+2*1.5rem)] lg:grid-cols-3 lg:gap-4">
				{units.slice(4).map((unit) => (
					<UnitCard
						key={unit.name}
						unit={unit}
						isFavorite={favorites.includes(unit.name)}
						onToggleFavorite={toggleFavorite}
						className="last:col-span-2 last:mx-auto last:w-[calc(50%-8px)] lg:last:col-span-1 lg:last:w-full"
					/>
				))}
			</div>
		</section>
	)
}