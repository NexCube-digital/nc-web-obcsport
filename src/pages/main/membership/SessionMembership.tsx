import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import BookingCalendar from '../../orders/checkout/BookingCalendar'
import TimeSlotPicker from '../../orders/checkout/TimeSlotPicker'
import lapangF1 from '../../../assets/layanan/Lapang F1.png'
import NavbarDashboard from '../../../components/layout/Navbar'
import DeferredFooter from '../../../components/layout/DeferredFooter'
import { getFacilityAvailability, getSportsFacilities, type SportsFacility } from '../../../services/facilityService'
import type { MembershipPackage, MembershipSchedule } from '../../../services/membershipService'

interface SessionMembershipProps {
  selectedPackage: MembershipPackage
  schedules: MembershipSchedule[]
  facilities: SportsFacility[]
  onUpdateSchedule: (index: number, patch: Partial<MembershipSchedule>) => void
}

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export function SessionMembership({ selectedPackage, schedules, facilities, onUpdateSchedule }: SessionMembershipProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'id-ID'
  const today = new Date()
  const [activeSession, setActiveSession] = useState(0)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(schedules[0]?.bookingDate || '')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(schedules[0]?.resourceId && schedules[0]?.bookingDate))

  const schedule = schedules[activeSession]
  const selectedFacility = facilities.find((facility) => facility.id === schedule?.resourceId) ?? null
  const facilityImage = selectedFacility?.imageUrl ?? lapangF1

  const selectedSessionLabel = useMemo(() => {
    const bookingDate = schedule?.bookingDate
    if (!bookingDate) return '-'
    return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(`${bookingDate}T00:00:00`))
  }, [locale, schedule?.bookingDate])

  const selectSession = (index: number) => {
    setIsLoading(Boolean(schedules[index]?.resourceId && schedules[index]?.bookingDate))
    setActiveSession(index)
    setSelectedDate(schedules[index]?.bookingDate ?? '')
  }

  useEffect(() => {
    if (!schedule?.resourceId || !selectedDate) return

    let active = true
    getFacilityAvailability(schedule.resourceId, selectedDate, schedule.sportType ?? selectedPackage.sportType)
      .then((availability) => {
        if (!active) return
        const hourlyStarts = availability.slots.filter((slot) => slot.startMinute % 60 === 0)
        const intervalMinutes = availability.slots[0]
          ? availability.slots[0].endMinute - availability.slots[0].startMinute
          : 15
        const available = hourlyStarts.filter((startSlot) => {
          const endMinute = startSlot.startMinute + 60
          const coveredSlots = availability.slots.filter(
            (slot) => slot.startMinute >= startSlot.startMinute && slot.endMinute <= endMinute,
          )
          return coveredSlots.length === 60 / intervalMinutes && coveredSlots.every((slot) => slot.available)
        })
        const availableTimes = available.map((slot) => slot.startTime)
        setAvailableSlots(availableTimes)
        setBookedSlots(hourlyStarts.filter((slot) => !availableTimes.includes(slot.startTime)).map((slot) => slot.startTime))
      })
      .catch(() => {
        if (!active) return
        setAvailableSlots([])
        setBookedSlots([])
      })
      .finally(() => { if (active) setIsLoading(false) })

    return () => { active = false }
  }, [activeSession, schedule?.resourceId, schedule?.sportType, selectedDate, selectedPackage.sportType])

  const chooseFacility = (facilityId: string) => {
    setIsLoading(false)
    setAvailableSlots([])
    setBookedSlots([])
    setSelectedDate('')
    onUpdateSchedule(activeSession, { resourceId: facilityId, bookingDate: '', startTime: '08:00', endTime: '09:00' })
  }

  const chooseDate = (day: number) => {
    if (!schedule?.resourceId) {
      toast.error(t('membership.schedule.chooseFacilityFirst'))
      return
    }
    const date = toDateKey(viewYear, viewMonth, day)
    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())
    if (date < todayKey) return
    setIsLoading(true)
    setSelectedDate(date)
    onUpdateSchedule(activeSession, { bookingDate: date })
  }

  const chooseTime = (time: string) => {
    const endMinutes = timeToMinutes(time) + 60
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
    onUpdateSchedule(activeSession, { startTime: time, endTime })
  }

  const changeMonth = (step: number) => {
    const next = new Date(viewYear, viewMonth + step, 1)
    const current = new Date(today.getFullYear(), today.getMonth(), 1)
    if (next < current) return
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  return (
    <section className="rounded-2xl border border-[#D4D4D4] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] md:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E5E5] pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#404F14]">{t('membership.schedule.heading')}</p>
          <h4 className="mt-1 font-heading text-base font-bold text-[#343133]">{t('membership.schedule.sessions', { count: selectedPackage.totalSessions })}</h4>
        </div>
        <span className="rounded-full bg-[#EFF6EC] px-3 py-1 text-xs font-bold text-[#404F14]">
          {t('membership.schedule.filled', { booked: schedules.filter((item) => item.bookingDate).length, total: selectedPackage.totalSessions })}
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {schedules.map((item, index) => (
          <button
            key={`${selectedPackage.id}-${index}`}
            type="button"
            onClick={() => selectSession(index)}
            className={`h-10 shrink-0 rounded-lg px-4 text-xs font-heading font-bold ${activeSession === index ? 'bg-[#404F14] text-white' : item.bookingDate ? 'border border-[#404F14] bg-[#F5FAF3] text-[#404F14]' : 'border border-[#D4D4D4] bg-white text-[#6F6B6E]'}`}
          >
            {t('membership.schedule.session', { number: index + 1 })}
          </button>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-5 lg:grid-cols-[minmax(240px,360px)_minmax(0,1fr)]">
        <div>
          <img src={facilityImage} alt={selectedFacility?.name ?? t('membership.schedule.facility')} className="h-[220px] w-full rounded-xl object-cover md:h-[280px]" />
          <h5 className="mt-4 font-heading text-lg font-bold text-[#343133]">{selectedFacility?.name ?? t('membership.schedule.chooseFacility')}</h5>
          <p className="mt-1 text-xs text-[#6F6B6E]">{selectedFacility?.location?.name ?? 'OBC Sport Center'}</p>

          <label className="mt-4 block">
            <span className="mb-1 block text-[10px] font-bold text-[#6F6B6E]">{t('membership.schedule.sessionFacility', { number: activeSession + 1 })}</span>
            <select
              value={schedule?.resourceId ?? ''}
              onChange={(event) => chooseFacility(event.target.value)}
              className="h-11 w-full rounded-lg border border-[#D4D4D4] bg-white px-3 text-xs text-[#343133]"
            >
              <option value="">{t('membership.schedule.chooseFacility')}</option>
              {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
            </select>
          </label>
        </div>

        <div className="min-w-0">
          <h5 className="flex items-center gap-2 font-heading text-lg font-bold text-[#343133]">
            <CalendarDays size={18} /> {t('membership.schedule.chooseDateTime')}
          </h5>
          <p className="mt-1 text-xs text-[#6F6B6E]">{t('membership.schedule.availabilityHint')}</p>

          {!selectedDate ? (
            <BookingCalendar
              variant="desktop"
              viewYear={viewYear}
              viewMonth={viewMonth}
              selectedDate={selectedDate || null}
              bookedDates={[]}
              onChangeMonth={changeMonth}
              onSelectDate={chooseDate}
            />
          ) : (
            <>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#D4D4D4] px-4 py-3">
                <div>
                  <p className="text-xs text-[#6F6B6E]">{t('membership.schedule.selectedDate')}</p>
                  <p className="font-heading text-sm font-bold text-[#343133]">{selectedSessionLabel}</p>
                </div>
                <button type="button" onClick={() => setSelectedDate('')} className="shrink-0 rounded-lg border border-[#D4D4D4] px-3 py-2 text-xs font-bold text-[#265021]">{t('membership.schedule.changeDate')}</button>
              </div>
              <TimeSlotPicker
                variant="desktop"
                isDateBooked={!isLoading && availableSlots.length === 0}
                bookedSlotsToday={bookedSlots}
                availableTimeSlots={availableSlots}
                isLoading={isLoading}
                selectedStartTime={schedule?.startTime ?? null}
                durationMinutes={60}
                sessionCount={schedule?.startTime ? 1 : 0}
                durationLabel={t('membership.schedule.oneHour')}
                selectedDateLabel={selectedSessionLabel}
                startTime={schedule?.startTime ?? ''}
                endTime={schedule?.endTime ?? ''}
                maxSessionHours={1}
                onToggleTime={chooseTime}
                onChangeDuration={() => undefined}
                onResetSearch={() => setSelectedDate('')}
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}

interface SessionPageState {
  package: MembershipPackage
  schedules?: MembershipSchedule[]
}

export default function SessionMembershipPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const state = location.state as SessionPageState | null
  const [facilities, setFacilities] = useState<SportsFacility[]>([])
  const [schedules, setSchedules] = useState<MembershipSchedule[]>(() => state?.schedules ??
    (state?.package ? Array.from({ length: state.package.totalSessions }, () => ({
      resourceId: state.package.resource?.id ?? '',
      bookingDate: '',
      startTime: '08:00',
      endTime: '09:00',
      sportType: state.package.sportType,
    })) : []))

  useEffect(() => {
    if (!state?.package) return
    getSportsFacilities()
      .then((items) => setFacilities(items.filter((item) => item.sportTypes.includes(state.package.sportType))))
      .catch(() => toast.error(t('membership.schedule.facilitiesLoadError')))
  }, [state?.package, t])

  if (!state?.package) return <Navigate to="/membership" replace />

  const updateSchedule = (index: number, patch: Partial<MembershipSchedule>) => {
    setSchedules((current) => current.map((schedule, scheduleIndex) =>
      scheduleIndex === index ? { ...schedule, ...patch } : schedule,
    ))
  }

  const schedulesComplete = schedules.length === state.package.totalSessions && schedules.every((schedule) =>
    schedule.resourceId && schedule.bookingDate && schedule.startTime && schedule.endTime && schedule.endTime > schedule.startTime,
  )

  const continueToPayment = () => {
    if (!schedulesComplete) {
      toast.error(t('membership.schedule.completeAll'))
      return
    }
    navigate('/pay-membership', { state: { package: state.package, schedules } })
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard />
      <main className="mx-auto max-w-[1248px] px-4 pb-16 pt-5 md:px-6 md:pt-8">
        <header>
          <p className="text-xs text-[#6F6B6E]">{t('membership.schedule.breadcrumb')}</p>
          <h1 className="mt-1 font-heading text-xl font-bold text-[#343133] md:text-2xl">{t('membership.schedule.pageTitle')}</h1>
        </header>
        <div className="mt-5">
          <SessionMembership
            selectedPackage={state.package}
            schedules={schedules}
            facilities={facilities}
            onUpdateSchedule={updateSchedule}
          />
        </div>
        <button
          type="button"
          onClick={continueToPayment}
          disabled={!schedulesComplete}
          className="mt-5 h-12 w-full rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] disabled:cursor-not-allowed disabled:opacity-50 md:h-11 md:rounded-lg"
        >
          {t('membership.schedule.continueToPayment')}
        </button>
      </main>
      <DeferredFooter />
    </div>
  )
}
