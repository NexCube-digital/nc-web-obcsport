import { useEffect, useRef, useState } from 'react'
import { ChevronDown, History, LogOut, Settings, ShoppingCart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import CartModal from '../ui/CartModal'
import MobileHeader from './MobileHeader'
import NotificationDropdown from './NotificationDropdown'

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
  userName?: string // TODO: ganti default ini dengan nama user dari auth context / API
  profileImage?: string
  showDesktopNavigation?: boolean
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
] as const

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
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#9AAD3E] font-heading font-semibold text-white ${className}`}
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}

function Navbar({
  userName = 'Budiman Santoso',
  profileImage,
  showDesktopNavigation = true,
}: NavbarDashboardProps) {
  const location = useLocation()

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

  const handleLogout = () => {
    // TODO: panggil endpoint logout / hapus token dari auth context
    setIsUserOpen(false)
  }

  return (
    <>
      {/* Header + bottom nav mobile (< md) dipisah ke MobileHeader.tsx */}
      <MobileHeader userName={userName} profileImage={profileImage} />

      <header className="hidden md:sticky md:top-0 md:z-50 md:block bg-white border-b border-[#D4D4D4] px-4 lg:px-6">
        <div
          className={`max-w-[1194px] mx-auto h-[84px] xl:h-[100px] grid items-center gap-3 ${
            showDesktopNavigation ? 'grid-cols-[auto_1fr_auto]' : 'grid-cols-[auto_1fr]'
          }`}
        >
          {/* Kiri: logo */}
          <div className="flex shrink-0 items-center">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-4 shrink-0">
              <img
                src={logo}
                alt="OBC Sport Center"
                className="w-11 h-11 xl:w-12 xl:h-12 rounded-full object-contain"
              />
              <span className="hidden xl:inline font-['Montserrat',sans-serif] font-bold text-xl text-[#343133] whitespace-nowrap">
                OBC Sport Center
              </span>
            </Link>
          </div>

          {/* Tengah: menu + keranjang, dipusatkan di ruang antara logo dan sisi kanan */}
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
                      className={`text-[13px] lg:text-sm font-heading whitespace-nowrap transition-colors ${
                        isActive
                          ? 'font-bold text-[#004000] underline underline-offset-4'
                          : 'font-normal text-[#343133] hover:text-[#004000]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}

          {/* Kanan: notifikasi, user, bahasa */}
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#404F14] transition-colors hover:bg-[#F1F4EA] hover:text-[#004000]"
              >
                <ShoppingCart size={19} strokeWidth={1.8} aria-hidden="true" />
              </button>
            )}

            {/* Info user + dropdown */}
            <div ref={userMenuRef} className="relative order-3">
              {/* Satu tombol: avatar + nama + chevron, supaya jelas bisa diklik */}
              <button
                ref={userTriggerRef}
                type="button"
                onClick={() => setIsUserOpen((open) => !open)}
                aria-label={`Menu pengguna, ${userName}`}
                aria-haspopup="menu"
                aria-expanded={isUserOpen}
                className={`flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000] ${
                  isUserOpen
                    ? 'border-[#9AAD3E] bg-[#F1F4EA]'
                    : 'border-[#E5E5E5] bg-white hover:border-[#9AAD3E] hover:bg-[#F1F4EA]'
                }`}
              >
                <Avatar name={userName} image={profileImage} />
                {/* Nama user disembunyikan di bawah lg agar muat */}
                <span className="hidden max-w-[160px] truncate text-sm font-heading font-semibold text-[#343133] lg:inline">
                  {userName}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className={`shrink-0 text-[#404F14] transition-transform duration-200 ${
                    isUserOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserOpen && (
                <div
                  role="menu"
                  aria-label="Menu pengguna"
                  className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                >
                  {/* Identitas akun */}
                  <div className="flex items-center gap-3 border-b border-[#EDEDED] bg-[#FDFCF7] px-4 py-3.5">
                    <Avatar name={userName} image={profileImage} className="h-10 w-10 text-base" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-heading font-semibold text-[#343133]">
                        {userName}
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
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-heading font-medium text-[#121212] transition-colors hover:bg-[#F1F4EA] hover:text-[#004000] focus-visible:bg-[#F1F4EA] focus-visible:outline-none"
                      >
                        <Icon size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
                        {label}
                      </Link>
                    ))}
                  </div>

                  {/* Keluar dipisah agar tidak tertekan tidak sengaja */}
                  <div className="border-t border-[#EDEDED] py-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-heading font-bold text-[#C41E1E] transition-colors hover:bg-[#FEF3F2] focus-visible:bg-[#FEF3F2] focus-visible:outline-none"
                    >
                      <LogOut size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pemilih bahasa */}
            <div ref={langMenuRef} className="relative order-2">
              <button
                type="button"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3 h-7 text-xs font-heading font-medium text-[#343133] hover:bg-[#FDFCF7] transition-colors"
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
                  className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isLangOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 mt-2 w-32 rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-md z-50"
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
          </div>
        </div>
      </header>

      {showDesktopNavigation && (
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </>
  )
}

export default Navbar