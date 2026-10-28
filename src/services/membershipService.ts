import { api } from './apiService'

interface ApiSuccess<T> {
  success: true
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface MembershipPackage {
  id: string
  name: string
  nameEn?: string | null
  description: string | null
  descriptionEn?: string | null
  sportType: string
  totalSessions: number
  validityDays: number
  originalPrice: number
  originalPriceFormatted: string
  memberPrice: number
  memberPriceFormatted: string
  discountPercent: number
  tenant: { id: string; name: string; slug: string }
  resource: { id: string; name: string; slug: string } | null
}

export type MembershipPaymentChannel =
  | 'qris' | 'gopay' | 'shopeepay' | 'ovo' | 'dana'
  | 'credit_card' | 'bca_va' | 'bni_va' | 'bri_va' | 'mandiri_va'
  | 'permata_va' | 'alfamart' | 'indomaret'

export interface MembershipSchedule {
  resourceId: string
  bookingDate: string
  startTime: string
  endTime: string
  sportType?: string
}

export interface PurchasedMembership {
  membershipId: string
  packageName: string
  sportType: string
  totalSessions: number
  remainingSessions: number
  price: number
  priceFormatted: string
  expiryDate: string
  payment: { token: string; redirectUrl: string } | { chargeResponse: unknown } | null
  message: string
}

export interface MyMembership {
  id: string
  package: {
    id: string
    name: string
    sportType: string
    validityDays: number
    memberPrice: number
  }
  tenant: { id: string; name: string; slug: string }
  remainingSessions: number
  totalSessions: number
  purchaseDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'depleted' | 'cancelled'
  totalSessionsGenerated: number
  createdAt: string
}

export async function getMembershipPackages(params: { sportType?: string; resourceId?: string } = {}) {
  const response = await api.get<ApiSuccess<MembershipPackage[]>>('/sports/membership/packages', { params })
  return response.data.data
}

export async function getMyMemberships() {
  const response = await api.get<ApiSuccess<MyMembership[]>>('/sports/membership/my', {
    params: { page: 1, limit: 100 },
  })
  return response.data.data
}

export interface MembershipDetail extends MyMembership {
  description?: string | null
  sessions: Array<{
    id: string
    sessionNumber: number
    status: string
    expiryDate: string
    redeemedAt: string | null
    booking: null | {
      id: string
      bookingDate: string
      startMinute: number
      endMinute: number
      status: string
      resource: { id: string; name: string }
    }
  }>
  payments: Array<{ id: string; amount: number; totalAmount: number; status: string; paymentType: string; createdAt: string; midtransOrderId: string; method?: string | null; paymentDetails?: unknown; snapToken?: string | null; redirectUrl?: string | null }>
}

export async function getMembershipDetail(id: string) {
  const response = await api.get<ApiSuccess<MembershipDetail>>(`/sports/membership/my/${encodeURIComponent(id)}`)
  return response.data.data
}

export async function purchaseMembership(
  packageId: string,
  schedules: MembershipSchedule[],
  paymentChannel?: MembershipPaymentChannel,
) {
  const response = await api.post<ApiSuccess<PurchasedMembership>>('/sports/membership/purchase', {
    packageId,
    schedules,
    ...(paymentChannel ? { paymentChannel } : {}),
  })
  return response.data.data
}
