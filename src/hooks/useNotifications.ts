import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
  type NotificationListResponse,
} from '../services/notificationService'
import { getNotificationErrorMessage } from '../services/notificationService'
import { queryKeys } from '../utils/queryKeys'
import { useAuth } from './useAuth'

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
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const customerKey = user?.id ?? user?.email ?? 'anonymous'
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const listQuery = useQuery({
    queryKey: queryKeys.notifications.list(customerKey, page, limit),
    queryFn: () => getNotifications(page, limit),
    staleTime: 15_000,
  })
  const unreadQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(customerKey),
    queryFn: getUnreadCount,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_result, id) => {
      let wasUnread = false
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: queryKeys.notifications.listPrefix(customerKey) },
        (current) => {
          if (!current) return current
          if (current.data.some((notification) => notification.id === id && !notification.read)) {
            wasUnread = true
          }
          return {
            ...current,
            data: current.data.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification,
            ),
          }
        },
      )
      if (wasUnread) {
        queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(customerKey), (count = 0) => Math.max(0, count - 1))
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(customerKey) })
    },
  })
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: queryKeys.notifications.listPrefix(customerKey) },
        (current) => current
          ? { ...current, data: current.data.map((notification) => ({ ...notification, read: true })) }
          : current,
      )
      queryClient.setQueryData(queryKeys.notifications.unreadCount(customerKey), 0)
    },
  })

  const loadNotifications = async (nextPage: number, nextLimit: number) => {
    setPage(nextPage)
    setLimit(nextLimit)
  }
  const refreshUnreadCount = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(customerKey) })
  }
  const markAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id)
    } catch (error) {
      console.error('Gagal menandai notifikasi sebagai dibaca:', error)
    }
  }
  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
    } catch (error) {
      console.error('Gagal menandai semua notifikasi sebagai dibaca:', error)
    }
  }

  return {
    notifications: listQuery.data?.data ?? [],
    unreadCount: unreadQuery.data ?? 0,
    isLoading: listQuery.isFetching,
    error: listQuery.error ? getNotificationErrorMessage(listQuery.error) : null,
    pagination: listQuery.data?.pagination ?? { page, limit, total: 0, pages: 0 },
    loadNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  }
}
