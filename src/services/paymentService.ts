export interface MidtransCardData {
	card_number: string
	card_exp_month: string
	card_exp_year: string
	card_cvv: string
}

interface MidtransCardTokenResponse {
	token_id?: string
	status_message?: string
}

interface MidtransCardTokenCallbacks {
	onSuccess: (response: MidtransCardTokenResponse) => void
	onFailure: (response: MidtransCardTokenResponse) => void
	onError: (response: MidtransCardTokenResponse) => void
}

interface Midtrans3dsCallbacks {
	performAuthentication: (redirectUrl: string) => void
	onSuccess: (response: MidtransCardTokenResponse) => void
	onPending: (response: MidtransCardTokenResponse) => void
	onFailure: (response: MidtransCardTokenResponse) => void
}

interface MidtransNew3ds {
	getCardToken: (card: MidtransCardData, callbacks: MidtransCardTokenCallbacks) => void
	authenticate: (redirectUrl: string, callbacks: Midtrans3dsCallbacks) => void
}
export interface MidtransResult {
	order_id?: string
	transaction_id?: string
	transaction_status?: string
	payment_type?: string
	status_code?: string
}

export interface MidtransCallbacks {
	onSuccess: (result: MidtransResult) => void
	onPending: (result: MidtransResult) => void
	onError: (result: MidtransResult) => void
	onClose: () => void
}

interface MidtransSnap {
	pay: (token: string, callbacks: MidtransCallbacks) => void
	embed?: (token: string, options: MidtransCallbacks & { embedId: string }) => void
}

declare global {
	interface Window {
		snap?: MidtransSnap
		MidtransNew3ds?: MidtransNew3ds
	}
}
let cardTokenScriptPromise: Promise<void> | undefined

async function loadCardTokenScript(): Promise<void> {
	if (window.MidtransNew3ds) return
	if (cardTokenScriptPromise) return cardTokenScriptPromise

	const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
	if (!clientKey) throw new Error('VITE_MIDTRANS_CLIENT_KEY belum dikonfigurasi.')

	const script = document.createElement('script')
	script.src = 'https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js'
	script.setAttribute('data-environment', import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' ? 'production' : 'sandbox')
	script.setAttribute('data-client-key', clientKey)
	script.async = true

	cardTokenScriptPromise = new Promise((resolve, reject) => {
		script.onload = () => {
			if (window.MidtransNew3ds) resolve()
			else reject(new Error('Midtrans card tokenization belum siap.'))
		}
		script.onerror = () => reject(new Error('Script tokenisasi kartu Midtrans tidak dapat dimuat.'))
		document.head.appendChild(script)
	})

	try {
		await cardTokenScriptPromise
	} catch (error) {
		cardTokenScriptPromise = undefined
		throw error
	}
}

export async function tokenizeMidtransCard(card: MidtransCardData): Promise<string> {
	await loadCardTokenScript()
	if (!window.MidtransNew3ds) throw new Error('Midtrans card tokenization belum siap.')

	return new Promise((resolve, reject) => {
		window.MidtransNew3ds?.getCardToken(card, {
			onSuccess: (response) => response.token_id
				? resolve(response.token_id)
				: reject(new Error(response.status_message ?? 'Token kartu tidak diterima.')),
			onFailure: (response) => reject(new Error(response.status_message ?? 'Data kartu tidak valid.')),
			onError: (response) => reject(new Error(response.status_message ?? 'Tokenisasi kartu gagal.')),
		})
	})
}

export async function authenticateMidtransCard(
	redirectUrl: string,
	callbacks: Midtrans3dsCallbacks,
): Promise<void> {
	await loadCardTokenScript()
	if (!window.MidtransNew3ds) throw new Error('Midtrans card authentication belum siap.')
	window.MidtransNew3ds.authenticate(redirectUrl, callbacks)
}

let snapScriptPromise: Promise<void> | undefined

function loadSnapScript(): Promise<void> {
	if (window.snap) return Promise.resolve()
	if (snapScriptPromise) return snapScriptPromise

	const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
	if (!clientKey) return Promise.reject(new Error('VITE_MIDTRANS_CLIENT_KEY belum dikonfigurasi.'))

	const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
	const script = document.createElement('script')
	script.src = isProduction
		? 'https://app.midtrans.com/snap/snap.js'
		: 'https://app.sandbox.midtrans.com/snap/snap.js'
	script.setAttribute('data-client-key', clientKey)
	script.async = true

	snapScriptPromise = new Promise((resolve, reject) => {
		script.onload = () => resolve()
		script.onerror = () => {
			snapScriptPromise = undefined
			reject(new Error('Midtrans Snap tidak dapat dimuat.'))
		}
		document.head.appendChild(script)
	})

	return snapScriptPromise
}

// Snap tetap dipakai hanya sebagai cadangan (metode "Semua metode" & kartu kredit)
export async function openMidtransCheckout(token: string, callbacks: MidtransCallbacks) {
	await loadSnapScript()
	if (!window.snap) throw new Error('Midtrans Snap belum siap.')
	window.snap.pay(token, callbacks)
}

export async function embedMidtransCheckout(token: string, embedId: string, callbacks: MidtransCallbacks) {
	await loadSnapScript()
	if (!window.snap) throw new Error('Midtrans Snap belum siap.')
	if (typeof window.snap.embed !== 'function') {
		throw new Error('Embedded checkout kartu tidak tersedia dari script Midtrans.')
	}
	window.snap.embed(token, { embedId, ...callbacks })
}

/* -------------------------------------------------------------------------
   Pembayaran langsung (Midtrans Core API) — tanpa modal Snap
   ------------------------------------------------------------------------- */

// Channel yang bisa ditampilkan langsung di halaman (tanpa Snap)
export const DIRECT_CHANNELS = [
	'qris', 'gopay', 'shopeepay',
	'bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'permata_va',
	'alfamart', 'indomaret',
] as const

export type DirectChannel = (typeof DIRECT_CHANNELS)[number]

export const isDirectChannel = (channel: string | undefined | null): channel is DirectChannel =>
	Boolean(channel && (DIRECT_CHANNELS as readonly string[]).includes(channel))

// Bentuk respons mentah dari POST /v2/charge Midtrans (hanya field yang dipakai)
export interface MidtransChargeResponse {
	obc_payment_channel?: string
	order_id?: string
	transaction_id?: string
	transaction_status?: string
	payment_type?: string
	gross_amount?: string
	expiry_time?: string
	va_numbers?: { bank: string; va_number: string }[]
	permata_va_number?: string
	bill_key?: string
	biller_code?: string
	payment_code?: string
	store?: string
	actions?: { name: string; method: string; url: string }[]
}

export interface DirectPaymentInfo {
	orderId: string
	transactionId: string
	channel: DirectChannel
	status: string
	grossAmount?: number
	expiryTime?: string
	vaNumber?: string
	bankName?: string
	billerCode?: string
	billKey?: string
	paymentCode?: string
	storeName?: string
	qrUrl?: string
	deeplinkUrl?: string
}

export function parseMidtransCharge(raw: MidtransChargeResponse, channel: DirectChannel): DirectPaymentInfo {
	const action = (name: string) => raw.actions?.find((item) => item.name === name)?.url
	const va = raw.va_numbers?.[0]

	return {
		orderId: raw.order_id ?? '',
		transactionId: raw.transaction_id ?? '',
		channel,
		status: raw.transaction_status ?? 'pending',
		grossAmount: raw.gross_amount ? Number(raw.gross_amount) : undefined,
		expiryTime: raw.expiry_time,
		vaNumber: va?.va_number ?? raw.permata_va_number,
		bankName: va?.bank?.toUpperCase(),
		billerCode: raw.biller_code, // Mandiri (echannel)
		billKey: raw.bill_key, // Mandiri (echannel)
		paymentCode: raw.payment_code, // Alfamart / Indomaret
		storeName: raw.store,
		qrUrl: action('generate-qr-code'),
		deeplinkUrl: action('deeplink-redirect'),
	}
}

export function parsePersistedDirectPayment(raw: unknown): DirectPaymentInfo | null {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

	const data = raw as MidtransChargeResponse
	let channel: string | undefined = data.obc_payment_channel

	if (!isDirectChannel(channel)) {
		const paymentType = data.payment_type?.toLowerCase()
		const bank = data.va_numbers?.[0]?.bank.toLowerCase()
		if (paymentType === 'qris') channel = 'qris'
		else if (paymentType === 'gopay') channel = 'gopay'
		else if (paymentType === 'shopeepay') channel = 'shopeepay'
		else if (data.bill_key || data.biller_code) channel = 'mandiri_va'
		else if (data.permata_va_number) channel = 'permata_va'
		else if (bank === 'bca' || bank === 'bni' || bank === 'bri') channel = `${bank}_va`
		else if (paymentType === 'cstore') {
			channel = data.store?.toLowerCase().includes('indo') ? 'indomaret' : 'alfamart'
		}
	}

	return isDirectChannel(channel) ? parseMidtransCharge(data, channel) : null
}