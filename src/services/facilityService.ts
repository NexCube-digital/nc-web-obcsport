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
	parallelUnits?: number
	amenities: string[]
	imageUrl: string | null
	gallery: string[] | null
	slotMinutes: number
	tenantId: string
	tenant: { id: string; name: string; slug: string }
	location: { id: string; name: string; city: string; address: string } | null
	fromPrice: number | null
	fromPriceFormatted: string | null
}

export interface FacilityPriceTier {
	id: string
	dayType: 'weekday' | 'weekend'
	tierStart: number
	tierEnd: number
	pricePerHour: number
	pricePerHourFormatted: string
	priority: number
}

export async function getFacilityPriceTiers(resourceId: string) {
	const response = await api.get<ApiSuccess<FacilityPriceTier[]>>(`/sports/resources/${resourceId}/pricing`)
	return response.data.data
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

export interface FacilityCalendarDate {
	date: string
	status: 'available' | 'partial' | 'full' | 'closed' | 'maintenance'
	availableCount: number
	totalCount: number
	hasBookings: boolean
}

export interface FacilityCalendar {
	resourceId: string
	from: string
	to: string
	dates: FacilityCalendarDate[]
}

export interface AvailabilitySummaryResource {
	id: string
	name: string
	slug: string
	status: 'available' | 'partial' | 'full' | 'closed'
	available: boolean
	availableCount: number
	totalCount: number
}

export interface AvailabilitySummary {
	date: string
	hasFullDayAvailabilityIssue: boolean
	messages: string[]
	resources: AvailabilitySummaryResource[]
}

export async function getAvailabilitySummary(date?: string, tenant = 'obc-sport') {
	const response = await api.get<ApiSuccess<AvailabilitySummary>>('/sports/availability/summary', {
		params: { ...(date ? { date } : {}), tenant },
	})
	return response.data.data
}

export async function getSportsFacilities(tenant = 'obc-sport') {
	const response = await api.get<ApiSuccess<SportsFacility[]>>('/sports/resources', {
		params: { tenant },
		timeout: 10_000,
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

export async function getFacilityCalendar(resourceId: string, from: string, to: string) {
	const response = await api.get<ApiSuccess<FacilityCalendar>>('/sports/availability/calendar', {
		params: { resourceId, from, to },
	})
	return response.data.data
}
