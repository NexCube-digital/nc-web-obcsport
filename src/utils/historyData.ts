import type { BookingSummary } from '../services/bookingService'
import type { MyMembership } from '../services/membershipService'

export type TransactionStatus = 'success' | 'failed' | 'pending'
export type FilterType = 'all' | 'success' | 'pending' | 'failed'

export const PAGE_SIZE = 10

export interface Transaction {
  id: string
  kind: 'booking' | 'membership'
  code: string
  paymentMethod: string | null
  date: string
  facility: string
  total: string
  status: TransactionStatus
}

export interface MobileTransaction {
  id: string
  kind: 'booking' | 'membership'
  paymentMethod: string | null
  date: string
  title: string
  time: string
  durationHours?: number
  remainingSessions?: number
  totalSessions?: number
  total: string
  status: TransactionStatus
}

interface FilterOption {
  id: FilterType
  label: string
}

interface Facility {
  id: string
  nameKey: string
  price: number
}

export const FILTERS: FilterOption[] = [
  { id: 'all', label: 'history.filters.all' },
  { id: 'success', label: 'history.filters.success' },
  { id: 'pending', label: 'history.filters.pending' },
  { id: 'failed', label: 'history.filters.failed' },
]

export const MOBILE_FILTERS: FilterOption[] = [
  { id: 'all', label: 'history.filters.all' },
  { id: 'pending', label: 'history.filters.active' },
  { id: 'success', label: 'history.filters.completed' },
  { id: 'failed', label: 'history.filters.failed' },
]

export const FACILITIES: Facility[] = [
  { id: 'futsal-premium', nameKey: 'history.facilities.futsal', price: 125000 },
  { id: 'badminton-vip', nameKey: 'history.facilities.badminton', price: 80000 },
  { id: 'billiard-premium', nameKey: 'history.facilities.billiard', price: 60000 },
]

export const STATUS_BADGE: Record<TransactionStatus, { label: string; className: string }> = {
  success: { label: 'success', className: 'bg-[#10B95B] text-white' },
  failed: { label: 'failed', className: 'bg-[#E53E3E] text-white' },
  pending: { label: 'pending', className: 'bg-[#FFA31A] text-white' },
}

export const MOBILE_STATUS_BADGE: Record<TransactionStatus, { label: string; className: string }> = {
  success: { label: 'success', className: 'border-[#10B95B] text-[#10B95B]' },
  pending: { label: 'pending', className: 'border-[#E53E3E] text-[#E53E3E]' },
  failed: { label: 'failed', className: 'border-[#6F6B6E] text-[#6F6B6E]' },
}

function toTransactionStatus(status: string): TransactionStatus {
  if (status === 'fully_paid' || status === 'completed') return 'success'
  if (status === 'cancelled' || status === 'expired' || status === 'refunded') return 'failed'
  return 'pending'
}

function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function mapBooking(booking: BookingSummary, locale: string): { desktop: Transaction; mobile: MobileTransaction } {
  const status = toTransactionStatus(booking.status)
  const date = new Date(`${booking.bookingDate}T00:00:00`).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const startTime = minutesToTime(booking.startMinute)
  const endTime = minutesToTime(booking.endMinute)
  const durationHours = (booking.endMinute - booking.startMinute) / 60
  const code = `BOOK-${booking.id.slice(-8).toUpperCase()}`

  return {
    desktop: {
      id: booking.id,
      kind: 'booking',
      code,
      paymentMethod: booking.latestPayment?.method ?? null,
      date,
      facility: booking.resource.name,
      total: booking.totalPriceFormatted,
      status,
    },
    mobile: {
      id: booking.id,
      kind: 'booking',
      paymentMethod: booking.latestPayment?.method ?? null,
      date,
      title: `${booking.resource.name} - ${booking.sportType}`,
      time: `${startTime} - ${endTime}`,
      durationHours,
      total: booking.totalPriceFormatted,
      status,
    },
  }
}

function membershipStatus(status: MyMembership['status']): TransactionStatus {
  if (status === 'active') return 'pending'
  if (status === 'depleted' || status === 'expired') return 'success'
  return 'failed'
}

export function mapMembership(membership: MyMembership, locale: string): { desktop: Transaction; mobile: MobileTransaction } {
  const date = new Date(`${membership.purchaseDate}T00:00:00`).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const status = membershipStatus(membership.status)
  const code = `MEM-${membership.id.slice(-8).toUpperCase()}`

  return {
    desktop: {
      id: membership.id,
      kind: 'membership',
      code,
      paymentMethod: 'Midtrans',
      date,
      facility: membership.package.name,
      total: `Rp ${membership.package.memberPrice.toLocaleString(locale)}`,
      status,
    },
    mobile: {
      id: membership.id,
      kind: 'membership',
      paymentMethod: 'Midtrans',
      date,
      title: membership.package.name,
      time: '',
      remainingSessions: membership.remainingSessions,
      totalSessions: membership.totalSessions,
      total: `Rp ${membership.package.memberPrice.toLocaleString(locale)}`,
      status,
    },
  }
}