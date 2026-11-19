const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client'

export type GoogleCredentialResponse = {
	credential: string
}

declare global {
	interface Window {
		google?: {
			accounts?: {
				id?: {
					initialize: (options: {
						client_id: string
						callback: (response: GoogleCredentialResponse) => void
					}) => void
					prompt: () => void
					renderButton: (parent: HTMLElement, options: {
						type?: 'standard' | 'icon'
						theme?: 'outline' | 'filled_blue' | 'filled_black'
						size?: 'large' | 'medium' | 'small'
						text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
						shape?: 'rectangular' | 'pill' | 'circle' | 'square'
						width?: number
						locale?: string
					}) => void
				}
			}
		}
	}
}

let googleIdentityPromise: Promise<void> | null = null

export function loadGoogleIdentity(): Promise<void> {
	if (typeof window === 'undefined') return Promise.reject(new Error('Google Identity requires a browser.'))
	if (window.google?.accounts?.id) return Promise.resolve()
	if (googleIdentityPromise) return googleIdentityPromise

	googleIdentityPromise = new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = GOOGLE_IDENTITY_SCRIPT
		script.async = true
		script.defer = true
		script.onload = () => resolve()
		script.onerror = () => {
			googleIdentityPromise = null
			script.remove()
			reject(new Error('Google Identity failed to load.'))
		}
		document.head.appendChild(script)
	})

	return googleIdentityPromise
}