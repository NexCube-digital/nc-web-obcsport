// pages/MembershipPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../../../components/layout/Navbar'
import DeferredSection from '../../../components/layout/DeferredSection'
import DeferredFooter from '../../../components/layout/DeferredFooter'
import ScrollReveal from '../../../components/animation/ScrollReveal'
import member from '../../../assets/images/member.webp'
import { getApiErrorMessage } from '../../../services/apiService'
import { getMembershipPackages, type MembershipPackage, type MembershipSchedule } from '../../../services/membershipService'

const SPORT_LABELS: Record<string, string> = {
  futsal: 'Futsal',
  badminton: 'Badminton',
  pickleball: 'Pickleball',
  billiard: 'Billiard',
}

/* -------------------------------------------------------------------------
   Section showcase membership (menggantikan foto hero)
   ------------------------------------------------------------------------- */
function MembershipShowcase() {
  const { t } = useTranslation()
  return (
    <section
      id="membership"
      className="relative overflow-hidden rounded-2xl border border-[#E2DFD2] bg-white py-10 shadow-[0_4px_16px_rgba(52,49,51,0.06)]"
    >
      {/* tekstur lapangan samar */}
      <img
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-multiply"
        src={member}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={{ filter: 'brightness(1.15)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(0,157,0,0.08)_0%,transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-[calc(100%-40px)] max-w-[520px] grid-cols-1 items-center gap-8 md:w-[calc(100%-32px)] md:max-w-[1246px] md:grid-cols-2 md:gap-x-8 md:gap-y-6 md:px-6 xl:grid-cols-[1fr_auto_1fr] xl:gap-8">
        {/* Kolom kiri: headline & benefit */}
        <div className="flex min-w-0 flex-col items-start text-left">
          <span className="mb-1.5 block font-['Montserrat'] text-[12px] font-bold uppercase tracking-[1px] text-[#222222] md:text-[14px] md:font-medium xl:text-[15px]">
            {t('membership.showcase.badge')}
          </span>
          <h2 className="whitespace-pre-line font-['Montserrat'] text-[20px] font-semibold leading-[28px] tracking-normal text-[#000000] md:text-[30px] md:font-bold md:leading-[1.25] md:tracking-[1.5px] lg:text-[32px] xl:text-[36px]">
            {t('membership.showcase.title')}
          </h2>
          <p className="mt-2 w-full text-left font-['Montserrat'] text-[13px] font-normal leading-[20px] text-[#444444] md:mt-3 md:max-w-[360px] md:text-[13.5px] md:leading-[24px] xl:text-[14.5px]">
            {t('membership.showcase.description')}
          </p>
          <ul className="mt-4 w-full text-left md:mt-3 md:max-w-[360px]">
            {(t('membership.showcase.benefits', { returnObjects: true }) as string[]).map((benefit) => (
              <li
                className="mb-2.5 flex items-center gap-3 font-body text-[14px] text-[#1a1a1a] md:gap-2.5 md:text-[13px]"
                key={benefit}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-[#1a1a1a] text-[#1a1a1a] md:h-[18px] md:w-[18px]">
                  <Check className="h-3 w-3 md:h-2.5 md:w-2.5" strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Kartu membership 3D */}
        <div className="grid min-w-0 place-items-center py-2 md:py-0">
          <div
            className="relative flex h-[168px] w-[305px] max-w-full flex-col justify-between rounded-[16px] border border-[#10B9814D] p-5 shadow-[0_0_30px_0_rgba(198,245,42,0.12),-12px_18px_36px_-10px_rgba(0,0,0,0.6)] transition-transform [transform:rotate(3deg)] hover:scale-[1.02] md:h-[196px] md:w-[320px] md:[transform:rotate(2.5deg)] lg:h-[212px] lg:w-[350px] xl:h-[224px] xl:w-[365px] xl:p-6"
            style={{
              background:
                'linear-gradient(132.33deg, #002400 0.9%, #009D00 49.99%, #004000 99.1%)',
            }}
            aria-hidden="true"
          >
            <div className="flex items-start justify-between">
              <div>
                <strong className="block font-['Montserrat'] text-[17px] font-extrabold leading-none tracking-[-0.6px] text-[#FFFFFF] md:text-[26px] xl:text-[28px]">
                  OBC
                </strong>
                <span className="mt-1 block font-['Montserrat'] text-[8px] font-semibold uppercase leading-tight tracking-[2px] text-[#FFFFF7] md:text-[7.5px] xl:text-[8px]">
                  SPORT CENTER
                </span>
              </div>
              {/* Chip */}
              <div
                className="relative grid h-[19px] w-[26px] place-items-center shadow md:h-[17px] md:w-[24px]"
                style={{ transform: 'rotate(-2.5deg)' }}
              >
                <span className="absolute inset-0 rounded-[3px] border border-[#FFF717] bg-white" />
                <span
                  className="absolute h-[9px] w-[13px] rounded-[2px] border border-[#FFF717] bg-transparent md:h-2 md:w-3"
                  style={{ transform: 'rotate(-2.5deg)' }}
                />
              </div>
            </div>

            <div className="-translate-y-8 flex flex-col items-center justify-center text-center md:-translate-y-14">
              <p className="whitespace-nowrap font-['Montserrat'] text-[16px] font-extrabold leading-tight tracking-[0.5px] text-white md:text-[14px] xl:text-[15px]">
                  {t('membership.showcase.cardSubtitle')}
              </p>
              <p className="mt-1 font-['Montserrat'] text-[7.5px] font-semibold uppercase leading-tight tracking-[2px] text-[#FFFFF7] xl:text-[8px]">
                {t('membership.showcase.tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom kanan: brand & CTA */}
        <div className="flex min-w-0 flex-col items-end gap-1.5 pr-1.5 text-right md:col-span-2 md:items-center md:pr-0 md:text-center xl:col-span-1 xl:items-end xl:gap-2 xl:text-right">
          <div className="text-center xl:text-right">
            <strong className="block font-heading text-[40px] font-extrabold leading-none tracking-tight text-[#111111] md:text-[38px] xl:text-[46px]">
              OBC
            </strong>
            <small className="mt-1 block font-heading text-[13px] font-semibold tracking-[0.35em] text-[#111111] md:mt-0 md:text-[10.5px] xl:text-[11.5px]">
              SPORT CENTER
            </small>
          </div>

          <p className="mt-3 -rotate-2 text-right font-['Caveat'] text-[30px] font-bold leading-tight tracking-[1px] text-[#222222] md:mt-2 md:rotate-0 md:text-center xl:text-right xl:text-[36px]">
            {t('membership.showcase.tagline')}
          </p>

          <a
            className="group mt-3 inline-flex h-[56px] w-fit max-w-full shrink-0 items-center justify-start gap-3 self-start rounded-full border-[0.67px] border-[#CDF178] bg-[#CDF178] py-1.5 pl-[15px] pr-[6px] font-['Montserrat'] text-[13px] font-semibold text-[#1F3320] transition-colors duration-300 hover:border-[#004000] hover:bg-[#004000] md:mt-1 md:h-[52px] md:gap-3 md:self-auto md:py-2 md:pl-5 md:pr-2 md:text-[15px] xl:h-[58px] xl:text-[16px]"
            href="https://sport.obcgroup.id/"
            target="_blank"
            rel="noreferrer"
          >
            <span className="min-w-0 text-left leading-[20px] tracking-[0.02em] text-[#1F3320] transition-colors duration-300 group-hover:!text-[#CDF178] md:whitespace-nowrap md:leading-[18px]">
              {t('membership.showcase.cta')}
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1F3320] text-[#CDF178] transition-colors duration-300 group-hover:bg-[#CDF178] group-hover:text-[#004000] md:h-[40px] md:w-[40px] xl:h-[46px] xl:w-[46px]">
              <ArrowRight size={22} className="transition-transform duration-300 group-hover:rotate-45 md:hidden" />
              <ArrowUpRight size={22} className="hidden transition-transform duration-300 group-hover:rotate-45 md:block" />
            </span>
          </a>

          <small className="mt-11 text-right font-body text-[13px] italic text-[#6b7280] md:mt-2 md:text-center md:text-[10px] xl:text-right">
            {t('membership.showcase.terms')}
          </small>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------
   Halaman
   ------------------------------------------------------------------------- */
function MembershipOptions() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [packages, setPackages] = useState<MembershipPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<MembershipSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getMembershipPackages()
      .then((items) => {
        if (!active) return
        setPackages(items)
        setSelectedPackageId(items[0]?.id ?? null)
        setSchedules(items[0] ? Array.from({ length: items[0].totalSessions }, () => ({
          resourceId: items[0].resource?.id ?? '',
          bookingDate: '',
          startTime: '08:00',
          endTime: '09:00',
          sportType: items[0].sportType,
        })) : [])
      })
      .catch((error: unknown) => {
        if (active) toast.error(getApiErrorMessage(error, t('membership.loadError')))
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [t])

  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? null
  const getPackageName = (membershipPackage: MembershipPackage) =>
    i18n.resolvedLanguage?.startsWith('en')
      ? membershipPackage.nameEn || membershipPackage.name
      : membershipPackage.name

  const selectPackage = (membershipPackage: MembershipPackage) => {
    setSelectedPackageId(membershipPackage.id)
    setSchedules(Array.from({ length: membershipPackage.totalSessions }, (_, index) => ({
      resourceId: membershipPackage.resource?.id ?? schedules[index]?.resourceId ?? '',
      bookingDate: schedules[index]?.bookingDate ?? '',
      startTime: schedules[index]?.startTime ?? '08:00',
      endTime: schedules[index]?.endTime ?? '09:00',
      sportType: membershipPackage.sportType,
    })))
  }

  const handleSubmitMembership = () => {
    if (!selectedPackage) {
      toast.error(t('membership.selectPackageError'))
      return
    }
    navigate('/membership/sessions', {
      state: { package: selectedPackage, schedules },
    })
  }

  return (
        <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-6">
          <a
            href="#membership-details"
            className="block w-full rounded-xl border-2 border-[#121212] bg-white p-4 text-left transition-colors hover:bg-[#F8FAF4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000] md:rounded-2xl md:px-6 md:py-7"
          >
            <h2 className="font-heading text-[13px] font-bold leading-snug text-[#404F14] md:text-lg">
              <span className="md:hidden">{t('membership.offerTitle')}</span>
              <span className="hidden md:inline">{t('membership.offerTitleDesktop')}</span>
            </h2>
            <p className="mt-2 text-[10px] leading-snug text-[#121212] md:text-sm md:leading-relaxed">
              {t('membership.offerDescription')}
            </p>
          </a>

          {/* ================= Konten: Sports Membership ================= */}
          <section
            id="membership-details"
            className="w-full scroll-mt-20 md:rounded-2xl md:border md:border-[#E5E5E5] md:bg-white md:p-6 md:shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
          >
            {/* Judul mobile */}
            <h3 className="font-heading text-xl font-bold leading-snug text-[#343133] md:hidden">
              {t('membership.sectionTitleMobile')}
            </h3>

            {/* Judul & deskripsi desktop */}
            <h3 className="hidden font-heading text-xl font-bold text-[#121212] md:block">
              {t('membership.sectionTitleDesktop')}
            </h3>
            <p className="mt-1 hidden text-sm text-[#6F6B6E] md:block">
              {t('membership.sectionDescription')}
            </p>

            {isLoading ? (
              <p className="mt-4 text-sm text-[#6F6B6E]">{t('membership.loading')}</p>
            ) : packages.length === 0 ? (
              <p className="mt-4 rounded-lg border border-[#E5E5E5] p-4 text-sm text-[#6F6B6E]">
                {t('membership.empty')}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {packages.map((membershipPackage) => {
                  const isSelected = selectedPackageId === membershipPackage.id
                  return (
                    <button
                      key={membershipPackage.id}
                      type="button"
                      onClick={() => selectPackage(membershipPackage)}
                      className={`min-w-0 cursor-pointer rounded-lg p-3 text-left transition-colors md:min-h-[87px] md:text-center ${
                        isSelected
                          ? 'border-2 border-[#404F14] bg-[#F5FAF3]'
                          : 'border border-[#E5E5E5] bg-white'
                      }`}
                    >
                      <p className="font-heading text-sm font-bold text-[#121212] md:text-base">
                        {getPackageName(membershipPackage)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6F6B6E]">
                        {SPORT_LABELS[membershipPackage.sportType] ?? membershipPackage.sportType}
                      </p>
                      <p className="mt-2 font-heading text-sm font-bold text-[#404F14] md:mt-1">
                        {membershipPackage.memberPriceFormatted}
                        <span className="hidden md:inline"> / {t('membership.sessions', { count: membershipPackage.totalSessions })}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6F6B6E] md:hidden">
                        {t('membership.packageDuration', { sessions: membershipPackage.totalSessions, days: membershipPackage.validityDays })}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Kotak keuntungan member */}

            <div className="mt-5 flex gap-2 rounded-lg border border-dashed border-[#404F14] bg-[#EFF6EC] px-3 py-3">
              <span aria-hidden="true">💳</span>
              <p className="text-sm leading-relaxed text-[#404F14]">
                <span className="font-heading font-bold">{t('membership.memberBenefitTitle')}</span> {t('membership.memberBenefitDescription')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmitMembership}
              disabled={isLoading || !selectedPackageId}
              className="mt-5 h-12 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-base font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-50 md:h-[42px] md:rounded-lg md:text-sm"
            >
              <span>{t('membership.selectSchedule', { count: selectedPackage?.totalSessions ?? 0 })}</span>
            </button>
          </section>
        </div>
  )
}

function MembershipPage() {
  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard />
      <main className="mx-auto max-w-[1288px] px-6 pb-32 pt-4 md:pb-16 md:pt-10">
        <ScrollReveal>
          <MembershipShowcase />
        </ScrollReveal>
        <DeferredSection placeholderClassName="mt-6 min-h-[520px] md:min-h-[460px]">
          <MembershipOptions />
        </DeferredSection>
      </main>
      <DeferredFooter />
    </div>
  )
}

export default MembershipPage