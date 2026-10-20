import { api } from './apiService'

interface ApiSuccess<T> {
	success: true
	data: T
	meta?: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateBookingInput {
	resourceId: string
	bookingDate: string
	startTime: string
	endTime: string
	sportType: string
	bookingType?: 'regular' | 'membership' | 'event'
	paymentChannel?: PaymentChannel
	membershipSessionId?: string
	packageId?: string
	notes?: string
}

export type PaymentChannel =
	| 'credit_card'
	| 'qris'
	| 'gopay'
	| 'shopeepay'
	| 'ovo'
	| 'dana'
	| 'bca_va'
	| 'bni_va'
	| 'mandiri_va'
	| 'bri_va'
	| 'permata_va'
	| 'alfamart'
	| 'indomaret'

export interface CreatedBooking {
	bookingId: string
	status: string
	totalPrice: number
	totalPriceFormatted: string
	payment:
		| { token: string; redirectUrl: string }
		| { cardPayment: true }
		| { chargeResponse: import('./paymentService').MidtransChargeResponse }
		| { unavailable: true; message: string }
		| null
	holdExpiresAt: string | null
	holdMinutes?: number
	message: string
}

export interface CreditCardChargeResult {
	transactionStatus: string
	redirectUrl: string | null
}

export interface BookingSummary {
	id: string
	bookingDate: string
	startMinute: number
	endMinute: number
	sportType: string
	bookingType: string
	status: string
	basePrice: number
	discountAmount: number
	adminFee: number
	totalPrice: number
	totalPriceFormatted: string
	createdAt: string
	resource: { id: string; name: string; slug: string }
	latestPayment: { id: string; status: string; method: string | null; paidAt: string | null } | null
}

export interface BookingPrice {
	basePrice: number
	discountAmount: number
	adminFee: number
	totalPrice: number
	durationMinutes: number
	dayType: string
	currency: string
	breakdown: Array<{ tierName: string; minutes: number; subtotal: number }>
	formatted: {
		basePrice: string
		discountAmount: string
		adminFee: string
		totalPrice: string
	}
}

export interface BookingDetails {
	id: string
	status: string
	bookingDate: string
	startTime: string
	endTime: string
	durationMinutes: number
	sportType: string
	bookingType: string
	resource: { id: string; name: string; slug: string; resourceType: string }
	pricing: {
		basePrice: number
		discountAmount: number
		adminFee: number
		totalPrice: number
		formatted: { basePrice: string; discountAmount: string; adminFee: string; totalPrice: string }
	}
	payments: Array<{
		id: string
		midtransOrderId: string | null
		paymentType: string
		method: string | null
		amount: number
		amountFormatted: string
		status: string
		paymentDetails: import('./paymentService').MidtransChargeResponse | null
		paidAt: string | null
		createdAt: string
		redirectUrl: string | null
		expiredAt: string | null
	}>
	lockedUntil: string | null
	paidAt: string | null
	cancelledAt: string | null
	completedAt: string | null
}

export async function previewBookingPrice(input: {
	resourceId: string
	bookingDate: string
	startTime: string
	endTime: string
	sportType: string
	paymentMethod?: 'bank_transfer' | 'credit_card' | 'ewallet' | 'convenience_store' | 'qris' | 'other'
	bookingType?: 'regular' | 'membership' | 'event'
	membershipSessionId?: string
	packageId?: string
}) {
	const response = await api.post<ApiSuccess<BookingPrice>>('/sports/pricing/calculate', input)
	return response.data.data
}

export async function createBooking(input: CreateBookingInput) {
	const response = await api.post<ApiSuccess<CreatedBooking>>('/sports/bookings', input)
	return response.data.data
}

export async function getBookings(params: {
	page?: number
	limit?: number
	status?: string
	resourceId?: string
	date?: string
	from?: string
	to?: string
} = {}) {
	const response = await api.get<ApiSuccess<BookingSummary[]>>('/sports/bookings', { params })
	return { bookings: response.data.data, meta: response.data.meta }
}

export async function getBookingDetails(bookingId: string) {
	const response = await api.get<ApiSuccess<BookingDetails>>(`/sports/bookings/${bookingId}`)
	return response.data.data
}

export async function chargeBookingByCreditCard(bookingId: string, tokenId: string, retry = false) {
	const response = await api.post<ApiSuccess<CreditCardChargeResult>>(
		`/sports/bookings/${bookingId}/credit-card`,
		{ tokenId, retry },
	)
	return response.data.data
}

export async function cancelBooking(bookingId: string, reason: string) {
	const response = await api.post<ApiSuccess<{
		bookingId: string
		status: string
		refundEligible: boolean
		paidAmount: number
		paidAmountFormatted: string
		message: string
	}>>(`/sports/bookings/${bookingId}/cancel`, { reason })
	return response.data.data
}
