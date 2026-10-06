import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'

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
  title?: string // dipakai oleh variant 'title'
  backLabel?: string // dipakai oleh variant 'back'
  backTo?: string // jika diisi, tombol kembali menuju path ini; jika tidak, navigate(-1)
  onShare?: () => void // jika tidak diisi, memakai Web Share API bawaan browser
  showShare?: boolean // tampilkan tombol bagikan pada varian 'title'
  centerTitle?: boolean // posisikan judul di tengah header
  showBottomNav?: boolean // sembunyikan bottom nav di halaman detail bila perlu
}

/* -------------------------------------------------------------------------
   Ikon
   ------------------------------------------------------------------------- */
const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
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
    id: 'riwayat',
    label: 'Riwayat',
    href: '/history',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    id: 'bantuan',
    label: 'Help/QnA',
    href: '/bantuan',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
]

function MobileHeader({
  variant = 'greeting',
  userName = 'Budiman Santoso',
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
          <div className="h-[72px] flex items-center justify-between">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs font-heading font-normal text-[#6B6B6B]">
                Selamat Datang,
              </span>
              <span className="text-base font-heading font-semibold text-[#121212] truncate">
                {userName}
              </span>
            </div>

            <Link to="/home" className="flex items-center gap-2 shrink-0 ml-3">
              <img
                src={logo}
                alt="OBC Sport Center"
                className="w-10 h-10 rounded-full object-contain"
              />
              <span className="flex flex-col leading-tight font-['Montserrat',sans-serif] italic text-[#343133]">
                <span className="text-xs font-extrabold uppercase">OBC Sport</span>
                <span className="text-xs font-normal">Center</span>
              </span>
            </Link>
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
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-heading transition-colors ${
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
    </>
  )
}

export default MobileHeader