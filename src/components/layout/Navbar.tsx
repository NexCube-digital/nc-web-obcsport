import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import CartModal from '../ui/CartModal'

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

function Navbar({ userName = 'Budiman Santoso' }: NavbarDashboardProps) {
  const location = useLocation()

  // State dropdown bahasa dan menu user
  const [activeLang, setActiveLang] = useState<Language>(LANGUAGES[0])
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

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
    <header className="bg-white border-b border-[#D4D4D4] px-6">
      <div className="max-w-[1194px] mx-auto h-[100px] flex items-center justify-between">
        {/* Kiri: logo, menu, keranjang */}
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-4 shrink-0">
            <img
              src={logo}
              alt="OBC Sport Center"
              className="w-12 h-12 rounded-full object-contain"
            />
            {/* Catatan: font brand di desain terlihat seperti Montserrat, pastikan sudah di-load */}
            <span className="font-['Montserrat',sans-serif] font-bold text-xl text-[#343133] whitespace-nowrap">
              OBC Sport Center
            </span>
          </Link>

          {/* Menu */}
          <nav className="hidden md:flex items-center gap-8 ml-5">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.id}
                  to={link.href}
                  className={`text-sm font-heading whitespace-nowrap transition-colors ${
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
            className="hidden md:inline-flex ml-5 cursor-pointer text-[#404F14] hover:text-[#004000] transition-colors"
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

        {/* Kanan: notifikasi, user, bahasa */}
        <div className="flex items-center gap-5">
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
          <div className="relative flex items-center gap-3">
            <Link to="/home" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9AAD3E] text-sm font-heading font-semibold text-white">
                {getInitials(userName)}
              </span>
              <span className="text-sm font-heading font-semibold text-[#343133] whitespace-nowrap">
                {userName}
              </span>
            </Link>

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
              <ul className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-md z-50">
                <li>
                  <Link
                    to="/pengaturan"
                    onClick={() => setIsUserOpen(false)}
                    className="block px-3 py-2 text-xs font-heading font-medium text-[#343133] hover:bg-[#FDFCF7]"
                  >
                    Pengaturan
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-heading font-medium text-[#343133] hover:bg-[#FDFCF7]"
                  >
                    Keluar
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Pemilih bahasa */}
          <div className="relative">
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
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}

export default Navbar