import { api } from './apiService'

/* -------------------------------------------------------------------------
   Tipe data notifikasi
   ------------------------------------------------------------------------- */
export interface Notification {
  id: string
  customerId: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationListResponse {
  data: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface BackendNotification {
  id: string
  customerId: string | null
  type: string
  title: string
  body: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

interface BackendNotificationListResponse {
  items: BackendNotification[]
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UnreadCountResponse {
  unreadCount: number
}

export interface MarkAsReadResponse {
  id: string
  read: boolean
  updatedAt: string
}

export interface MarkAllAsReadResponse {
  updated: number
}

/* -------------------------------------------------------------------------
   API Calls
   ------------------------------------------------------------------------- */

/**
 * Fetch paginated notifications for customer
 * GET /api/v1/customer/notifications?page=1&limit=10
 */
export async function getNotifications(
  page: number = 1,
  limit: number = 10,
): Promise<NotificationListResponse> {
  const response = await api.get('/customer/notifications', {
    params: { page, limit },
  })
  const payload = (response.data?.data || response.data) as BackendNotificationListResponse

  return {
    data: (payload.items || []).map((item) => ({
      id: item.id,
      customerId: item.customerId || '',
      type: item.type,
      title: item.title,
      message: item.body,
      read: item.isRead,
      link: item.actionUrl || undefined,
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    })),
    pagination: {
      page: payload.pagination?.page ?? page,
      limit: payload.pagination?.limit ?? limit,
      total: payload.pagination?.total ?? 0,
      pages: payload.pagination?.totalPages ?? 0,
    },
  }
}

/**
 * Get unread notification count (untuk badge di navbar)
 * GET /api/v1/customer/notifications/unread-count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get('/customer/notifications/unread-count')
  const data = response.data?.data || response.data
  return data?.unreadCount || 0
}

/**
 * Mark single notification as read
 * PATCH /api/v1/customer/notifications/:id/read
 */
export async function markNotificationAsRead(id: string): Promise<MarkAsReadResponse> {
  const response = await api.patch(`/customer/notifications/${id}/read`)
  return response.data?.data || response.data
}

/**
 * Mark all notifications as read
 * PATCH /api/v1/customer/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<MarkAllAsReadResponse> {
  const response = await api.patch('/customer/notifications/read-all')
  return response.data?.data || response.data
}

/**
 * Utility: Get error message from notification API error
 */
export function getNotificationErrorMessage(error: unknown, fallback: string = 'Gagal memuat notifikasi'): string {
  if (error instanceof Error && 'response' in error) {
    const apiError = error as any
    return apiError.response?.data?.message || apiError.message || fallback
  }
  return fallback
}
