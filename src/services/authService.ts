import { api } from './apiService'
import { clearUser, getStoredTokens, saveSession, type AuthTokens, type AuthUser } from '../utils/auth'

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

function unwrap<T>(body: unknown): T {
	const payload = body as { data?: T } | undefined
	return (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined
		? payload.data
		: body) as T
}

function ensureAuthResponse(result: AuthResponse | undefined): AuthResponse {
	if (!result?.accessToken || !result?.customer) {
		throw new Error('Respons login tidak valid dari server.')
	}
	return result
}

export async function loginCustomer(email: string, password: string, rememberMe: boolean) {
	const response = await api.post('/auth/customer/login', { email, password })
	const result = ensureAuthResponse(unwrap<AuthResponse>(response.data))
	saveSession(result.customer, toTokens(result), rememberMe)
	return result.customer
}

export async function loginGoogleCustomer(credential: string) {
	// CATATAN BACKEND: sportApi lama mengirim { idToken }, di sini { credential }.
	// Sesuaikan dengan nama field yang diterima endpoint /auth/customer/google.
	const response = await api.post('/auth/customer/google', { credential })
	const result = ensureAuthResponse(unwrap<AuthResponse>(response.data))
	saveSession(result.customer, toTokens(result), true)
	return result.customer
}

export async function registerCustomer(input: {
	name: string
	email: string
	password: string
	phone?: string
}) {
	const response = await api.post('/auth/customer/register', input)
	const result = ensureAuthResponse(unwrap<AuthResponse>(response.data))
	saveSession(result.customer, toTokens(result), true)
	return result.customer
}

export async function forgotPasswordCustomer(email: string) {
	const response = await api.post('/auth/customer/forgot-password', { email })
	return unwrap<{ success: boolean; message: string }>(response.data)
}

export async function resetPasswordCustomer(token: string, newPassword: string) {
	const response = await api.post('/auth/customer/reset-password', {
		token,
		newPassword,
	})
	return unwrap<{ message: string }>(response.data)
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