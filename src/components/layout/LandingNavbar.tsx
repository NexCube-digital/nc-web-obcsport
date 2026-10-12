import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'

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
  // State bahasa aktif dan dropdown
  const [activeLang, setActiveLang] = useState<Language>(LANGUAGES[0])
  const [isLangOpen, setIsLangOpen] = useState(false)

  const handleSelectLang = (lang: Language) => {
    // Catatan: sambungkan ke i18n / context bahasa jika sudah tersedia
    setActiveLang(lang)
    setIsLangOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#D4D4D4] bg-white">
      {/* Selalu satu baris: logo | bahasa | tombol. Ukuran mengecil bertahap di layar kecil */}
      <div className="max-w-[1200px] mx-auto px-2 min-[360px]:px-4 sm:px-6 h-16 min-[360px]:h-20 sm:h-[100px] flex items-center justify-between gap-1.5 min-[360px]:gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 min-[360px]:gap-3 sm:gap-4 min-w-0"
        >
          <img
            src={logo}
            alt="OBC Sport Center"
            className="w-7 h-7 min-[360px]:w-10 min-[360px]:h-10 sm:w-12 sm:h-12 shrink-0 rounded-full object-contain"
          />
          <span className="hidden min-[340px]:block font-heading font-semibold text-xs min-[400px]:text-base sm:text-xl leading-tight text-[#343133]">
            OBC Sport Center
          </span>
        </Link>

        <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-4 shrink-0">
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

          {/* Tombol Masuk dan Daftar */}
          <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-4 shrink-0">
            <Link
              to="/login"
              className="rounded-lg border border-[#404F14] bg-white px-2.5 min-[360px]:px-4 sm:px-6 h-8 min-[360px]:h-9 sm:h-10 inline-flex items-center text-[11px] min-[360px]:text-sm font-heading font-semibold text-[#404F14] hover:bg-[#FDFCF7] transition-colors"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#CDF178] px-2.5 min-[360px]:px-4 sm:px-6 h-8 min-[360px]:h-9 sm:h-10 inline-flex items-center text-[11px] min-[360px]:text-sm font-heading font-semibold text-[#343133] hover:bg-[#9AAD3E] transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavbarLanding