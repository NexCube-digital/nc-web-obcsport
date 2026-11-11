import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import FacilityDetails from './checkout/FacilityDetails'
import type { FacilityCard } from '../main/home/Court'
import { useBookingSchedule } from '../../utils/orders/useBookingSchedule'

const TopSportReviews = lazy(() => import('./checkout/TopSportReviews'))
const BookingScheduleSelector = lazy(() => import('./checkout/BookingScheduleSelector'))

type CheckoutDesktopViewProps = {
  facility: FacilityCard
  facilityImage: string
  apiPriceTiers: Array<{ id: string; range: string; price: string }>
  isApiPriceLoading: boolean
  schedule: ReturnType<typeof useBookingSchedule>
  onConfirmSchedule: () => void
}

function CheckoutDesktopView({
  facility,
  facilityImage,
  apiPriceTiers,
  isApiPriceLoading,
  schedule,
  onConfirmSchedule,
}: CheckoutDesktopViewProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard showDesktopNavigation={false} showMobileHeader={false} showCart />

      <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
        <div className="grid items-start gap-12 lg:grid-cols-[736px_1fr]">
          <div>
            <FacilityDetails
              variant="desktop"
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

          <div>
            <h2 className="font-heading text-2xl font-bold text-[#343133]">
              {t('booking.chooseDateTime')}
            </h2>
            <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-[#343133]">
              {t('booking.scheduleInstruction')}
            </p>
            <Suspense fallback={<div aria-hidden="true" className="min-h-[420px]" />}>
              <BookingScheduleSelector
                viewYear={schedule.viewYear}
                viewMonth={schedule.viewMonth}
                selectedDate={schedule.selectedDate}
                selectedDateLabel={schedule.selectedDateLabel}
                selectedDateText={t('booking.selectedDate')}
                changeDateText={t('booking.changeDate')}
                bookedDates={schedule.bookedDates}
                bookedSlotsToday={schedule.bookedSlotsToday}
                blockedSlotStatuses={schedule.blockedSlotStatuses}
                availableTimeSlots={schedule.availableTimeSlots}
                isLoading={schedule.isAvailabilityLoading}
                isDateBooked={schedule.isDateBooked}
                selectedStartTime={schedule.selectedStartTime}
                durationMinutes={schedule.durationMinutes}
                sessionCount={schedule.sessionCount}
                durationLabel={schedule.durationLabel}
                startTime={schedule.startTime}
                endTime={schedule.endTime}
                maxSessionHours={schedule.maxSessionHours}
                durationStepHours={schedule.durationStepHours}
                onChangeMonth={schedule.handleChangeMonth}
                onSelectDate={schedule.handleSelectDate}
                onToggleTime={schedule.handleSelectStartTime}
                onChangeDuration={schedule.handleChangeDuration}
                onResetDate={schedule.resetSelection}
                onConfirmSchedule={onConfirmSchedule}
              />
            </Suspense>
          </div>
        </div>
      </main>

      <DeferredFooter />
    </div>
  )
}

export default CheckoutDesktopView