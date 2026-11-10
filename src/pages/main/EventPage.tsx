import { useTranslation } from 'react-i18next'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import ScrollReveal from '../../components/animation/ScrollReveal'
import whatsappIcon from '../../assets/icon/whatsapp2.svg'
import usePublicSiteContact from '../../hooks/usePublicSiteContact'
import { getWhatsAppHref } from '../../services/siteContactService'

/* Tipe data */
interface ReservationStep {
  id: number
  title: string
  description: string
  maxWidth: string
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

function OrderPage() {
  const { t } = useTranslation()
  const contact = usePublicSiteContact()
  const eventWhatsAppUrl = getWhatsAppHref(contact.whatsappPic || contact.whatsapp)
  const reservationSteps = t('event.steps', { returnObjects: true }) as ReservationStep[]
  const handleContactWhatsApp = () => {
    if (!eventWhatsAppUrl) return
    const separator = eventWhatsAppUrl.includes('?') ? '&' : '?'
    window.open(`${eventWhatsAppUrl}${separator}text=${encodeURIComponent(t('event.whatsappMessage'))}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard />

      <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
        {/* Judul halaman */}
        <ScrollReveal>
          <h1 className={`${FONT_MONTSERRAT} font-bold text-2xl leading-8 text-[#343133]`}>
            {t('event.title')}
          </h1>
          <p className="mt-1 text-sm leading-[21px] font-heading text-[#343133]">
            {t('event.description')}
          </p>
        </ScrollReveal>

        <DeferredSection placeholderClassName="mt-6 min-h-[560px] md:min-h-[720px] lg:min-h-[500px]">
        <div className="mt-6 grid lg:grid-cols-[1fr_420px] gap-10">
          {/* Ketentuan & alur reservasi */}
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-6">
            <h2 className={`${FONT_MONTSERRAT} font-semibold text-lg leading-7 text-[#343133]`}>
              {t('event.reservationTitle')}
            </h2>

            <div className="mt-4 space-y-4">
              {reservationSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6F0E0] text-sm font-heading font-bold text-[#265021]">
                    {index + 1}
                  </span>
                  <div className={step.maxWidth}>
                    <h3 className={`${FONT_MONTSERRAT} font-semibold text-sm leading-5 text-[#343133]`}>
                      {step.title}
                    </h3>
                    <p className="text-xs leading-[18px] font-heading text-[#343133]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Kotak peringatan kebijakan pembatalan */}
            <div className="mt-6 flex items-start gap-1.5 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-3 py-3">
              <span className="text-xs leading-[18px]" aria-hidden="true">
                ⚠️
              </span>
              <p className="text-xs leading-[18px] font-heading text-[#C00000]">
                {t('event.cancellationPolicy')}
              </p>
            </div>
          </section>

          {/* Kontak admin event */}
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-6 flex flex-col">
            <h2 className={`${FONT_MONTSERRAT} font-semibold text-lg leading-7 text-[#343133]`}>
              {t('event.contactTitle')}
            </h2>
            <p className="mt-3 text-sm leading-5 font-heading text-[#343133]">
              {t('event.contactDescription')}
            </p>

            {/* Info PIC (tanpa kotak, hanya padding) */}
            <div className="mt-6 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <img src={whatsappIcon} alt="" aria-hidden="true" className="h-4 w-4 brightness-0 invert" />
                </span>
                <span className="font-heading font-semibold text-sm text-[#343133]">
                  {t('event.contactPerson')}
                </span>
              </div>
              <p className="mt-3 text-[11px] font-heading text-[#343133]">
                {t('event.availability')}
              </p>
            </div>

            {/* Tombol menempel di bawah kartu */}
            <button
              type="button"
              onClick={handleContactWhatsApp}
              disabled={!eventWhatsAppUrl}
              className="mt-auto w-full h-10 rounded-lg bg-[#CDF178] text-[13px] font-heading font-semibold text-[#343133] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('event.contactButton')}
            </button>
          </section>
        </div>
        </DeferredSection>
      </main>

      <DeferredFooter />
    </div>
  )
}

export default OrderPage