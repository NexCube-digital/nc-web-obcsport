import { api } from './apiService'
import { clearUser, getStoredTokens, saveSession, type AuthTokens, type AuthUser } from '../utils/auth'

interface CustomerProfile extends AuthUser {
	id: string
	lastLoginAt: string
}

interface AuthResponse {
	message?: string
	accessToken: string
	refreshToken: string
	expiresIn: number
	sessionExpiresAt: string
	customer: CustomerProfile
}

interface RegistrationResponse {
	requiresVerification?: boolean
	message?: string
	customer?: Pick<CustomerProfile, 'id' | 'email' | 'name'>
}

function unwrap<T>(body: unknown): T {
	const payload = body as { data?: T } | undefined
	return (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined
		? payload.data
		: body) as T
}

function ensureAuthResponse(result: AuthResponse | undefined): AuthResponse {
	if (!result?.accessToken || !result?.customer || !result.sessionExpiresAt) {
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

export async function loginGoogleCustomer(credential: string, rememberMe = true) {
	const response = await api.post('/auth/customer/google', { idToken: credential })
	const result = ensureAuthResponse(unwrap<AuthResponse>(response.data))
	saveSession(result.customer, toTokens(result), rememberMe)
	return result.customer
}

export async function registerCustomer(input: {
	name: string
	email: string
	password: string
	phone?: string
}) {
	const response = await api.post('/auth/customer/register', input)
	return unwrap<RegistrationResponse>(response.data)
}

export async function verifyCustomerEmail(token: string) {
	const response = await api.post('/auth/customer/verify-email', { token })
	const result = ensureAuthResponse(unwrap<AuthResponse & { message?: string }>(response.data))
	saveSession(result.customer, toTokens(result), true)
	return result
}

export async function resendCustomerVerification(email: string) {
	const response = await api.post('/auth/customer/resend-verification', { email })
	return unwrap<{ success: boolean; message: string }>(response.data)
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
		sessionExpiresAt: response.sessionExpiresAt,
	}
}

export interface StaffAuthSession {
	accessToken: string
	refreshToken: string
	expiresIn: number
	user: {
		id: string
		email: string
		name: string
		role: string
		tenantId: string | null
		lastLoginAt: string
	}
}

export type AutomaticLoginResult =
	| { principalType: 'staff'; session: StaffAuthSession }
	| { principalType: 'customer'; customer: CustomerProfile }

type AutomaticAuthResponse =
	| ({ principalType: 'staff' } & StaffAuthSession)
	| ({ principalType: 'customer' } & AuthResponse)

export async function loginAutomatically(
	email: string,
	password: string,
	rememberMe: boolean,
): Promise<AutomaticLoginResult> {
	const response = await api.post('/auth/auto-login', { email: email.trim(), password })
	const result = unwrap<AutomaticAuthResponse>(response.data)

	if (result?.principalType === 'staff') {
		if (!result.accessToken || !result.refreshToken || !result.user?.role) {
			throw new Error('Respons login staff tidak valid dari server.')
		}
		return {
			principalType: 'staff',
			session: {
				accessToken: result.accessToken,
				refreshToken: result.refreshToken,
				expiresIn: result.expiresIn,
				user: result.user,
			},
		}
	}

	if (result?.principalType === 'customer') {
		if (!result.accessToken || !result.customer || !result.sessionExpiresAt) {
			throw new Error('Respons login pelanggan tidak valid dari server.')
		}
		saveSession(result.customer, toTokens(result), rememberMe)
		return { principalType: 'customer', customer: result.customer }
	}

	throw new Error('Respons login tidak valid dari server.')
}