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
}

declare global {
	interface Window {
		snap?: MidtransSnap
	}
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

export const isDirectChannel = (channel: string): channel is DirectChannel =>
	(DIRECT_CHANNELS as readonly string[]).includes(channel)

// Bentuk respons mentah dari POST /v2/charge Midtrans (hanya field yang dipakai)
export interface MidtransChargeResponse {
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