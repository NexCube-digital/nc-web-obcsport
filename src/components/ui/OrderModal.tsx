import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
export type SportIconKey =
  | 'futsal'
  | 'badminton'
  | 'pickleball'
  | 'basket'
  | 'sepakbola'
  | 'tenismeja'
  | 'biliard'

export interface SportOption {
  id: string
  label: string
  icon: SportIconKey
}

export type FacilityIconKey = 'toilet' | 'led' | 'foodcourt' | 'mushola' | 'parkir'

export interface FacilityAmenity {
  id: string
  label: string
  icon: FacilityIconKey
}

export interface OrderModalFacility {
  id: string
  name: string
  image: string
  sports: SportOption[]
  /** Teks spesifikasi (setelah "Spesifikasi {name}:") */
  specification: string
  amenities: FacilityAmenity[]
}

interface OrderModalProps {
  facility: OrderModalFacility | null
  onClose: () => void
  /** Dipanggil saat tombol "Pesan Sekarang" ditekan */
  onOrder: (facilityId: string, sportId: string) => void
}

/* -------------------------------------------------------------------------
   Token warna (dari desain)
   ------------------------------------------------------------------------- */
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"
// #004000 Primary Green | #404F14 Secondary Green | #CDF178 Element
// #9AAD3E hover | #343133 Text Dark | #FDFCF7 background modal

/* Voli sudah dihapus. Filter ini berjaga-jaga bila data lama masih memuatnya.
   TODO: hapus juga entri voli dari sumber data fasilitas. */
const isVoli = (sport: SportOption): boolean =>
  sport.id === 'voli' || (sport.icon as string) === 'voli'

/* -------------------------------------------------------------------------
   Ikon (inline SVG, ikut warna teks via currentColor)
   ------------------------------------------------------------------------- */
const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function SportIcon({ name, size = 24 }: { name: SportIconKey; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', ...svgProps }
  switch (name) {
    case 'badminton':
      return (
        <svg {...common}>
          <path d="M9 3l1.5 5M15 3l-1.5 5M12 3v5M7.5 8h9L14 15h-4L7.5 8z" />
          <path d="M10 15v2h4v-2M10.5 17l.5 4h2l.5-4" />
        </svg>
      )
    case 'pickleball':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <ellipse cx="9.5" cy="9.5" rx="6.5" ry="6" transform="rotate(-40 9.5 9.5)" />
          <path d="M13 14l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="19" cy="5" r="2.2" />
        </svg>
      )
    case 'basket':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3v18M5.5 5.5c3 3 3 10 0 13M18.5 5.5c-3 3-3 10 0 13" />
        </svg>
      )
    case 'tenismeja':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="6" />
          <path d="M14.5 14.5L20 20" />
          <circle cx="19" cy="6" r="1.5" />
        </svg>
      )
    case 'biliard':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 8.5v7" />
        </svg>
      )
    case 'futsal':
    case 'sepakbola':
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4L12 8zM12 3v5M20 9.5l-4.5 1M17.5 19l-3.3-4.5M6.5 19l3.3-4.5M4 9.5l4.5 1" />
        </svg>
      )
  }
}

function AmenityIcon({ name }: { name: FacilityIconKey }) {
  const common = { width: 12, height: 12, viewBox: '0 0 24 24', ...svgProps, strokeWidth: 2 }
  switch (name) {
    case 'toilet':
      return (
        <svg {...common}>
          <path d="M5 4h8v8a4 4 0 01-8 0V4zM9 16v4M6 20h6M17 7h3M17 11h3M17 15h3" />
        </svg>
      )
    case 'led':
      return (
        <svg {...common}>
          <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />
        </svg>
      )
    case 'foodcourt':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M4 10l8-6 8 6v10H4V10zm6 3v7h4v-7h-4z" />
        </svg>
      )
    case 'mushola':
      return (
        <svg {...common}>
          <path d="M3 21h18M5 21V11l7-6 7 6v10M10 21v-5h4v5M12 5V2" />
        </svg>
      )
    case 'parkir':
    default:
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.5 5h3a3 3 0 010 6H11.5v4h-2V7h1zm1 2v2h1.5a1 1 0 000-2H11.5z" />
        </svg>
      )
  }
}

/* -------------------------------------------------------------------------
   Komponen
   -------------------------------------------------------------------------
   Perilaku ukuran:
   - Modal tingginya dibatasi layar (dvh). Hanya FOTO yang menyusut bila
     layar pendek (mis. 375x667), dan membesar bila layar lega (mis. 360x800).
   - Mobile (< sm): tombol cabang olahraga dibuat 2 kolom selebar layar
     (gaya tombol tetap sama), jarak dan ukuran teks sedikit dirapatkan.
   - >= sm: ukuran tombol dan jarak sama persis seperti desain awal.
   - Cadangan: bila isi tetap tidak muat (layar sangat pendek / teks
     spesifikasi panjang), modal bisa di-scroll dan header tetap menempel.
   ------------------------------------------------------------------------- */
function OrderModal({ facility, onClose, onOrder }: OrderModalProps): ReactNode {
  const [selectedSport, setSelectedSport] = useState<string>('')

  // Reset pilihan setiap kali fasilitas berganti
  useEffect(() => {
    if (facility) setSelectedSport(facility.sports.find((s) => !isVoli(s))?.id ?? '')
  }, [facility])

  // Tutup dengan Esc + kunci scroll halaman saat modal terbuka
  useEffect(() => {
    if (!facility) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [facility, onClose])

  if (!facility) return null

  const sports = facility.sports.filter((s) => !isVoli(s))

  return (
    <div
      className="fixed inset-0 z-50 flex h-dvh items-center justify-center overflow-hidden bg-[#343133]/40 p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Modal: md 960px, lg 1100px. Scroll hanya sebagai cadangan */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-[902px] flex-col overflow-y-auto overflow-x-hidden rounded-3xl bg-[#FDFCF7] shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:max-h-[calc(100dvh-32px)] md:max-w-[960px] lg:max-w-[1100px]"
      >
        {/* ================= Header ================= */}
        <header className="sticky top-0 z-10 flex shrink-0 items-center gap-2.5 bg-white px-4 py-3 sm:gap-3 sm:px-6 sm:pt-5 sm:pb-4 md:pt-4 md:pb-3 lg:px-8">
          <div
            className={`${FONT_MONTSERRAT} flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-obc-green text-xl font-bold leading-none text-white`}
            aria-hidden="true"
          >
            i
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="order-modal-title"
              className={`${FONT_MONTSERRAT} truncate text-lg font-semibold leading-5 text-black sm:text-xl`}
            >
              {facility.name}
            </h2>
            <p className="font-heading text-xs leading-4 text-black sm:text-sm">
              Pilih kategori olahraga yang Anda mau
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#D4D4D4] bg-white text-obc-charcoal transition-colors hover:border-[#9AAD3E] hover:bg-[#F1F4EA] hover:text-obc-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obc-olive"
          >
            <X size={19} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </header>

        {/* ================= Foto =================
            Tinggi ideal mengikuti layar (clamp) dan menyusut lebih dulu
            sebelum bagian lain, sampai batas min-h. */}
        <div className="relative h-[clamp(180px,34dvh,420px)] min-h-[96px] shrink overflow-hidden md:h-[clamp(220px,52dvh,560px)] md:min-h-[150px]">
          <img
            src={facility.image}
            alt={facility.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* ================= Isi ================= */}
        <div className="shrink-0 px-5 pb-4 pt-3 sm:px-12 sm:pb-6 sm:pt-5 md:pb-5 md:pt-5 lg:px-14">
          <h3 className="font-heading text-base text-black">Pilih Cabang Olahraga</h3>

          {/* Pilihan cabang olahraga: 2 kolom di mobile, ukuran asli di >= sm */}
          <div
            className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:flex sm:flex-wrap sm:gap-2.5"
            role="radiogroup"
            aria-label="Cabang olahraga"
          >
            {sports.map((sport) => {
              const active = sport.id === selectedSport
              return (
                <button
                  key={sport.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`flex h-10 w-full min-w-0 cursor-pointer items-center justify-center gap-3 rounded-xl bg-white font-heading text-sm text-[#343133] transition-shadow sm:h-[42px] sm:w-[156px] sm:gap-4 ${
                    active
                      ? 'border border-[#004000]'
                      : 'border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.18)]'
                  }`}
                >
                  <SportIcon name={sport.icon} size={22} />
                  <span className="min-w-[60px] text-left">{sport.label}</span>
                </button>
              )
            })}
          </div>

          {/* Spesifikasi */}
          <div className="mt-3 rounded-xl border border-dashed border-[#343133] px-3 py-2.5 sm:mt-4 sm:px-8 sm:py-4">
            <p className="font-heading text-xs leading-[18px] text-black sm:text-sm sm:leading-[21px]">
              <strong className="font-semibold">Spesifikasi {facility.name}</strong>:{' '}
              {facility.specification}
            </p>
          </div>

          {/* Fasilitas */}
          <h4 className={`${FONT_MONTSERRAT} mt-3 text-xs font-bold text-[#265021] sm:mt-4`}>
            Fasilitas Lapangan
          </h4>
          <ul className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
            {facility.amenities.map((item) => (
              <li
                key={item.id}
                className="flex h-5 items-center gap-1.5 rounded-full border border-[#D4D4D4] bg-white px-2 font-heading text-[10px] text-[#343133]"
              >
                <span className="text-[#265021]">
                  <AmenityIcon name={item.icon} />
                </span>
                {item.label}
              </li>
            ))}
          </ul>

          {/* Tombol pesan */}
          <button
            type="button"
            onClick={() => onOrder(facility.id, selectedSport)}
            disabled={!selectedSport}
            className="mx-auto mt-4 block h-10 w-full max-w-[370px] cursor-pointer rounded-md bg-[#CDF178] font-heading text-xs text-[#343133] transition-colors hover:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-5"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderModal