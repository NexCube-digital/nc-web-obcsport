import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { CartItem } from '../../components/ui/CartModal'
import { getApiErrorMessage } from '../../services/apiService'
import {
  addBackendCartItem,
  cartService,
  removeBackendCartItem,
  syncBackendCart,
} from '../../services/cart'
import { queryKeys } from '../queryKeys'
import { useAuth } from '../../hooks/useAuth'

export function useCheckoutCart() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const cartQueryKey = queryKeys.cart(user?.id ?? user?.email ?? 'anonymous')
  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: syncBackendCart,
    initialData: () => cartService.getItems(),
    initialDataUpdatedAt: 0,
    staleTime: 15_000,
  })
  const cartItems = cartQuery.data
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addItem = async (
    cartItem: CartItem,
    request: Parameters<typeof addBackendCartItem>[0],
  ) => {
    try {
      const currentItems = queryClient.getQueryData<CartItem[]>(cartQueryKey) ?? cartService.getItems()
      if (currentItems.some((item) =>
        item.resourceId === request.resourceId &&
        item.bookingDate === request.bookingDate &&
        item.startTime === request.startTime &&
        item.endTime === request.endTime
      )) return true

      const backendItem = await addBackendCartItem(request)
      const persistedCartItem = { ...cartItem, id: backendItem.id }
      const updatedItems = [...currentItems, persistedCartItem]
      queryClient.setQueryData(cartQueryKey, updatedItems)
      cartService.replaceItems(updatedItems)
      void queryClient.invalidateQueries({ queryKey: queryKeys.facilityAvailabilityPrefix })
      void queryClient.invalidateQueries({ queryKey: queryKeys.facilityCalendarPrefix })
      toast.success(t('booking.addScheduleToCart'))
      return true
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('booking.addScheduleToCartFailed')))
      return false
    }
  }

  const removeItem = async (id: string) => {
    try {
      await removeBackendCartItem(id)
      const updatedItems = (queryClient.getQueryData<CartItem[]>(cartQueryKey) ?? cartService.getItems())
        .filter((item) => item.id !== id)
      queryClient.setQueryData(cartQueryKey, updatedItems)
      cartService.replaceItems(updatedItems)
      void queryClient.invalidateQueries({ queryKey: queryKeys.facilityAvailabilityPrefix })
      void queryClient.invalidateQueries({ queryKey: queryKeys.facilityCalendarPrefix })
      toast.success(t('booking.cartItemRemoved'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('booking.cartItemRemoveFailed')))
    }
  }

  return { cartItems, isCartOpen, setIsCartOpen, addItem, removeItem }
}