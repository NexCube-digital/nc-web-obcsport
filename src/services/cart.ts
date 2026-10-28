import type { CartItem } from '../components/ui/CartModal'
import { api } from './apiService'
import { previewBookingPrice } from './bookingService'

interface ApiSuccess<T> {
  success: true
  data: T
}

export interface BackendCartItem {
  id: string
  resourceId: string
  bookingDate: string
  startMinute: number
  endMinute: number
  sportType: string
  resource?: { id: string; name: string; slug: string }
}

export async function getBackendCart() {
  const response = await api.get<ApiSuccess<BackendCartItem[]>>('/sports/cart')
  return response.data.data
}

export async function addBackendCartItem(item: {
  resourceId: string
  bookingDate: string
  startTime: string
  endTime: string
  sportType: string
}) {
  const response = await api.post<ApiSuccess<BackendCartItem>>('/sports/cart', item)
  return response.data.data
}

export async function removeBackendCartItem(id: string) {
  await api.delete(`/sports/cart/${id}`)
}

const CART_STORAGE_KEY = 'obc_sport_cart'
const CART_CHANGED_EVENT = 'obc-sport-cart-changed'

const formatMinute = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`

export function mapBackendCartItems(items: BackendCartItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.id,
    code: item.resource?.name?.split('-').at(-1)?.toUpperCase() ?? 'OBC',
    facilityName: item.resource?.name ?? 'Fasilitas OBC Sport',
    sportName: item.sportType,
    schedule: `${formatMinute(item.startMinute)} - ${formatMinute(item.endMinute)}, ${item.bookingDate}`,
    price: 0,
    resourceId: item.resourceId,
    bookingDate: item.bookingDate,
    startTime: formatMinute(item.startMinute),
    endTime: formatMinute(item.endMinute),
    sportType: item.sportType,
  }))
}

export async function syncBackendCart(): Promise<CartItem[]> {
  const backendItems = await getBackendCart()
  const cachedItems = cartService.getItems()
  const mappedItems = backendItems.map((item) => {
    const startTime = formatMinute(item.startMinute)
    const endTime = formatMinute(item.endMinute)
    const cachedItem = cachedItems.find((cached) => cached.id === item.id)

    return {
      ...mapBackendCartItems([item])[0],
      price: cachedItem?.price ?? 0,
      code: cachedItem?.code ?? mapBackendCartItems([item])[0].code,
      facilityName: cachedItem?.facilityName ?? item.resource?.name ?? 'Fasilitas OBC Sport',
      schedule: cachedItem?.schedule ?? `${startTime} - ${endTime}, ${item.bookingDate}`,
    }
  })

  const restoredItems = await Promise.all(mappedItems.map(async (item) => {
    if (item.price > 0 || !item.resourceId || !item.bookingDate || !item.startTime || !item.endTime || !item.sportType) return item
    try {
      const preview = await previewBookingPrice({
        resourceId: item.resourceId,
        bookingDate: item.bookingDate,
        startTime: item.startTime,
        endTime: item.endTime,
        sportType: item.sportType,
        bookingType: 'regular',
      })
      return { ...item, price: preview.basePrice }
    } catch {
      return item
    }
  }))

  cartService.replaceItems(restoredItems)
  return restoredItems
}

export const cartService = {
  getItems(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  addItem(item: CartItem): CartItem[] {
    const items = this.getItems()
    // Check if slot or item already exists
    const exists = items.some((i) => i.id === item.id)
    if (!exists) {
      items.push(item)
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new Event(CART_CHANGED_EVENT))
    }
    return items
  },

  removeItem(id: string): CartItem[] {
    const items = this.getItems().filter((i) => i.id !== id)
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(CART_CHANGED_EVENT))
    return items
  },

  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY)
    window.dispatchEvent(new Event(CART_CHANGED_EVENT))
  },

  replaceItems(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(CART_CHANGED_EVENT))
  },

  getTotal(): number {
    return this.getItems().reduce((sum, item) => sum + item.price, 0)
  },
  subscribe(listener: () => void): () => void {
    window.addEventListener(CART_CHANGED_EVENT, listener)
    return () => window.removeEventListener(CART_CHANGED_EVENT, listener)
  },
}
