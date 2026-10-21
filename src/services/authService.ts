import { api } from './apiService'
import { clearUser, getStoredTokens, saveSession, type AuthTokens, type AuthUser } from '../utils/auth'

interface ApiSuccess<T> {
	success: true
	data: T
}

interface CustomerProfile extends AuthUser {
	id: string
	lastLoginAt: string
}

interface AuthResponse {
	accessToken: string
	refreshToken: string
	expiresIn: number
	customer: CustomerProfile
}

export async function loginCustomer(email: string, password: string, rememberMe: boolean) {
	const { data } = await api.post<ApiSuccess<AuthResponse>>('/auth/customer/login', { email, password })
	saveSession(data.data.customer, toTokens(data.data), rememberMe)
	return data.data.customer
}

export async function loginGoogleCustomer(credential: string) {
	const { data } = await api.post<ApiSuccess<AuthResponse>>('/auth/customer/google', { credential })
	saveSession(data.data.customer, toTokens(data.data), true)
	return data.data.customer
}

export async function registerCustomer(input: {
	name: string
	email: string
	password: string
	phone?: string
}) {
	const { data } = await api.post<ApiSuccess<AuthResponse>>('/auth/customer/register', input)
	saveSession(data.data.customer, toTokens(data.data), true)
	return data.data.customer
}

export async function logoutCustomer() {
	const refreshToken = getStoredTokens()?.refreshToken

	try {
		if (refreshToken) {
			await api.post('/auth/logout', { refreshToken })
		}
	} finally {
		clearUser()
	}
}

function toTokens(response: AuthResponse): AuthTokens {
	return {
		accessToken: response.accessToken,
		refreshToken: response.refreshToken,
		expiresIn: response.expiresIn,
	}
}
