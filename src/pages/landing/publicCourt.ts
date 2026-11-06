import { getSportsFacilities, type SportsFacility } from '../../services/facilityService'
import { getImageUrl } from '../../utils/imageUrl'
import fallbackCourtImage from '../../assets/no-image.webp'

export type PublicCourt = SportsFacility
export { fallbackCourtImage }

export function getPublicCourts() {
	return getSportsFacilities()
}

export function getCourtImages(court: PublicCourt) {
	const images = [court.imageUrl, ...(court.gallery ?? [])]
		.filter((image): image is string => Boolean(image))
		.map((image) => getImageUrl(image))
		.filter((image): image is string => Boolean(image))
	return images.length ? images : [fallbackCourtImage]
}

export function formatCourtPrice(price: number | null, formattedPrice: string | null, fallback = 'Harga tersedia saat booking') {
	return formattedPrice ?? (price == null ? fallback : `Mulai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)}`)
}
