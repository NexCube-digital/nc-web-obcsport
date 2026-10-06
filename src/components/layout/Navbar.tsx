import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import CartModal from '../ui/CartModal'
import MobileHeader from './MobileHeader'

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
  showDesktopNavigation?: boolean
}

/* -------------------------------------------------------------------------
   Data menu navbar & bahasa
   ------------------------------------------------------------------------- */
const NAV_LINKS: NavLink[] = [
  { id: 'beranda', label: 'Beranda', href: '/home' },
  { id: 'sewa-event', label: 'Sewa Event', href: '/event' },
  { id: 'membership', label: 'Membership', href: '/membership' },
  { id: 'riwayat', label: 'Riwayat', href: '/history' },
  { id: 'bantuan', label: 'Bantuan', href: '/bantuan' },
]

const LANGUAGES: Language[] = [
  { code: 'IND', label: 'Indonesia' },
  { code: 'ENG', label: 'English' },
]

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

function Navbar({
  userName = 'Budiman Santoso',
  showDesktopNavigation = true,
}: NavbarDashboardProps) {
  const location = useLocation()

  // State dropdown bahasa dan menu user
  const [activeLang, setActiveLang] = useState<Language>(LANGUAGES[0])
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

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
      <MobileHeader userName={userName} />

      
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

            {/* Ikon keranjang */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Keranjang"
              aria-haspopup="dialog"
              aria-expanded={isCartOpen}
              className="inline-flex shrink-0 ml-4 xl:ml-5 cursor-pointer text-[#404F14] hover:text-[#004000] transition-colors"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 9h20l-2 11H4L2 9z" />
                <path d="M7 9l3-6" />
                <path d="M17 9l-3-6" />
                <path d="M8 12v5M12 12v5M16 12v5" />
              </svg>
            </button>
            </div>
          )}

          {/* Kanan: notifikasi, user, bahasa */}
          <div
            className={`flex shrink-0 items-center gap-3 lg:gap-5 ${
              showDesktopNavigation ? '' : 'justify-self-end'
            }`}
          >
            {/* Ikon notifikasi */}
            <Link
              to="/notifikasi"
              aria-label="Notifikasi"
              className="text-[#404F14] hover:text-[#004000] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a6 6 0 0 0-6 6v4.5L4 16v1h16v-1l-2-3.5V8a6 6 0 0 0-6-6z" />
                <path d="M10 19a2 2 0 0 0 4 0h-4z" />
              </svg>
            </Link>

            {/* Info user + dropdown */}
            <div className="relative flex items-center gap-2 lg:gap-3">
              <button
                type="button"
                onClick={() => setIsUserOpen((prev) => !prev)}
                aria-label={`Menu pengguna, ${userName}`}
                aria-expanded={isUserOpen}
                className="flex items-center gap-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9AAD3E] text-sm font-heading font-semibold text-white">
                  {getInitials(userName)}
                </span>
                {/* Nama user disembunyikan di bawah lg agar muat */}
                <span className="hidden lg:inline text-sm font-heading font-semibold text-[#343133] whitespace-nowrap">
                  {userName}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsUserOpen((prev) => !prev)}
                aria-label="Menu pengguna"
                aria-expanded={isUserOpen}
                className="text-[#404F14] hover:text-[#004000] transition-colors"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m8 10 4 4 4-4" />
                </svg>
              </button>

              {isUserOpen && (
                <>
                  {/* Lapisan transparan: klik di luar kartu menutup dropdown */}
                  <button
                    type="button"
                    aria-label="Tutup menu pengguna"
                    tabIndex={-1}
                    onClick={() => setIsUserOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  {/* Kartu dropdown: menimpa area trigger, sesuai desain */}
                  <div
                    role="menu"
                    className="absolute -right-4 -top-[18px] z-50 w-[272px] overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                  >
                    {/* Header: avatar, nama, tombol tutup */}
                    <div className="flex items-center gap-3 px-4 py-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9AAD3E] text-base font-heading font-semibold text-white">
                        {getInitials(userName)}
                      </span>
                      <span className="flex-1 truncate text-sm font-heading font-semibold text-[#343133]">
                        {userName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsUserOpen(false)}
                        aria-label="Tutup menu pengguna"
                        aria-expanded={isUserOpen}
                        className="shrink-0 text-[#404F14] hover:text-[#004000] transition-colors"
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m8 10 4 4 4-4" />
                        </svg>
                      </button>
                    </div>

                    {/* Garis pemisah */}
                    <div className="border-t border-[#D4D4D4]" />

                    {/* Menu */}
                    <ul className="px-5 py-4 space-y-4">
                      <li>
                        <Link
                          to="/pengaturan"
                          role="menuitem"
                          onClick={() => setIsUserOpen(false)}
                          className="block text-sm font-heading font-normal text-[#121212] hover:text-[#004000]"
                        >
                          Pengaturan
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="block w-full text-left text-sm font-heading font-bold text-[#C41E1E] hover:opacity-80 cursor-pointer"
                        >
                          Keluar
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Pemilih bahasa */}
            <div ref={langMenuRef} className="relative">
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