import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Home, LayoutDashboard, LogIn, UserPlus } from 'lucide-react'
import logo from '../../assets/logo/unit bisnis/sport.webp'
import { useAuth } from '../../hooks/useAuth'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface Language {
  code: string
  label: string
}

/* -------------------------------------------------------------------------
   Data pilihan bahasa
   ------------------------------------------------------------------------- */
const LANGUAGES: Language[] = [
  { code: 'IND', label: 'Indonesia' },
  { code: 'ENG', label: 'English' },
]

function NavbarLanding() {
  const { isLoggedIn } = useAuth()
  const { t, i18n } = useTranslation()
  const location = useLocation()
  // State bahasa aktif dan dropdown
  const activeLang = i18n.resolvedLanguage?.startsWith('en') ? LANGUAGES[1] : LANGUAGES[0]
  const [isLangOpen, setIsLangOpen] = useState(false)
  const isHomeActive = location.pathname === '/' && location.hash !== '#lapangan'
  const isBookingActive = location.pathname === '/' && location.hash === '#lapangan'

  useEffect(() => {
    if (!isBookingActive) return
    document.getElementById('lapangan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [isBookingActive])

  const handleSelectLang = (lang: Language) => {
    void i18n.changeLanguage(lang.code === 'ENG' ? 'en' : 'id')
    setIsLangOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#D4D4D4] bg-white">
      <div className="mx-auto flex h-auto min-h-16 w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-1.5 gap-y-1 px-2 py-2 min-[360px]:min-h-20 min-[360px]:gap-x-3 min-[360px]:px-4 sm:min-h-[100px] sm:gap-y-0 sm:px-6 sm:py-0 lg:flex-nowrap">
        {/* Logo */}
        <Link
          to="/"
          className="order-1 flex min-w-0 items-center gap-2 min-[360px]:gap-3 sm:gap-4"
        >
          <img
            src={logo}
            alt="OBC Sport Center"
            className="w-7 h-7 min-[360px]:w-10 min-[360px]:h-10 sm:w-12 sm:h-12 shrink-0 rounded-full object-contain"
          />
          <span className="hidden min-[500px]:block font-heading font-semibold text-xs sm:text-xl leading-tight text-[#343133]">
            OBC Sport Center
          </span>
        </Link>

        <nav
          aria-label={t('common.primaryNavigation')}
          className="order-3 flex w-full items-center justify-center gap-1 rounded-xl border border-[#E3E8DB] bg-[#F3F6EE] p-1 lg:order-2 lg:w-auto lg:flex-1 lg:gap-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
        >
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-current={isHomeActive ? 'page' : undefined}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-heading text-xs font-semibold transition-colors lg:flex-none lg:rounded-md lg:py-1.5 lg:text-sm ${isHomeActive ? 'bg-white text-[#404F14] shadow-sm lg:bg-transparent lg:shadow-none' : 'text-[#68665F] hover:bg-white/70 hover:text-[#404F14] lg:hover:bg-transparent'}`}
          >
            <Home size={15} aria-hidden="true" />
            {t('common.home')}
          </Link>
          <Link
            to="/#lapangan"
            onClick={() => document.getElementById('lapangan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            aria-current={isBookingActive ? 'page' : undefined}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-heading text-xs font-semibold transition-colors lg:flex-none lg:rounded-md lg:py-1.5 lg:text-sm ${isBookingActive ? 'bg-white text-[#404F14] shadow-sm lg:bg-transparent lg:shadow-none' : 'text-[#68665F] hover:bg-white/70 hover:text-[#404F14] lg:hover:bg-transparent'}`}
          >
            <CalendarDays size={15} aria-hidden="true" />
            {t('common.booking')}
          </Link>
        </nav>

        <div className="order-2 flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 sm:gap-4 lg:order-3">
          {/* Pemilih bahasa */}
          <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-2 sm:px-3 h-7 text-[11px] min-[360px]:text-xs font-heading font-medium text-[#343133] hover:bg-[#FDFCF7] transition-colors"
            aria-haspopup="listbox"
            aria-expanded={isLangOpen}
          >
            {/* Ikon globe */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#121212"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hidden min-[300px]:block"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{activeLang.code}</span>
            {/* Ikon chevron */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#343133"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown bahasa */}
          {isLangOpen && (
            <ul
              role="listbox"
              className="absolute right-0 mt-2 w-32 max-w-[calc(100vw-1.5rem)] rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-md z-50"
            >
              {LANGUAGES.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => handleSelectLang(lang)}
                    className={`w-full text-left px-3 py-2 text-xs font-heading hover:bg-[#FDFCF7] ${
                      lang.code === activeLang.code
                        ? 'font-bold text-[#004000]'
                        : 'font-medium text-[#343133]'
                    }`}
                  >
                    {lang.code} – {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          </div>

          {/* Aksi autentikasi */}
          <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-4 shrink-0">
            <Link
              to={isLoggedIn ? '/home' : '/login'}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#CDF178] bg-[#CDF178] px-2.5 font-heading text-[11px] font-semibold text-[#343133] transition-colors hover:border-[#9AAD3E] hover:bg-[#9AAD3E] min-[360px]:h-9 min-[360px]:px-4 min-[360px]:text-sm sm:h-10 sm:border-[#404F14] sm:bg-white sm:px-6 sm:text-[#404F14] sm:hover:border-[#404F14] sm:hover:bg-[#FDFCF7]"
            >
              {isLoggedIn ? <LayoutDashboard size={15} aria-hidden="true" /> : <LogIn size={15} aria-hidden="true" />}
              {isLoggedIn ? t('common.dashboard') : t('common.login')}
            </Link>
            {!isLoggedIn && (
              <Link
                to="/register"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#404F14] bg-transparent px-2.5 font-heading text-[11px] font-semibold text-[#404F14] transition-colors hover:bg-[#FDFCF7] min-[360px]:h-9 min-[360px]:px-4 min-[360px]:text-sm sm:h-10 sm:border-transparent sm:bg-[#CDF178] sm:px-6 sm:text-[#343133] sm:hover:bg-[#9AAD3E]"
              >
                <UserPlus size={15} aria-hidden="true" />
                {t('common.register')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavbarLanding