import { useEffect, useState, useCallback } from 'react'
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
  type NotificationListResponse,
} from '../services/notificationService'

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  loadNotifications: (page: number, limit: number) => Promise<void>
  refreshUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function useNotifications(initialPage: number = 1, initialLimit: number = 10): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  })

  const loadNotifications = useCallback(async (page: number, limit: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result: NotificationListResponse = await getNotifications(page, limit)
      console.log('Notifications result:', result)
      setNotifications(result.data || [])
      setPagination(result.pagination || { page, limit, total: 0, pages: 0 })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat notifikasi'
      console.error('Error loading notifications:', err)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error('Gagal memuat unread count:', err)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Gagal menandai notifikasi sebagai dibaca:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Gagal menandai semua notifikasi sebagai dibaca:', err)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    loadNotifications(initialPage, initialLimit)
    refreshUnreadCount()
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    loadNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  }
}
