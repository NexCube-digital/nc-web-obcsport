import { api } from './apiService'

interface ApiSuccess<T> {
	success: true
	data: T
}

export interface SportsFacility {
	id: string
	name: string
	slug: string
	description: string | null
	resourceType: string
	sportTypes: string[]
	capacity: number | null
	amenities: string[]
	slotMinutes: number
	tenantId: string
	tenant: { id: string; name: string; slug: string }
	location: { id: string; name: string; city: string; address: string } | null
	fromPrice: number | null
	fromPriceFormatted: string | null
}

export interface AvailabilitySlot {
	startMinute: number
	endMinute: number
	startTime: string
	endTime: string
	status: 'available' | 'booked' | 'locked' | 'maintenance' | 'closed'
	available: boolean
	price: number | null
	priceFormatted: string | null
	lockExpiresAt: string | null
}

export interface FacilityAvailability {
	resourceId: string
	resourceName: string
	date: string
	dayOfWeek: string
	slotMinutes: number
	startIntervalMinutes: number
	isClosed: boolean
	operatingHours: { openTime: string; closeTime: string } | null
	slots: AvailabilitySlot[]
	counts: { total: number; available: number; booked: number; locked: number }
}

export async function getSportsFacilities(tenant = 'obc-sport') {
	const response = await api.get<ApiSuccess<SportsFacility[]>>('/sports/resources', {
		params: { tenant },
	})
	return response.data.data
}

export async function getFacilityAvailability(
	resourceId: string,
	date: string,
	sportType?: string,
) {
	const response = await api.get<ApiSuccess<FacilityAvailability>>('/sports/availability', {
		params: { resourceId, date, ...(sportType ? { sportType } : {}) },
	})
	return response.data.data
}
