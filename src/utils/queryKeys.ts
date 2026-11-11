export const queryKeys = {
	sportsFacilities: (tenant = 'obc-sport') => ['sports-facilities', tenant] as const,
	facilityPriceTiers: (resourceId: string) => ['facility-price-tiers', resourceId] as const,
	facilityAvailability: (resourceId: string, date: string, sportType?: string) =>
		['facility-availability', resourceId, date, sportType ?? null] as const,
	facilityAvailabilityPrefix: ['facility-availability'] as const,
	facilityCalendar: (resourceId: string, from: string, to: string) =>
		['facility-calendar', resourceId, from, to] as const,
	membershipPackages: (sportType?: string, resourceId?: string) =>
		['membership-packages', sportType ?? null, resourceId ?? null] as const,
	customerHistory: (customerKey: string) => ['customer-history', customerKey] as const,
	myMemberships: (customerKey: string) => ['my-memberships', customerKey] as const,
	membershipDetail: (customerKey: string, id: string) => ['membership-detail', customerKey, id] as const,
	publicTestimonials: ['public-testimonials'] as const,
	notifications: {
		all: ['notifications'] as const,
		listPrefix: (customerKey: string) => ['notifications', 'list', customerKey] as const,
		list: (customerKey: string, page: number, limit: number) => ['notifications', 'list', customerKey, page, limit] as const,
		unreadCount: (customerKey: string) => ['notifications', 'unread-count', customerKey] as const,
	},
	cart: (customerKey: string) => ['backend-cart', customerKey] as const,
	facilityCalendarPrefix: ['facility-calendar'] as const,
	customerHistoryPrefix: ['customer-history'] as const,
	myMembershipsPrefix: ['my-memberships'] as const,
	cartPrefix: ['backend-cart'] as const,
}