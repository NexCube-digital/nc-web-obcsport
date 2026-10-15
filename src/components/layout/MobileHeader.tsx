import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe, ShoppingCart, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import NotificationDropdown from './NotificationDropdown'

const CartModal = lazy(() => import('../ui/CartModal'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface BottomNavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
}

type MobileHeaderVariant = 'greeting' | 'title' | 'back'

interface MobileHeaderProps {
  variant?: MobileHeaderVariant
  userName?: string // TODO: ganti default ini dengan nama user dari auth context / API
  profileImage?: string
  title?: string // dipakai oleh variant 'title'
  backLabel?: string // dipakai oleh variant 'back'
  backTo?: string // jika diisi, tombol kembali menuju path ini; jika tidak, navigate(-1)
  onShare?: () => void // jika tidak diisi, memakai Web Share API bawaan browser
  showShare?: boolean // tampilkan tombol bagikan pada varian 'title'
  centerTitle?: boolean // posisikan judul di tengah header
  showBottomNav?: boolean // sembunyikan bottom nav di halaman detail bila perlu
}

interface LanguageOption {
  code: string
  label: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'IND', label: 'Indonesia' },
  { code: 'ENG', label: 'English' },
]

function getUserInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/* Atribut dasar untuk semua ikon SVG */
const iconProps: React.SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const ChevronLeftIcon = () => (
  <svg {...iconProps} width={20} height={20} strokeWidth={2}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg {...iconProps} strokeWidth={2}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const ShareIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3v12M8 7l4-4 4 4" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
)

const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/home',
    icon: (
      <svg {...iconProps}>
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
      </svg>
    ),
  },
  {
    id: 'sewa-event',
    label: 'Sewa Event',
    href: '/event',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </svg>
    ),
  },
  {
    id: 'membership',
    label: 'Membership',
    href: '/membership',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="9" r="6" />
        <path d="m8.5 14.5-1.5 7 5-3 5 3-1.5-7" />
      </svg>
    ),
  },
  {
    id: 'profil',
    label: 'Profil',
    href: '/profil-mobile',
    icon: <UserRound size={24} strokeWidth={1.8} aria-hidden="true" />,
  },
]

function MobileHeader({
  variant = 'greeting',
  userName = 'Budiman Santoso',
  profileImage,
  title = '',
  backLabel = 'Kembali',
  backTo,
  onShare,
  showShare = false,
  centerTitle = false,
  showBottomNav = true,
}: MobileHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeLanguage, setActiveLanguage] = useState(LANGUAGES[0])
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLanguageMenuOpen) return

    const handleOutsideClick = (event: PointerEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [isLanguageMenuOpen])

  const handleBack = () => {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }
    // Fallback: Web Share API, lalu salin link jika tidak didukung
    const shareData = { title: document.title, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url)
      }
    } catch {
      /* dibatalkan oleh user */
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 md:hidden bg-white border-b border-[#D4D4D4] px-4">
        {/* ===============================================================
            VARIAN 1: GREETING (sapaan di kiri, logo brand di kanan)
            =============================================================== */}
        {variant === 'greeting' && (
          <div className="flex h-[72px] items-center justify-between gap-2">
            <Link
              to="/pengaturan"
              aria-label={`Buka pengaturan profil ${userName}`}
              className="flex min-w-0 items-center gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000]"
            >
              <div
                role="img"
                aria-label={`Foto profil ${userName}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#404F14] font-heading text-xs font-bold text-white"
              >
                {profileImage ? (
                  <img src={profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden="true">{getUserInitials(userName)}</span>
                )}
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="text-[10px] font-heading font-normal text-[#6B6B6B] min-[360px]:text-xs">
                  Selamat Datang,
                </span>
                <span className="truncate text-sm font-heading font-semibold text-[#121212] min-[360px]:text-base">
                  {userName}
                </span>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <div className="relative" ref={languageMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLanguageMenuOpen((open) => !open)}
                  aria-label={`Bahasa ${activeLanguage.label}`}
                  aria-haspopup="listbox"
                  aria-expanded={isLanguageMenuOpen}
                  className="flex h-9 items-center gap-1 rounded-full px-1.5 text-[10px] font-heading font-semibold text-[#343133] transition-colors hover:bg-[#F1F4EA] min-[360px]:gap-1.5 min-[360px]:px-2 min-[360px]:text-xs"
                >
                  <Globe size={16} strokeWidth={1.8} />
                  <span>{activeLanguage.code}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isLanguageMenuOpen && (
                  <ul
                    role="listbox"
                    aria-label="Pilih bahasa"
                    className="absolute right-0 top-full z-50 mt-2 w-36 rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-lg"
                  >
                    {LANGUAGES.map((language) => (
                      <li key={language.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={language.code === activeLanguage.code}
                          onClick={() => {
                            setActiveLanguage(language)
                            setIsLanguageMenuOpen(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-heading hover:bg-[#FDFCF7] ${
                            language.code === activeLanguage.code
                              ? 'font-bold text-[#004000]'
                              : 'font-medium text-[#343133]'
                          }`}
                        >
                          {language.code} - {language.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Keranjang"
                aria-haspopup="dialog"
                aria-expanded={isCartOpen}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#404F14] transition-colors hover:bg-[#F1F4EA] hover:text-[#004000]"
              >
                <ShoppingCart size={19} strokeWidth={1.8} aria-hidden="true" />
              </button>

              <NotificationDropdown />
            </div>
          </div>
        )}

        {/* ===============================================================
            VARIAN 2: TITLE (chevron "<" + judul halaman)
            =============================================================== */}
        {variant === 'title' && (
          <div className="relative h-14 flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Kembali"
              className="-ml-1 p-1 text-[#004000] shrink-0"
            >
              <ChevronLeftIcon />
            </button>
            <h1
              className={`truncate text-base font-heading font-bold text-[#004000] ${
                centerTitle
                  ? 'absolute left-1/2 max-w-[70%] -translate-x-1/2 text-center'
                  : 'min-w-0 flex-1'
              }`}
            >
              {title}
            </h1>
            {showShare && (
              <button
                type="button"
                onClick={handleShare}
                aria-label="Bagikan"
                className="-mr-1 shrink-0 p-1 text-[#121212]"
              >
                <ShareIcon />
              </button>
            )}
          </div>
        )}

        {/* ===============================================================
            VARIAN 3: BACK (panah + "Kembali" di kiri, share di kanan)
            =============================================================== */}
        {variant === 'back' && (
          <div className="h-14 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              aria-label={backLabel}
              className="-ml-1 flex items-center gap-2 p-1 text-[#004000]"
            >
              <ArrowLeftIcon />
              <span className="text-base font-heading font-bold">{backLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Bagikan"
              className="-mr-1 p-1 text-[#121212]"
            >
              <ShareIcon />
            </button>
          </div>
        )}
      </header>

      {showBottomNav && (
        <nav
          aria-label="Navigasi utama"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E5E5] pb-[env(safe-area-inset-bottom)]"
        >
          <ul className="flex items-stretch justify-between px-2">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.id} className="flex-1">
                  <Link
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-heading transition-colors min-[400px]:text-[11px] ${
                      isActive
                        ? 'font-bold text-[#004000]'
                        : 'font-normal text-[#6B6B6B] hover:text-[#004000]'
                    }`}
                  >
                    {item.icon}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {isCartOpen && (
        <Suspense fallback={null}>
          <CartModal isOpen onClose={() => setIsCartOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default MobileHeader