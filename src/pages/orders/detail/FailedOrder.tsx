import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, CircleX } from 'lucide-react'
import ScrollReveal from '../../../components/animation/ScrollReveal'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { getBookingDetails, type BookingDetails } from '../../../services/bookingService'
import lapangF1 from '../../../assets/images/lapang/Lapang F1.webp'
import { useTranslation } from 'react-i18next'
import usePublicSiteContact from '../../../hooks/usePublicSiteContact'
import { getWhatsAppHref } from '../../../services/siteContactService'

/* Tipe data   */
interface FailedState {
  bookingId?: string
  bookingIds?: string[]
  bookingCode?: string
  facility?: string
  schedule?: string
  total?: number
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

// Fallback bila halaman dibuka tanpa state (sesuai desain)
const DEFAULT_BOOKING_CODE = 'OBC-BAD-1120'
const DEFAULT_FACILITY = 'Badminton VIP Court'
const DEFAULT_SCHEDULE = 'Sabtu, 14 Mar (09:00 - 11:00)'
const DEFAULT_TOTAL = 160000

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function FailedOrder() {
  const { t } = useTranslation()
  const contact = usePublicSiteContact()
  const adminWhatsAppUrl = getWhatsAppHref(contact.whatsapp)
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const state = (location.state as FailedState | null) ?? {}
  const queryBookingIds = new URLSearchParams(location.search).get('bookingIds')?.split(',').filter(Boolean) ?? []
  const bookingIds = state.bookingIds?.length ? state.bookingIds : queryBookingIds.length ? queryBookingIds : [state.bookingId ?? new URLSearchParams(location.search).get('bookingId') ?? ''].filter(Boolean)
  const bookingId = bookingIds[0] ?? ''
  const [booking, setBooking] = useState<BookingDetails | null>(null)

  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      navigate('/home', { replace: true })
      return
    }
    let active = true
    getBookingDetails(bookingId)
      .then((details) => {
        if (!active) return
        if (details.status === 'fully_paid' || details.status === 'completed') {
          navigate('/success-order', { replace: true, state: { bookingId } })
          return
        }
        if (!['cancelled', 'expired', 'refunded'].includes(details.status)) {
          navigate('/information-order', { replace: true, state: { bookingId } })
          return
        }
        setBooking(details)
      })
      .catch(() => {
        if (active) navigate('/information-order', { replace: true, state: { bookingId } })
      })
    return () => { active = false }
  }, [bookingId, navigate])

  const bookingCode = booking?.id.slice(-8).toUpperCase() ?? state.bookingCode ?? DEFAULT_BOOKING_CODE
  const facility = booking?.resource.name ?? state.facility ?? DEFAULT_FACILITY
  const schedule = booking
    ? `${booking.bookingDate} (${booking.startTime} - ${booking.endTime})`
    : state.schedule ?? DEFAULT_SCHEDULE
  const total = booking?.pricing.totalPrice ?? state.total ?? DEFAULT_TOTAL

  const handleRetry = () => {
    if (!booking) {
      navigate('/home')
      return
    }
    navigate('/checkout', {
      state: {
        resourceId: booking.resource.id,
        sportType: booking.sportType,
        facility: {
          id: booking.resource.id,
          name: booking.resource.name,
          description: booking.resource.name,
          badge: t('booking.available'),
          buttonLabel: t('booking.bookCourt'),
          image: lapangF1,
          sportTypes: [booking.sportType],
        },
      },
    })
  }

  if (!booking) return <div role="status" className="px-4 py-8 text-center text-sm text-[#6B6B6B]">{t('paymentResult.loading')}</div>

  const troubleshootingSteps = t('paymentResult.troubleshootingSteps', { returnObjects: true }) as string[]
  const statusLabel = t(`paymentResult.${booking.status}`, { defaultValue: booking.status })

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-x-0 bottom-0 top-0 flex min-h-0 flex-col overflow-hidden bg-white font-body text-[#343133]"
        >
        <ScrollReveal className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-3">
        <div
          role="img"
          aria-label={t('paymentResult.failedTitle')}
          className="grid h-20 w-full place-items-center text-[#E02424]"
        >
          <CircleX
            size={58}
            strokeWidth={1.8}
            aria-hidden="true"
            className="failed-icon-shake"
          />
        </div>

        {/* Judul & deskripsi, rata tengah */}
        <div className="mt-3 text-center">
          <span className="inline-block rounded-full bg-[#FDE8E8] px-3 py-1.5 font-heading text-[10px] font-bold leading-none text-[#E02424]">
            {t('paymentResult.failedStatus', { status: statusLabel.toUpperCase() })}
          </span>
          <h1 className={`${FONT_MONTSERRAT} mt-2 text-lg font-bold leading-6 text-[#343133]`}>
            {t('paymentResult.failedTitle')}
          </h1>
          {bookingIds.length > 1 && (
            <p className="mt-1 font-heading text-[11px] font-bold text-[#E02424]">
              {t('paymentResult.failedCount', { count: bookingIds.length })}
            </p>
          )}
          <p className="mt-1.5 font-heading text-[11px] leading-4 text-[#343133]">
            {t('paymentResult.failedDescription')}
          </p>
        </div>

        {/* Kartu informasi pesanan gagal */}
        <section className="mt-3 rounded-2xl border border-[#D4D4D4] bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className={`${FONT_MONTSERRAT} text-sm font-semibold leading-5 text-[#343133]`}>
              {t('paymentResult.failedOrderInfo')}
            </h2>
            <button
              type="button"
              onClick={() => setIsOrderDetailsOpen((open) => !open)}
              aria-expanded={isOrderDetailsOpen}
              className="flex shrink-0 cursor-pointer items-center gap-1 font-heading text-[11px] font-bold text-[#404F14]"
            >
              {isOrderDetailsOpen ? t('paymentResult.collapse') : t('paymentResult.expand')}
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`transition-transform ${isOrderDetailsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {isOrderDetailsOpen && <>
          <dl className="mt-3 space-y-2 font-heading text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">{t('paymentResult.bookingCode')}</dt>
              <dd className="font-bold text-[#E02424] line-through">{bookingCode}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#343133]">{t('paymentResult.bookingStatus')}</dt>
              <dd className="rounded bg-[#E53E3E] px-2 py-1 text-[9px] font-bold leading-none text-white">
                {statusLabel.toUpperCase()}
              </dd>
            </div>
          </dl>

          <hr className="my-3 border-[#D4D4D4]" />

          <dl className="space-y-2 font-heading text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#343133]">{t('paymentResult.facility')}</dt>
              <dd className="text-right font-bold text-[#121212]">{facility}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-[#343133]">{t('paymentResult.schedule')}</dt>
              <dd className="text-right font-bold text-[#121212]">{schedule}</dd>
            </div>
          </dl>
          </>}

          <hr className="my-2 border-[#D4D4D4]" />

          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-bold text-[#121212]">
              {t('paymentResult.totalDue')}
            </span>
            <span className={`${FONT_MONTSERRAT} text-xl font-bold text-[#343133]`}>
              {formatRupiah(total)}
            </span>
          </div>
        </section>

        {/* Langkah penyelesaian masalah */}
        <h2 className="mt-3 font-heading text-[11px] font-bold text-[#121212]">
          {t('paymentResult.troubleshooting')}
        </h2>
        <ol className="mt-1.5 space-y-1 font-heading text-[10px] leading-3.5 text-[#343133]">
          {troubleshootingSteps.map((step, index) => (
            <li key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>

        {/* Tombol, menempel di bawah layar */}
        <div className="shrink-0 space-y-2 border-t border-[#E5E5E5] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="h-10 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E]"
          >
            {t('paymentResult.retryPayment')}
          </button>
          {adminWhatsAppUrl && <a
            href={adminWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-full items-center justify-center rounded-xl border border-[#404F14] bg-white font-heading text-xs font-bold text-[#404F14] transition-colors active:bg-[#F5FAF3]"
          >
            {t('paymentResult.contactAdmin')}
          </a>}
        </div>
        </ScrollReveal>
        </div>
      )}

      {!isMobile && <div className="min-h-screen flex flex-col bg-white font-body text-[#343133]">
        <main className="mx-auto flex w-full max-w-[1068px] flex-1 items-center px-6 py-12">
          <ScrollReveal className="w-full">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_480px]">
            {/* Kiri: penjelasan */}
            <div>
              <span className="inline-block rounded-full bg-[#FDE8E8] px-3 py-2 font-heading text-[11px] font-bold leading-none text-[#E02424]">
                {t('paymentResult.failedStatus', { status: statusLabel.toUpperCase() })}
              </span>

              <h1
                className={`${FONT_MONTSERRAT} mt-6 text-[38px] font-bold leading-[48px] text-[#343133]`}
              >
                {t('paymentResult.failedTitle')}
              </h1>

              <p className="mt-6 font-heading text-[15px] leading-6 text-[#343133]">
                {t('paymentResult.failedDescription')}
              </p>

              <h2 className="mt-6 font-heading text-[13px] font-bold text-[#121212]">
                {t('paymentResult.troubleshooting')}
              </h2>
              <ol className="mt-3 space-y-2.5 font-heading text-xs leading-[18px] text-[#343133]">
                {troubleshootingSteps.map((step, index) => (
                  <li key={step}>
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-nowrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="h-10 w-[220px] shrink-0 cursor-pointer rounded-lg bg-[#CDF178] px-3 font-heading text-xs text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
                >
                  {t('paymentResult.retryPayment')}
                </button>
                {adminWhatsAppUrl && <a
                  href={adminWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-[176px] shrink-0 items-center justify-center rounded-lg border border-[#404F14] bg-white px-2 font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#F5FAF3]"
                >
                  {t('paymentResult.contactAdmin')}
                </a>}
              </div>
            </div>

            {/* Kanan: info pesanan gagal */}
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <h2 className={`${FONT_MONTSERRAT} text-xl font-semibold leading-7 text-[#343133]`}>
                {t('paymentResult.failedOrderInfo')}
              </h2>

              <dl className="mt-3 space-y-2.5 font-heading text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.bookingCode')}</dt>
                  <dd className="font-bold text-[#E02424] line-through">{bookingCode}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.bookingStatus')}</dt>
                  <dd className="rounded bg-[#E53E3E] px-2 py-1 text-[9px] font-bold leading-none text-white">
                    {statusLabel.toUpperCase()}
                  </dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />

              <dl className="space-y-2.5 font-heading text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.facility')}</dt>
                  <dd className="font-bold text-[#121212]">{facility}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#343133]">{t('paymentResult.schedule')}</dt>
                  <dd className="font-bold text-[#121212]">{schedule}</dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-heading text-sm font-bold text-[#121212]">
                  {t('paymentResult.totalDue')}
                </span>
                <span className={`${FONT_MONTSERRAT} text-[22px] font-bold text-[#343133]`}>
                  {formatRupiah(total)}
                </span>
              </div>
            </section>
          </div>
          </ScrollReveal>
        </main>

      </div>}
    </>
  )
}

export default FailedOrder