import { lazy, Suspense } from 'react'
import type { CartItem } from '../../../components/ui/CartModal'

const ScheduleConflict = lazy(() => import('./ScheduleConflict'))
const ModalCheckout = lazy(() => import('../../../components/ui/ModalCheckout'))
const CartModal = lazy(() => import('../../../components/ui/CartModal'))

type CheckoutOverlaysProps = {
  isCheckoutModalOpen: boolean
  facilityName: string
  duration: number
  dateTime: string
  total: number
  onCloseCheckout: () => void
  onOrder: () => void
  onAddToCart: () => void
  isCartOpen: boolean
  cartItems: CartItem[]
  onCloseCart: () => void
  onRemoveCartItem: (id: string) => void
  onCheckoutCart: (items: CartItem[]) => void
  conflictMessage: string | null
  onDismissConflict: () => void
  onReturnHome: () => void
}

function CheckoutOverlays({
  isCheckoutModalOpen,
  facilityName,
  duration,
  dateTime,
  total,
  onCloseCheckout,
  onOrder,
  onAddToCart,
  isCartOpen,
  cartItems,
  onCloseCart,
  onRemoveCartItem,
  onCheckoutCart,
  conflictMessage,
  onDismissConflict,
  onReturnHome,
}: CheckoutOverlaysProps) {
  return (
    <Suspense fallback={null}>
      {isCheckoutModalOpen && (
        <ModalCheckout
          isOpen={isCheckoutModalOpen}
          facility={facilityName}
          duration={duration}
          dateTime={dateTime}
          total={total}
          onClose={onCloseCheckout}
          onOrder={onOrder}
          onAddToCart={onAddToCart}
        />
      )}

      {isCartOpen && (
        <CartModal
          isOpen={isCartOpen}
          onClose={onCloseCart}
          items={cartItems}
          onRemove={onRemoveCartItem}
          onCheckout={onCheckoutCart}
        />
      )}

      {conflictMessage && (
        <ScheduleConflict
          message={conflictMessage}
          onDismiss={onDismissConflict}
          onReturnHome={onReturnHome}
        />
      )}
    </Suspense>
  )
}

export default CheckoutOverlays