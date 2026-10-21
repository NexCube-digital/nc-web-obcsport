import type { CartItem } from '../components/ui/CartModal'

const CART_STORAGE_KEY = 'obc_sport_cart'

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
    }
    return items
  },

  removeItem(id: string): CartItem[] {
    const items = this.getItems().filter((i) => i.id !== id)
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    return items
  },

  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY)
  },

  getTotal(): number {
    return this.getItems().reduce((sum, item) => sum + item.price, 0)
  },
}
