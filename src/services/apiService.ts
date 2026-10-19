import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { clearUser, getStoredAccessToken, getStoredTokens, saveTokens, type AuthTokens } from '../utils/auth'

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
	headers: { 'Content-Type': 'application/json' },
})

interface ApiSuccess<T> {
	data: T
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean
}

let refreshPromise: Promise<string> | null = null

api.interceptors.request.use((config) => {
	const accessToken = getStoredAccessToken()
	if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
	return config
})

api.interceptors.response.use(
	(response) => response,
	async (error: unknown) => {
		if (!axios.isAxiosError(error) || error.response?.status !== 401) {
			return Promise.reject(error)
		}

		const request = error.config as RetryableRequestConfig | undefined
		if (!request || request._retry || request.url?.includes('/auth/')) {
			return Promise.reject(error)
		}

		const currentAccessToken = getStoredAccessToken()
		const requestAccessToken = request.headers.Authorization?.toString().replace(/^Bearer\s+/i, '')
		if (currentAccessToken && requestAccessToken && currentAccessToken !== requestAccessToken) {
			request._retry = true
			request.headers.Authorization = `Bearer ${currentAccessToken}`
			return api(request)
		}

		const refreshToken = getStoredTokens()?.refreshToken
		if (!refreshToken) {
			clearUser()
			return Promise.reject(error)
		}

		request._retry = true
		try {
			if (!refreshPromise) {
				refreshPromise = api
					.post<ApiSuccess<AuthTokens>>('/auth/customer/refresh', { refreshToken })
					.then(({ data }) => {
						saveTokens(data.data)
						return data.data.accessToken
					})
					.catch((refreshError: unknown) => {
						if (axios.isAxiosError(refreshError) && [401, 403].includes(refreshError.response?.status ?? 0)) {
							clearUser()
						}
						throw refreshError
					})
					.finally(() => {
						refreshPromise = null
					})
			}

			const accessToken = await refreshPromise
			request.headers.Authorization = `Bearer ${accessToken}`
			return api(request)
		} catch (refreshError) {
			return Promise.reject(refreshError)
		}
	},
)

interface ApiErrorBody {
	message?: string
	details?: Array<{ message: string }>
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback

	const body = error.response?.data
	return body?.details?.[0]?.message ?? body?.message ?? fallback
}
