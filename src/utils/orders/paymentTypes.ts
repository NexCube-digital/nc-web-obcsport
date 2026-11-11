import type { CartItem } from '../../components/ui/CartModal'
import type { PaymentChannel } from '../../services/bookingService'
import type { DirectPaymentInfo } from '../../services/paymentService'

export interface PendingOrderModalData {
  bookingId: string
  bookingIds?: string[]
  transactionId: string
  amount: number
  paymentInfo?: DirectPaymentInfo | null
  paymentUrl?: string
  date: string
  time: string
  paymentMethod: string
  bookings: Array<{ id: string; name: string; date: string; time: string }>
  expiresAt: string
}

export interface CheckoutState {
  resourceId?: string
  sportType?: string
  bookingDate?: string
  facility?: { id: string; name: string; location?: { name: string; city: string; address: string } | null }
  date?: string
  time?: string
  endTime?: string
  total?: number
  durationMinutes?: number
  price?: { basePrice: number; discountAmount: number; adminFee: number; totalPrice: number }
  cartItems?: CartItem[]
}

export interface ExtraItem {
  id: string
  name: string
  price: number
}

export interface PaymentDisplayData {
  cartItems: CartItem[]
  isCartCheckout: boolean
  facilityName: string
  facilityLocation: string
  date: string
  startTime: string
  endTime: string
  hours: number
  isSoccerBooking: boolean
  billingBlocks: number
  displayedRate: number
  subtotal: number
  promo: number
  serviceFee: number
  total: number
  extrasTotal: number
  mobileTotal: number
}

export type SelectedPaymentChannel = PaymentChannel | null