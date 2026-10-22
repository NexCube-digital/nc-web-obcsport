import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ChevronDown, CircleHelp, History, LogOut, Settings, ShoppingCart } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAuth } from '../../hooks/useAuth'
import { logoutCustomer } from '../../services/authService'
import { getImageUrl } from '../../utils/imageUrl'
import NotificationDropdown from './NotificationDropdown'

const CartModal = lazy(() => import('../ui/CartModal'))
const MobileHeader = lazy(() => import('./MobileHeader'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface NavLink {
  id: string
  label: string
  href: string
}

interface Language {
  code: string
  label: string
}

interface NavbarDashboardProps {
  userName?: string
  profileImage?: string
  showDesktopNavigation?: boolean
  showMobileHeader?: boolean
}

/* -------------------------------------------------------------------------
   Data menu navbar & bahasa
   ------------------------------------------------------------------------- */
const NAV_LINKS: NavLink[] = [
  { id: 'beranda', label: 'Beranda', href: '/home' },
  { id: 'sewa-event', label: 'Sewa Event', href: '/event' },
  { id: 'membership', label: 'Membership', href: '/membership' },
]

const LANGUAGES: Language[] = [
  { code: 'IND', label: 'Indonesia' },
  { code: 'ENG', label: 'English' },
]

/* Menu dropdown profil */
const USER_MENU_ITEMS = [
  { id: 'pengaturan', label: 'Pengaturan', href: '/pengaturan', icon: Settings },
  { id: 'riwayat', label: 'Riwayat Transaksi', href: '/history', icon: History },
  { id: 'bantuan', label: 'Bantuan', href: '/bantuan', icon: CircleHelp },
] as const


const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'
const dropdownBase = `transition-[opacity,transform,visibility] duration-200 ${EASE} motion-reduce:transition-none`
const dropdownOpen = 'visible opacity-100 scale-100 translate-y-0'
const dropdownClosed = 'invisible opacity-0 scale-95 -translate-y-1 pointer-events-none'

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

/* Avatar dipakai di tombol profil dan di header dropdown */
function Avatar({
  name,
  image,
  className = 'h-9 w-9 text-sm',
}: {
  name: string
  image?: string
  className?: string
}) {
  const imageUrl = image ? getImageUrl(image) : null
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#9AAD3E] font-heading font-semibold text-white ${className}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}

function Navbar({
  userName,
  profileImage,
  showDesktopNavigation = true,
  showMobileHeader = true,
}: NavbarDashboardProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const displayName = user?.name ?? userName ?? 'Akun OBC'
  const displayImage = profileImage ?? user?.avatarUrl

  // State dropdown bahasa dan menu user
  const [activeLang, setActiveLang] = useState<Language>(LANGUAGES[0])
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userTriggerRef = useRef<HTMLButtonElement>(null)

  /* Tutup dropdown bahasa saat klik di luar */
  useEffect(() => {
    if (!isLangOpen) return

    const handleOutsideClick = (event: PointerEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [isLangOpen])

  /* Tutup dropdown profil saat klik di luar atau tekan Escape */
  useEffect(() => {
    if (!isUserOpen) return

    const handleOutsideClick = (event: PointerEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserOpen(false)
        userTriggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isUserOpen])

  /* Tutup dropdown profil setiap pindah halaman */
  useEffect(() => {
    setIsUserOpen(false)
  }, [location.pathname])

  const handleSelectLang = (lang: Language) => {
    // Catatan: sambungkan ke i18n / context bahasa jika sudah tersedia
    setActiveLang(lang)
    setIsLangOpen(false)
  }

  const handleLogout = async () => {
    setIsUserOpen(false)
    try {
      await logoutCustomer()
    } catch {
      // Local credentials are cleared even when the API is unavailable.
    }
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Header + bottom nav mobile (< md) dipisah ke MobileHeader.tsx */}
      {isMobile && showMobileHeader && (
        <Suspense fallback={null}>
          <MobileHeader userName={displayName} profileImage={displayImage} />
        </Suspense>
      )}

      {!isMobile && (
      <header className="sticky top-0 z-50 bg-white border-b border-[#D4D4D4] px-4 lg:px-6">
        <div
          className={`max-w-[1194px] mx-auto h-[84px] xl:h-[100px] grid items-center gap-3 ${
            showDesktopNavigation ? 'grid-cols-[auto_1fr_auto]' : 'grid-cols-[auto_1fr]'
          }`}
        >
          {/* Kiri: logo */}
          <div className="flex shrink-0 items-center">
            {/* Logo: sedikit membesar saat hover, group agar teks ikut berubah warna */}
            <Link to="/home" className="group flex items-center gap-4 shrink-0">
              <img
                src={logo}
                alt="OBC Sport Center"
                className={`w-11 h-11 xl:w-12 xl:h-12 rounded-full object-contain transition-transform duration-300 ${EASE} group-hover:scale-105 group-active:scale-95 motion-reduce:transition-none`}
              />
              <span
                className={`hidden xl:inline font-['Montserrat',sans-serif] font-bold text-xl text-[#343133] whitespace-nowrap transition-colors duration-200 group-hover:text-[#004000] motion-reduce:transition-none`}
              >
                OBC Sport Center
              </span>
            </Link>
          </div>

          {/* Tengah: menu, dipusatkan di ruang antara logo dan sisi kanan */}
          {showDesktopNavigation && (
            <div className="flex min-w-0 items-center justify-center">
              {/* Menu */}
              <nav className="flex items-center gap-4 lg:gap-6 xl:gap-8">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.href
                  return (
                    <Link
                      key={link.id}
                      to={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      /* Garis bawah dibuat dengan ::after dan dianimasikan lewat scale-x,
                         sehingga "menggambar" dari kiri ke kanan (bukan muncul tiba-tiba) */
                      className={`relative py-1 text-[13px] lg:text-sm font-heading whitespace-nowrap transition-colors duration-200 motion-reduce:transition-none
                        after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-[#004000]
                        after:transition-transform after:duration-300 ${EASE} motion-reduce:after:transition-none
                        hover:after:scale-x-100 focus-visible:after:scale-x-100 focus-visible:outline-none ${
                          isActive
                            ? 'font-bold text-[#004000] after:scale-x-100'
                            : 'font-normal text-[#343133] hover:text-[#004000] after:scale-x-0'
                        }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}

          {/* Kanan: notifikasi, keranjang, user, bahasa */}
          <div
            className={`flex shrink-0 items-center gap-3 lg:gap-5 ${
              showDesktopNavigation ? '' : 'justify-self-end'
            }`}
          >
            {/* Ikon notifikasi */}
            <NotificationDropdown />

            {showDesktopNavigation && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Keranjang"
                aria-haspopup="dialog"
                aria-expanded={isCartOpen}
                className={`group flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#404F14] transition-[background-color,color,transform] duration-200 ${EASE} hover:bg-[#F1F4EA] hover:text-[#004000] active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000] motion-reduce:transition-none`}
              >
                {/* Ikon bergerak tipis ke atas saat hover */}
                <ShoppingCart
                  size={19}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${EASE} group-hover:-translate-y-px group-hover:scale-110 motion-reduce:transition-none`}
                />
              </button>
            )}

            {/* Info user + dropdown */}
            <div ref={userMenuRef} className="relative order-3">
              {/* Satu tombol: avatar + nama + chevron, supaya jelas bisa diklik */}
              <button
                ref={userTriggerRef}
                type="button"
                onClick={() => setIsUserOpen((open) => !open)}
                aria-label={`Menu pengguna, ${displayName}`}
                aria-haspopup="menu"
                aria-expanded={isUserOpen}
                className={`group flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-3 transition-[background-color,border-color,box-shadow,transform] duration-200 ${EASE} active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000] motion-reduce:transition-none ${
                  isUserOpen
                    ? 'border-[#9AAD3E] bg-[#F1F4EA] shadow-sm'
                    : 'border-[#E5E5E5] bg-white hover:border-[#9AAD3E] hover:bg-[#F1F4EA] hover:shadow-sm'
                }`}
              >
                <Avatar
                  name={displayName}
                  image={displayImage}
                  className={`h-9 w-9 text-sm transition-transform duration-200 ${EASE} group-hover:scale-105 motion-reduce:transition-none`}
                />
                {/* Nama user disembunyikan di bawah lg agar muat */}
                <span className="hidden max-w-[160px] truncate text-sm font-heading font-semibold text-[#343133] lg:inline">
                  {displayName}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className={`shrink-0 text-[#404F14] transition-transform duration-300 ${EASE} motion-reduce:transition-none ${
                    isUserOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                />
              </button>

              {/* Dropdown selalu ter-render agar bisa dianimasikan masuk & keluar */}
              <div
                role="menu"
                aria-label="Menu pengguna"
                aria-hidden={!isUserOpen}
                className={`absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${dropdownBase} ${
                  isUserOpen ? dropdownOpen : dropdownClosed
                }`}
              >
                {/* Identitas akun */}
                <div className="flex items-center gap-3 border-b border-[#EDEDED] bg-[#FDFCF7] px-4 py-3.5">
                  <Avatar name={displayName} image={displayImage} className="h-10 w-10 text-base" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-heading font-semibold text-[#343133]">
                      {displayName}
                    </p>
                    <p className="text-xs font-heading text-[#6B6B6B]">Akun saya</p>
                  </div>
                </div>

                {/* Pengaturan & Riwayat */}
                <div className="py-1.5">
                  {USER_MENU_ITEMS.map(({ id, label, href, icon: Icon }) => (
                    <Link
                      key={id}
                      to={href}
                      role="menuitem"
                      tabIndex={isUserOpen ? 0 : -1}
                      onClick={() => setIsUserOpen(false)}
                      className="group flex items-center gap-3 px-4 py-2.5 text-sm font-heading font-medium text-[#121212] transition-[background-color,color,padding] duration-200 hover:bg-[#F1F4EA] hover:pl-5 hover:text-[#004000] focus-visible:bg-[#F1F4EA] focus-visible:outline-none motion-reduce:transition-none"
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className={`shrink-0 transition-transform duration-200 ${EASE} group-hover:scale-110 motion-reduce:transition-none`}
                      />
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Keluar dipisah agar tidak tertekan tidak sengaja */}
                <div className="border-t border-[#EDEDED] py-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={isUserOpen ? 0 : -1}
                    onClick={handleLogout}
                    className="group flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-heading font-bold text-[#C41E1E] transition-[background-color,padding] duration-200 hover:bg-[#FEF3F2] hover:pl-5 focus-visible:bg-[#FEF3F2] focus-visible:outline-none motion-reduce:transition-none"
                  >
                    <LogOut
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className={`shrink-0 transition-transform duration-200 ${EASE} group-hover:translate-x-0.5 motion-reduce:transition-none`}
                    />
                    Keluar
                  </button>
                </div>
              </div>
            </div>

            {/* Pemilih bahasa */}
            <div ref={langMenuRef} className="relative order-2">
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className={`group inline-flex h-7 items-center gap-1.5 rounded-full border bg-white px-3 text-xs font-heading font-medium text-[#343133] transition-[background-color,border-color,transform] duration-200 ${EASE} hover:border-[#9AAD3E] hover:bg-[#F1F4EA] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000] motion-reduce:transition-none ${
                  isLangOpen ? 'border-[#9AAD3E] bg-[#F1F4EA]' : 'border-[#E5E5E5]'
                }`}
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#121212"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`transition-transform duration-500 ${EASE} group-hover:rotate-[20deg] motion-reduce:transition-none`}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{activeLang.code}</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#343133"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-300 ${EASE} motion-reduce:transition-none ${
                    isLangOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown bahasa: selalu ter-render, dianimasikan fade + scale */}
              <ul
                role="listbox"
                aria-hidden={!isLangOpen}
                className={`absolute right-0 z-50 mt-2 w-32 origin-top-right rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-md ${dropdownBase} ${
                  isLangOpen ? dropdownOpen : dropdownClosed
                }`}
              >
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      type="button"
                      tabIndex={isLangOpen ? 0 : -1}
                      onClick={() => handleSelectLang(lang)}
                      className={`w-full px-3 py-2 text-left text-xs font-heading transition-[background-color,padding] duration-200 hover:bg-[#F1F4EA] hover:pl-4 focus-visible:bg-[#F1F4EA] focus-visible:outline-none motion-reduce:transition-none ${
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
            </div>
          </div>
        </div>
      </header>
      )}

      {isCartOpen && (
        <Suspense fallback={null}>
          <CartModal isOpen onClose={() => setIsCartOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default Navbar