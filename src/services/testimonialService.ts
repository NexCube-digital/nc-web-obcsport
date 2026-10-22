import { api } from './apiService'

interface ApiSuccess<T> {
	data: T
}

export interface ResourceReview {
	id: string
	rating: number
	category: string
	comment: string
	photos: string[]
	createdAt: string
	customer: { id: string; name: string; avatarUrl: string | null }
}

export interface ResourceReviews {
	reviews: ResourceReview[]
	pagination: { total: number; page: number; limit: number; totalPages: number }
	summary: {
		averageRating: number
		totalReviews: number
		distribution: Record<1 | 2 | 3 | 4 | 5, number>
	}
}

export interface CreateReviewInput {
	rating: number
	comment: string
	category?: string
	bookingId?: string
	photos?: string[]
}

export async function getResourceReviews(
	resourceId: string,
	params: { page?: number; limit?: number; rating?: number; category?: string } = {},
) {
	const response = await api.get<ApiSuccess<ResourceReviews>>(
		`/sports/resources/${resourceId}/reviews`,
		{ params },
	)
	return response.data.data
}

export async function createResourceReview(resourceId: string, input: CreateReviewInput) {
	const response = await api.post<ApiSuccess<ResourceReview>>(
		`/sports/resources/${resourceId}/reviews`,
		input,
	)
	return response.data.data
}
