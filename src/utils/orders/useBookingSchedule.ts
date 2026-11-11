import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../services/apiService'
import { previewBookingPrice } from '../../services/bookingService'
import {
  getFacilityAvailability,
  getFacilityCalendar,
  getFacilityPriceTiers,
  type FacilityAvailability,
} from '../../services/facilityService'
import {
  getTodayKey,
  getZonedParts,
  isPastSlot,
  minutesToTime,
  timeToMinutes,
  toDateKey,
} from './checkoutDateUtils'
import { queryKeys } from '../queryKeys'

type UseBookingScheduleOptions = {
  resourceId?: string
  sportType: string
  isSoccer: boolean
  isMobile: boolean
  maxAllowedSessionHours: number
  durationStepHours: number
}

export function useBookingSchedule({
  resourceId,
  sportType,
  isSoccer,
  isMobile,
  maxAllowedSessionHours,
  durationStepHours,
}: UseBookingScheduleOptions) {
  const { t, i18n } = useTranslation()
  const [viewYear, setViewYear] = useState(() => Number(getZonedParts(new Date()).year))
  const [viewMonth, setViewMonth] = useState(() => Number(getZonedParts(new Date()).month) - 1)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(() => isMobile ? getTodayKey() : null)
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(isSoccer ? 120 : 60)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const pricePreviewStartTime = selectedStartTime ?? ''
  const pricePreviewEndTime = selectedStartTime
    ? minutesToTime(timeToMinutes(selectedStartTime) + selectedDurationMinutes)
    : ''
  const calendarFrom = toDateKey(viewYear, viewMonth, 1)
  const calendarTo = toDateKey(viewYear, viewMonth, new Date(viewYear, viewMonth + 1, 0).getDate())

  const priceTiersQuery = useQuery({
    queryKey: queryKeys.facilityPriceTiers(resourceId ?? ''),
    queryFn: () => getFacilityPriceTiers(resourceId!),
    enabled: Boolean(resourceId),
    staleTime: 5 * 60_000,
  })
  const availabilityQuery = useQuery({
    queryKey: queryKeys.facilityAvailability(resourceId ?? '', selectedDate ?? '', sportType),
    queryFn: () => getFacilityAvailability(resourceId!, selectedDate!, sportType),
    enabled: Boolean(resourceId && selectedDate),
    staleTime: 10_000,
  })
  const calendarQuery = useQuery({
    queryKey: queryKeys.facilityCalendar(resourceId ?? '', calendarFrom, calendarTo),
    queryFn: () => getFacilityCalendar(resourceId!, calendarFrom, calendarTo),
    enabled: Boolean(resourceId),
    staleTime: 30_000,
    refetchInterval: 35_000,
  })
  const pricePreviewQuery = useQuery({
    queryKey: [
      'booking-price-preview',
      resourceId ?? null,
      selectedDate,
      pricePreviewStartTime,
      pricePreviewEndTime,
      sportType,
    ],
    queryFn: () => previewBookingPrice({
      resourceId: resourceId!,
      bookingDate: selectedDate!,
      startTime: pricePreviewStartTime,
      endTime: pricePreviewEndTime,
      sportType,
      bookingType: 'regular',
    }),
    enabled: Boolean(resourceId && selectedDate && pricePreviewStartTime && pricePreviewEndTime),
    staleTime: 0,
    retry: false,
  })

  const availability: FacilityAvailability | null = availabilityQuery.data ?? null
  const bookedDates = calendarQuery.data?.dates
    .filter((day) => day.status === 'full')
    .map((day) => day.date) ?? []
  const pricePreview = pricePreviewQuery.data ?? null
  const isAvailabilityLoading = availabilityQuery.isFetching
  const isPriceLoading = pricePreviewQuery.isFetching
  const isApiPriceLoading = Boolean(resourceId) && priceTiersQuery.isFetching
  const apiPriceTiers = (priceTiersQuery.data ?? [])
    .filter((tier) => tier.dayType === 'weekday')
    .map((tier) => {
      const formatTime = (minutes: number) =>
        `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
      return {
        id: tier.id,
        range: `${formatTime(tier.tierStart)}-${formatTime(tier.tierEnd)}`,
        price: `${Math.round(tier.pricePerHour / 1000)}k/${isSoccer ? '2 jam' : 'jam'}`,
      }
    })

  useEffect(() => {
    if (priceTiersQuery.error) {
      toast.error(getApiErrorMessage(priceTiersQuery.error, t('booking.priceLoadFailed')))
    }
  }, [priceTiersQuery.error, t])

  useEffect(() => {
    if (availabilityQuery.error) {
      toast.error(getApiErrorMessage(availabilityQuery.error, t('booking.availabilityLoadFailed')))
    }
  }, [availabilityQuery.error, t])

  useEffect(() => {
    if (pricePreviewQuery.error) {
      toast.error(getApiErrorMessage(pricePreviewQuery.error, t('booking.priceCalculateFailed')))
    }
  }, [pricePreviewQuery.error, t])

  const availabilitySlotMinutes = availability?.slots[0]
    ? availability.slots[0].endMinute - availability.slots[0].startMinute
    : 15
  const availableTimeSlots = availability?.slots
    .filter((slot) => slot.startMinute % 60 === 0)
    .map((slot) => slot.startTime) ?? []

  const canBookWindow = (startMinute: number, durationMinutes: number) => {
    if (!availability || !selectedDate) return false
    if (startMinute % 60 !== 0 || durationMinutes % 60 !== 0) return false
    if (isPastSlot(selectedDate, minutesToTime(startMinute), currentTime)) return false

    const endMinute = startMinute + durationMinutes
    const coveredSlots = availability.slots.filter(
      (slot) => slot.startMinute >= startMinute && slot.endMinute <= endMinute,
    )
    return (
      coveredSlots.length === durationMinutes / availabilitySlotMinutes &&
      coveredSlots.every((slot) => slot.available) &&
      coveredSlots[0]?.startMinute === startMinute &&
      coveredSlots.at(-1)?.endMinute === endMinute
    )
  }

  const bookedSlotsToday = availableTimeSlots.filter((time) => !canBookWindow(timeToMinutes(time), 60))
  const blockedSlotStatuses = Object.fromEntries(
    (availability?.slots ?? [])
      .filter((slot) => slot.startMinute % 60 === 0 && !slot.available)
      .map((slot) => [slot.startTime, slot.status]),
  )
  const getMaxBookableHours = (time: string) => {
    let hours = 0
    for (let durationHours = 1; durationHours <= maxAllowedSessionHours; durationHours += 1) {
      if (!canBookWindow(timeToMinutes(time), durationHours * 60)) break
      hours = durationHours
    }
    return hours
  }
  const maxSessionHoursForSelection = selectedStartTime
    ? Math.max(1, getMaxBookableHours(selectedStartTime))
    : maxAllowedSessionHours
  const isDateBooked = Boolean(
    availability && (
      availability.isClosed ||
      availableTimeSlots.length === 0 ||
      bookedSlotsToday.length === availableTimeSlots.length
    ),
  )

  const durationMinutes = selectedDurationMinutes
  const sessionCount = selectedStartTime ? durationMinutes / 60 : 0
  const startTime = selectedStartTime ?? ''
  const endTime = selectedStartTime
    ? minutesToTime(timeToMinutes(selectedStartTime) + durationMinutes)
    : ''
  const durationLabel = (() => {
    const hours = Math.floor(durationMinutes / 60)
    const remainingMinutes = durationMinutes % 60
    if (hours && remainingMinutes) return t('booking.durationHoursMinutes', { hours, minutes: remainingMinutes })
    if (hours) return t('booking.durationHours', { count: hours })
    return t('booking.durationMinutes', { count: remainingMinutes })
  })()
  const totalPrice = pricePreview?.basePrice ?? 0

  let selectedDateLabel = '-'
  let selectedDayAndDate = '-'
  if (selectedDate) {
    const date = new Date(`${selectedDate}T00:00:00Z`)
    selectedDateLabel = new Intl.DateTimeFormat(i18n.language, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date)
    selectedDayAndDate = new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
    }).format(date)
  }

  const handleChangeMonth = (step: number) => {
    const next = new Date(viewYear, viewMonth + step, 1)
    const todayParts = getZonedParts(currentTime)
    const currentMonth = new Date(Number(todayParts.year), Number(todayParts.month) - 1, 1)
    if (next < currentMonth) return
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const handleSelectDate = (day: number) => {
    const dateKey = toDateKey(viewYear, viewMonth, day)
    if (dateKey < getTodayKey(currentTime) || dateKey === selectedDate) return
    setSelectedDate(dateKey)
    setSelectedStartTime(null)
    setIsConfirmed(false)
  }

  const handleSelectStartTime = (time: string) => {
    if (bookedSlotsToday.includes(time) || isPastSlot(selectedDate ?? '', time, new Date())) return
    if (selectedStartTime === time) {
      setSelectedStartTime(null)
    } else {
      const maxHours = getMaxBookableHours(time)
      if (maxHours === 0 || (isSoccer && maxHours < 2)) return
      setSelectedStartTime(time)
      setSelectedDurationMinutes((current) => Math.min(current, maxHours * 60))
    }
    setIsConfirmed(false)
  }

  const handleChangeDuration = (nextDurationMinutes: number) => {
    const minimumDurationMinutes = isSoccer ? 120 : 60
    const durationIncrementMinutes = isSoccer ? 120 : 60
    if (
      nextDurationMinutes < minimumDurationMinutes ||
      nextDurationMinutes > maxSessionHoursForSelection * 60 ||
      nextDurationMinutes % durationIncrementMinutes !== 0
    ) return
    if (selectedStartTime && !canBookWindow(timeToMinutes(selectedStartTime), nextDurationMinutes)) return
    setSelectedDurationMinutes(nextDurationMinutes)
    setIsConfirmed(false)
  }

  const resetSelection = () => {
    setSelectedDate(null)
    setSelectedStartTime(null)
    setIsConfirmed(false)
  }

  const getScheduleError = (): string | null => {
    if (!resourceId) return t('booking.facilityNotSelected')
    if (!selectedDate) return t('booking.dateNotSelected')
    if (selectedDate < getTodayKey(new Date())) return t('booking.dateInPast')
    if (isAvailabilityLoading || !availability) return t('booking.availabilityLoading')
    if (isDateBooked) return t('booking.facilityUnavailable')
    if (!selectedStartTime) return t('booking.timeNotSelected')
    if (bookedSlotsToday.includes(selectedStartTime)) return t('booking.slotUnavailable')
    if (isPastSlot(selectedDate, selectedStartTime, new Date())) return t('booking.timeInPast')
    if (
      durationMinutes < (isSoccer ? 120 : 60) ||
      durationMinutes % (isSoccer ? 120 : 60) !== 0 ||
      !canBookWindow(timeToMinutes(selectedStartTime), durationMinutes)
    ) return t('booking.durationUnavailable')
    if (isPriceLoading || !pricePreview) return t('booking.priceCalculating')
    return null
  }

  const validateSchedule = () => {
    const error = getScheduleError()
    if (!error) return true
    const hasAvailabilityConflict = Boolean(
      availability && (isDateBooked || (selectedStartTime && bookedSlotsToday.includes(selectedStartTime))),
    )
    if (hasAvailabilityConflict) setConflictMessage(error)
    else toast.error(error)
    return false
  }

  return {
    viewYear,
    viewMonth,
    selectedDate,
    selectedDateLabel,
    selectedDayAndDate,
    bookedDates,
    bookedSlotsToday,
    blockedSlotStatuses,
    availableTimeSlots,
    isAvailabilityLoading,
    selectedStartTime,
    durationMinutes,
    isDateBooked,
    sessionCount,
    durationLabel,
    startTime,
    endTime,
    totalPrice,
    maxSessionHours: maxSessionHoursForSelection,
    durationStepHours,
    isConfirmed,
    setIsConfirmed: setIsConfirmed as Dispatch<SetStateAction<boolean>>,
    pricePreview,
    conflictMessage,
    setConflictMessage,
    apiPriceTiers,
    isApiPriceLoading,
    handleChangeMonth,
    handleSelectDate,
    handleSelectStartTime,
    handleChangeDuration,
    resetSelection,
    validateSchedule,
  }
}