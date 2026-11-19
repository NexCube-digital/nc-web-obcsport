export const CHECKOUT_STATE_STORAGE_KEY = 'obc-checkout-state'
export const CART_PAYMENT_STATE_STORAGE_KEY = 'obc-cart-payment-state'

export function readSessionJSON<T>(key: string, fallback: T): T {
  try {
    const stored = sessionStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

export function writeSessionJSON(key: string, value: unknown): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}
