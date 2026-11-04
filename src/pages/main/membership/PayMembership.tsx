import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CreditCard } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import NavbarDashboard from '../../../components/layout/Navbar'
import MobileHeader from '../../../components/layout/MobileHeader'
import DeferredFooter from '../../../components/layout/DeferredFooter'
import PaymentMethodSelector from '../../../components/ui/PaymentMethodSelector'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { toast } from 'sonner'
import PendingOrderModal from '../../../components/ui/PendingOrderModal'
import { isDirectChannel, parseMidtransCharge, type DirectChannel, type DirectPaymentInfo } from '../../../services/paymentService'
import { purchaseMembership, type MembershipPaymentChannel, type MembershipPackage, type MembershipSchedule, type PurchasedMembership } from '../../../services/membershipService'
import { getApiErrorMessage } from '../../../services/apiService'

interface MembershipPaymentState {
  membership?: PurchasedMembership
  package: MembershipPackage
  schedules: MembershipSchedule[]
}

const formatScheduleDate = (date: string, locale: string) => {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
}

export default function PayMembership() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'id-ID'
  const state = location.state as MembershipPaymentState | null

  const schedules = useMemo(() => state?.schedules ?? [], [state])
  const [selectedChannel, setSelectedChannel] = useState<MembershipPaymentChannel | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<DirectPaymentInfo | null>(null)
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null)
  const [membershipResult, setMembershipResult] = useState<PurchasedMembership | null>(state?.membership ?? null)
  const [showPending, setShowPending] = useState(false)

  useEffect(() => {
    if (!state) navigate('/membership', { replace: true })
  }, [navigate, state])

  if (!state) return <Navigate to="/membership" replace />

  const { package: membershipPackage } = state
  const membershipInfo = membershipResult ?? state.membership
  const displayPackageName = i18n.resolvedLanguage?.startsWith('en')
    ? membershipPackage.nameEn || membershipPackage.name
    : membershipPackage.name
  const paymentUrl = pendingPaymentUrl ?? (membershipResult?.payment && 'redirectUrl' in membershipResult.payment ? membershipResult.payment.redirectUrl : null)

  const continuePayment = () => {
    const redirectUrl = pendingPaymentUrl ?? paymentUrl ?? paymentInfo?.deeplinkUrl
    if (redirectUrl) window.location.assign(redirectUrl)
  }

  const handlePay = async () => {
    if (!selectedChannel) {
      toast.error(t('membership.payment.chooseMethod'))
      return
    }
    setIsPaying(true)
    try {
      const result = await purchaseMembership(membershipPackage.id, schedules, selectedChannel)
      setMembershipResult(result)

      if (result.payment && 'chargeResponse' in result.payment) {
        const charge = result.payment.chargeResponse as Parameters<typeof parseMidtransCharge>[0]
        const directInfo = parseMidtransCharge(charge, selectedChannel as DirectChannel)
        setPaymentInfo(directInfo)
        const successfulStatus = directInfo.status === 'settlement' || directInfo.status === 'capture'
        const failedStatus = ['deny', 'cancel', 'cancelled', 'expire', 'failure', 'failed'].includes(directInfo.status)
        if (successfulStatus) {
          navigate(`/success-order?bookingId=${encodeURIComponent(result.membershipId)}`, {
            replace: true,
            state: { bookingId: result.membershipId, transactionNumber: directInfo.orderId, method: directInfo.channel, facility: membershipPackage.name, total: result.price },
          })
        } else if (failedStatus) {
          navigate('/failed-order', {
            replace: true,
            state: { bookingId: result.membershipId, facility: membershipPackage.name, total: result.price },
          })
        } else {
          setShowPending(true)
        }
        return
      }

      if (result.payment && 'redirectUrl' in result.payment) {
        setPendingPaymentUrl(result.payment.redirectUrl)
        if (selectedChannel === 'ovo') {
          setShowPending(true)
          return
        }

        setShowPending(true)
        return
      }

      if (isDirectChannel(selectedChannel)) {
        toast.error(t('membership.payment.missingInstructions'))
        return
      }

      navigate('/failed-order', {
        replace: true,
        state: { bookingId: result.membershipId, facility: membershipPackage.name, total: result.price },
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('membership.payment.purchaseError')))
    } finally {
      setIsPaying(false)
    }
  }

  const content = (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-6">
      <header>
        <p className="text-xs text-[#6F6B6E] md:text-sm">{t('membership.payment.breadcrumb')}</p>
        <h1 className="mt-1 font-heading text-xl font-bold text-[#343133] md:text-[26px]">{t('membership.payment.pageTitle')}</h1>
      </header>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-[#D4D4D4] bg-white p-4 md:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#F1F2EE] text-[#404F14]">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-[#343133]">{t('membership.payment.chooseMethodTitle')}</h2>
              <p className="text-xs text-[#6F6B6E]">{t('membership.payment.chooseMethodDescription')}</p>
            </div>
          </div>

          <div className="mt-5">
            <PaymentMethodSelector value={selectedChannel} onChange={setSelectedChannel} ariaLabel={t('membership.payment.methodsLabel')} />
          </div>
        </section>

        <aside className="rounded-2xl border border-[#D4D4D4] bg-white p-4 md:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#E6F0E0] text-[#404F14]">
              <CalendarDays size={20} />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-[#343133]">{t('membership.payment.summary')}</h2>
              <p className="text-xs text-[#6F6B6E]">{t('membership.payment.transaction', { id: membershipInfo?.membershipId ?? t('membership.payment.notCreated') })}</p>
            </div>
          </div>

          <hr className="my-4 border-[#D4D4D4]" />
          <div>
            <h3 className="font-heading text-base font-bold text-[#343133]">{t('membership.payment.selectedSessions', { count: membershipInfo?.totalSessions ?? membershipPackage.totalSessions })}</h3>
            <p className="mt-1 text-xs text-[#6F6B6E]">{displayPackageName}</p>
            <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
              {schedules.map((schedule, index) => (
                <article key={`${schedule.bookingDate}-${schedule.startTime}-${index}`} className="rounded-lg border border-[#E5E5E5] bg-[#FDFCF7] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading text-[10px] font-bold text-[#404F14]">{t('membership.schedule.session', { number: index + 1 })}</p>
                      <p className="mt-1 font-heading text-xs font-bold text-[#343133]">{formatScheduleDate(schedule.bookingDate, locale)}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#E6F0E0] px-2 py-1 text-[10px] font-bold text-[#404F14]">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <dl className="mt-4 space-y-3 font-heading text-sm">
            <div className="flex justify-between gap-3"><dt className="text-[#6F6B6E]">{t('membership.package')}</dt><dd className="text-right font-bold text-[#343133]">{displayPackageName}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[#6F6B6E]">{t('membership.payment.sessionCount')}</dt><dd className="font-bold text-[#343133]">{t('membership.sessions', { count: membershipPackage.totalSessions })}</dd></div>
          </dl>

          <hr className="my-4 border-[#D4D4D4]" />
          <div className="flex items-center justify-between gap-3">
            <span className="font-heading text-sm font-bold text-[#343133]">{t('membership.payment.total')}</span>
            <strong className="font-heading text-xl text-[#404F14]">{membershipInfo?.priceFormatted ?? membershipPackage.memberPriceFormatted}</strong>
          </div>

          {isMobile ? (
            <button type="button" onClick={paymentInfo || paymentUrl ? continuePayment : handlePay} disabled={isPaying || (!selectedChannel && !paymentInfo && !paymentUrl)} className="fixed bottom-3 left-4 right-4 z-40 h-12 rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] disabled:opacity-50">
              {isPaying ? t('membership.payment.processing') : paymentInfo || paymentUrl ? t('membership.payment.continue') : t('membership.payment.payNow')}
            </button>
          ) : (
            <button type="button" onClick={paymentInfo || paymentUrl ? continuePayment : handlePay} disabled={isPaying || (!selectedChannel && !paymentInfo && !paymentUrl)} className="mt-5 h-11 w-full rounded-lg bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] hover:bg-[#B8D85E] disabled:cursor-not-allowed disabled:opacity-50">
              {isPaying ? t('membership.payment.processing') : paymentInfo || paymentUrl ? t('membership.payment.continue') : t('membership.payment.payNow')}
            </button>
          )}
          <button type="button" onClick={() => navigate('/membership')} className="mt-3 h-11 w-full rounded-lg border border-[#D4D4D4] bg-white font-heading text-sm font-bold text-[#6F6B6E]">
            {t('membership.payment.changePackageSchedule')}
          </button>
        </aside>
      </div>
    </div>
  )

  if (showPending) {
    return (
      <PendingOrderModal
        date={schedules[0]?.bookingDate ?? '-'}
        time={schedules.length > 0 ? `${schedules[0]?.startTime ?? '-'} - ${schedules[0]?.endTime ?? '-'}` : '-'}
        paymentMethod={selectedChannel ? t(`payment.methods.${selectedChannel}.name`) : t('membership.payment.midtrans')}
        amount={membershipInfo?.price ?? membershipPackage.memberPrice}
        transactionId={membershipInfo?.membershipId ?? '-'}
        paymentInfo={paymentInfo}
        paymentUrl={paymentUrl ?? undefined}
        bookings={schedules.map((schedule, index) => ({ id: `${schedule.bookingDate}-${index}`, name: displayPackageName, date: schedule.bookingDate, time: `${schedule.startTime} - ${schedule.endTime}` }))}
        onReturnHome={() => navigate('/home')}
        onOpenOrderStatus={() => navigate(`/membership/my/${membershipInfo?.membershipId ?? ''}`)}
        onContinuePayment={paymentUrl || paymentInfo?.deeplinkUrl ? continuePayment : undefined}
      />
    )
  }

  return isMobile ? (
    <>
      <MobileHeader variant="title" title={t('membership.payment.confirmTitle')} showShare={false} showBottomNav={false} />
      {content}
    </>
  ) : (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard showDesktopNavigation={false} showMobileHeader={false} />
      {content}
      <DeferredFooter />
    </div>
  )
}
