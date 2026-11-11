import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredSection from '../../components/layout/DeferredSection'
import FacilityDetails from './checkout/FacilityDetails'
import type { FacilityCard } from '../main/home/Court'
import { useBookingSchedule } from '../../utils/orders/useBookingSchedule'

const TopSportReviews = lazy(() => import('./checkout/TopSportReviews'))
const MobileBookingSheet = lazy(() => import('./checkout/MobileBookingSheet'))

type CheckoutMobileViewProps = {
  facility: FacilityCard
  facilityImage: string
  apiPriceTiers: Array<{ id: string; range: string; price: string }>
  isApiPriceLoading: boolean
  schedule: ReturnType<typeof useBookingSchedule>
  isSheetOpen: boolean
  onToggleSheet: () => void
  onCloseSheet: () => void
  onOrderNow: () => void
  onSearchOther: () => void
  onAddToCart: () => void
}

function CheckoutMobileView({
  facility,
  facilityImage,
  apiPriceTiers,
  isApiPriceLoading,
  schedule,
  isSheetOpen,
  onToggleSheet,
  onCloseSheet,
  onOrderNow,
  onSearchOther,
  onAddToCart,
}: CheckoutMobileViewProps) {
  const { t } = useTranslation()

  return (
    <>
      <MobileHeader
        variant="title"
        title={t('booking.checkout')}
        showShare
        showBottomNav={false}
      />
      <div className="min-h-[100dvh] bg-white font-body text-[#343133] px-4 pt-6 pb-52">
        <FacilityDetails
          variant="mobile"
          facilityName={facility.name}
          image={facilityImage}
          locationName={facility.location?.name}
          priceTiers={apiPriceTiers}
          isPriceLoading={isApiPriceLoading}
        />
        <DeferredSection placeholderClassName="min-h-[240px]">
          <TopSportReviews />
        </DeferredSection>
      </div>
      <Suspense fallback={null}>
        <MobileBookingSheet
          isOpen={isSheetOpen}
          onToggle={onToggleSheet}
          onClose={onCloseSheet}
          onChangeMonth={schedule.handleChangeMonth}
          onSelectDate={schedule.handleSelectDate}
          onToggleTime={schedule.handleSelectStartTime}
          onChangeDuration={schedule.handleChangeDuration}
          onOrderNow={onOrderNow}
          onSearchOther={onSearchOther}
          onAddToCart={onAddToCart}
          viewYear={schedule.viewYear}
          viewMonth={schedule.viewMonth}
          selectedDate={schedule.selectedDate}
          selectedDateLabel={schedule.selectedDateLabel}
          bookedDates={schedule.bookedDates}
          bookedSlotsToday={schedule.bookedSlotsToday}
          blockedSlotStatuses={schedule.blockedSlotStatuses}
          availableTimeSlots={schedule.availableTimeSlots}
          isAvailabilityLoading={schedule.isAvailabilityLoading}
          selectedStartTime={schedule.selectedStartTime}
          durationMinutes={schedule.durationMinutes}
          isDateBooked={schedule.isDateBooked}
          sessionCount={schedule.sessionCount}
          durationLabel={schedule.durationLabel}
          startTime={schedule.startTime}
          endTime={schedule.endTime}
          totalPrice={schedule.totalPrice}
          maxSessionHours={schedule.maxSessionHours}
          durationStepHours={schedule.durationStepHours}
        />
      </Suspense>
    </>
  )
}

export default CheckoutMobileView