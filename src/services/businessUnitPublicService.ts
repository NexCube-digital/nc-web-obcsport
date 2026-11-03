import { api } from './apiService'

export interface PublicBusinessUnit {
	id: string
	name: string
	slug: string
	description: string | null
	tenantType: 'sport' | 'event' | 'fnb' | 'other'
	config: Record<string, unknown>
}

interface ApiSuccess<T> {
	data: T
}

export async function getPublicBusinessUnits(): Promise<PublicBusinessUnit[]> {
	const response = await api.get<ApiSuccess<PublicBusinessUnit[]>>('/public/tenants')
	return response.data.data
}