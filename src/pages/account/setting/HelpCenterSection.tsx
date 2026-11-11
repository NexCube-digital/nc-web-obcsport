import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../../utils/settingsStyles'

type HelpLinkId = 'panduan' | 'syarat' | 'admin'

type HelpCenterSectionProps = {
  contactWhatsAppUrl: string
}

const HELP_LINKS: { id: HelpLinkId; label: string; href?: string }[] = [
  { id: 'panduan', label: 'account.helpBooking', href: '/bantuan' },
  { id: 'syarat', label: 'account.helpTerms', href: '/syarat-ketentuan' },
  { id: 'admin', label: 'account.helpContact' },
]

function HelpCenterSection({ contactWhatsAppUrl }: HelpCenterSectionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleHelpLink = (id: HelpLinkId, href?: string) => {
    if (id === 'admin') {
      if (contactWhatsAppUrl) window.open(contactWhatsAppUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (href) navigate(href)
  }

  return (
    <section className={`${CARD_CLASS} pb-3`}>
      <h2 className={CARD_TITLE_CLASS}>{t('account.helpCenter')}</h2>
      <ul className="mt-1">
        {HELP_LINKS.map((link) => (
          <li key={link.id} className="border-b border-dashed border-[#E5E5E5] last:border-b-0">
            <button
              type="button"
              onClick={() => handleHelpLink(link.id, link.href)}
              disabled={link.id === 'admin' && !contactWhatsAppUrl}
              className="flex w-full items-center justify-between py-4 text-left text-sm text-[#121212] hover:text-[#004000] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{t(link.label)}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HelpCenterSection