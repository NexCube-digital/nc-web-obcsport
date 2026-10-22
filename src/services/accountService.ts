import axios from 'axios'
import { api } from './apiService'
import { saveUser } from '../utils/auth'

export interface CustomerProfileData {
	name?: string
	username?: string | null
	bio?: string | null
	email?: string
	phone?: string | null
	avatarUrl?: string | null
}

function unwrap<T>(body: unknown): T {
	const payload = body as { data?: T } | undefined
	return (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined
		? payload.data
		: body) as T
}

export function getAccountErrorMessage(error: unknown, fallback: string): string {
	if (!axios.isAxiosError(error)) {
		return error instanceof Error ? error.message : fallback
	}
	const body = error.response?.data as
		| { message?: string; error?: string | { message?: string }; details?: Array<{ message: string }> }
		| undefined
	if (!body) return error.message || fallback
	if (body.details?.[0]?.message) return body.details[0].message
	if (typeof body.error === 'object' && body.error?.message) return body.error.message
	if (typeof body.error === 'string') return body.error
	return body.message ?? fallback
}

export async function getProfile(): Promise<CustomerProfileData> {
	const response = await api.get('/customer/profile')
	return unwrap<CustomerProfileData>(response.data)
}

export async function updateProfile(payload: {
	name?: string
	username?: string | null
	phone?: string | null
	bio?: string | null
}): Promise<CustomerProfileData> {
	const response = await api.put('/customer/profile', payload)
	const updated = unwrap<CustomerProfileData>(response.data)

	if (updated?.name && updated?.email) {
		saveUser({ name: updated.name, email: updated.email })
	}
	return updated
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl?: string }> {
	const formData = new FormData()
	formData.append('photo', file)
	const response = await api.post('/customer/avatar', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
	return unwrap<{ avatarUrl?: string }>(response.data)
}

export async function changePassword(currentPassword: string, newPassword: string) {
	const response = await api.post('/customer/password', { currentPassword, newPassword })
	return unwrap<{ message?: string }>(response.data)
}