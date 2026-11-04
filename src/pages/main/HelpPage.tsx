import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import { useIsMobile } from '../../hooks/useIsMobile'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface FaqItem {
  id: string
  question: string
  answer: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/faqService.js)
   ------------------------------------------------------------------------- */
// TODO: ganti dengan nomor WhatsApp customer service yang sebenarnya
const CS_WHATSAPP_NUMBER = '628123456789'

function HelpPage() {
  const { t, i18n } = useTranslation()
  const faqItems = t('help.faqs', { returnObjects: true }) as FaqItem[]
  const [searchQuery, setSearchQuery] = useState('')
  const isMobile = useIsMobile()

  // State khusus mobile: FAQ yang sedang terbuka (awal: item pertama, sesuai desain)
  const [openFaqId, setOpenFaqId] = useState<string | null>(() => faqItems[0]?.id ?? null)

  const normalizedSearch = searchQuery.toLocaleLowerCase(i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'id-ID')
  const filteredFaqs = faqItems.filter((faq) =>
    faq.question.toLocaleLowerCase(i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'id-ID').includes(normalizedSearch)
  )

  const handleContactWhatsApp = () => {
    const url = `https://wa.me/${CS_WHATSAPP_NUMBER}?text=${encodeURIComponent(t('help.whatsappMessage'))}`
    window.open(url, '_blank')
  }

  const handleToggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      {!isMobile && (
        <NavbarDashboard />
      )}
      {isMobile && (
        <MobileHeader variant="title" title={t('help.title')} />
      )}

      {/* ===================================================================
          TAMPILAN MOBILE (< md)
          Warna & font mengikuti versi PC
          =================================================================== */}
      {isMobile && <div className="px-4 pt-5 pb-44">
        <p className="mt-2 font-heading text-xs text-[#6F6B6E]">
          {t('help.description')}
        </p>

        {/* Pencarian */}
        <div className="relative mt-4">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6F6B6E]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('help.searchPlaceholder')}
            className="h-12 w-full rounded-full border border-[#D4D4D4] bg-white pl-11 pr-4 text-sm placeholder:text-[#6F6B6E] focus:outline-none focus:border-[#404F14]"
          />
        </div>

        {/* Daftar FAQ (accordion) */}
        <DeferredSection placeholderClassName="mt-6 min-h-[360px]">
        <div className="mt-6 space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id
            return (
              <div
                key={faq.id}
                className={`rounded-xl bg-white ${
                  isOpen ? 'border-2 border-[#404F14]' : 'border border-[#D4D4D4]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer"
                >
                  <h3 className="min-w-0 flex-1 truncate font-heading font-bold text-sm text-[#343133]">
                    {faq.question}
                  </h3>
                  <Plus
                    size={14}
                    className={`shrink-0 text-[#004000] transition-transform ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-[#343133]">{faq.answer}</p>
                )}
              </div>
            )
          })}

          {filteredFaqs.length === 0 && (
            <p className="text-sm text-[#6F6B6E] py-6 text-center">
              {t('help.noResults')}
            </p>
          )}
        </div>
        </DeferredSection>

        {/* Tombol WhatsApp (fixed, di atas bottom nav)
            Catatan: bottom-[68px] disesuaikan dengan tinggi bottom nav di Navbar.
            Jika tinggi bottom nav berubah, sesuaikan angka ini. */}
        <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-30 border-t border-[#D4D4D4] bg-white px-4 py-3">
          <button
            type="button"
            onClick={handleContactWhatsApp}
            className="h-12 w-full rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] cursor-pointer"
          >
            {t('help.contactButton')}
          </button>
        </div>
      </div>}

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      {/* Lebar konten 1068px sesuai desain */}
      {!isMobile && <main className="max-w-[1116px] mx-auto px-6 pt-5 pb-16">
        <span className="inline-block rounded-full bg-[#E8EDE3] px-3 py-2 text-xs font-heading font-bold text-[#404F14] tracking-wide">
          {t('help.eyebrow')}
        </span>

        {/* Lebar dibatasi supaya judul pecah jadi 2 baris seperti desain */}
        <h1 className="mt-4 max-w-[440px] font-heading font-bold text-4xl leading-tight text-[#343133]">
          {t('help.heroTitle')}
        </h1>

        {/* Kolom kiri 540px, kolom kanan fleksibel (480px), jarak 48px */}
        <DeferredSection placeholderClassName="mt-6 min-h-[540px] lg:min-h-[420px]">
        <div className="mt-6 grid lg:grid-cols-[540px_1fr] gap-12 items-start">
          {/* ================= Kolom kiri: pencarian & FAQ ================= */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('help.searchPlaceholder')}
              className="w-full h-[45px] rounded-lg border border-[#D4D4D4] bg-white px-3 text-sm placeholder:text-[#6F6B6E] focus:outline-none focus:border-[#404F14]"
            />

            <div className="mt-6 space-y-3">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-[#D4D4D4] bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-heading font-bold text-base text-[#343133]">
                      {faq.question}
                    </h3>
                    <Plus size={14} className="mt-1 shrink-0 text-[#004000]" />
                  </div>
                  <p className="mt-2 text-sm text-[#343133] leading-relaxed">{faq.answer}</p>
                </div>
              ))}

              {filteredFaqs.length === 0 && (
                <p className="text-sm text-[#6F6B6E] py-6 text-center">
                  {t('help.noResults')}
                </p>
              )}
            </div>
          </div>

          {/* ================= Kolom kanan: hubungi customer service ================= */}
          <div className="lg:mt-4 rounded-2xl border border-[#D4D4D4] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="font-heading font-bold text-lg text-[#343133]">
              {t('help.customerServiceTitle')}
            </h2>
            <p className="mt-4 text-sm text-[#343133] leading-relaxed">
              {t('help.customerServiceDescription')}
            </p>

            <div className="mt-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-sm font-heading font-bold text-[#404F14]">
                {t('help.onlineStatus')}
              </span>
            </div>

            {/* Tombol tidak selebar kartu, mengikuti desain (306px) */}
            <button
              type="button"
              onClick={handleContactWhatsApp}
              className="mt-5 w-full max-w-[306px] h-10 rounded-lg bg-[#CDF178] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              {t('help.contactButton')}
            </button>
          </div>
        </div>
        </DeferredSection>
      </main>}

      {/* Footer hanya tampil di desktop */}
      {!isMobile && (
        <DeferredFooter />
      )}
    </div>
  )
}

export default HelpPage