import type { PendingOrderModalData } from './paymentTypes'

export const PENDING_ORDER_STORAGE_KEY = 'obc-pending-payment-state'
export const PENDING_ORDER_MAX_AGE_MS = 3 * 60 * 1000
export const PAID_STATUSES = ['paid', 'settlement', 'capture', 'fully_paid', 'completed']
export const FAILED_STATUSES = ['cancelled', 'expired', 'refunded', 'deny', 'failure', 'failed', 'cancel']
export const DEFAULT_START = '08:00'
export const DEFAULT_END = '10:00'
export const DEFAULT_SUBTOTAL = 250000
export const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

export const EXTRA_ITEMS = [
  { id: 'raket', name: 'Additional racket rental', price: 20000 },
  { id: 'bola', name: 'Ball / paddle rental', price: 15000 },
]

export const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export const hourOf = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour + minute / 60
}

export function readPendingOrder(): PendingOrderModalData | null {
  try {
    const stored = sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY)
    if (!stored) return null
    const pending = JSON.parse(stored) as PendingOrderModalData
    if (!pending.bookingId || !pending.expiresAt || !Array.isArray(pending.bookings)) return null
    return pending
  } catch {
    return null
  }
}