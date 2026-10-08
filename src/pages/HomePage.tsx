import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import OrderModal, { type OrderModalFacility } from '../components/ui/OrderModal'
import lapangF1 from '../assets/layanan/Lapang F1.png'
import lapangF2 from '../assets/layanan/Lapang F2.png'
import futsalF2 from '../assets/layanan/Futsal F2.png'
import mejaBilliard from '../assets/layanan/Meja Billiard.png'
import promoSport from '../assets/promo/Famplet_OBC_SPORT.jpeg'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface PromoItem {
  id: string
  image: string
  title: string
  description: string
}

interface FacilityCard {
  id: string
  name: string
  description: string
  badge: string
  buttonLabel: string
  image: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/facilityService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// TODO: ganti dengan data pengumuman dari API
const ANNOUNCEMENT = 'Lapangan 1 booked for Inter-school Futsal Tournament on Sept 28'

// Font heading di desain terlihat seperti Montserrat, pastikan sudah di-load
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const PROMOS: PromoItem[] = [
  {
    id: 'promo-1',
    image: promoSport,
    title: 'Registrasi Liga Badminton',
    description: 'Pendaftaran tim dibuka s/d akhir Maret',
  },
  {
    id: 'promo-2',
    image: promoSport,
    title: 'Registrasi Liga Badminton',
    description: 'Pendaftaran tim dibuka s/d akhir Maret',
  },
  {
    id: 'promo-3',
    image: promoSport,
    title: 'Registrasi Liga Badminton',
    description: 'Pendaftaran tim dibuka s/d akhir Maret',
  },
]

const FACILITIES: FacilityCard[] = [
  {
    id: 'lapangan-f1',
    name: 'Lapangan F1',
    description: 'Futsal 1, Badminton, Voli, Pickleball',
    badge: 'TERSEDIA',
    buttonLabel: 'Booking Sekarang',
    image: lapangF1,
  },
  {
    id: 'lapangan-f2',
    name: 'Lapangan F2',
    description: 'Futsal 2, Basket',
    badge: 'TERSEDIA',
    buttonLabel: 'Booking Sekarang',
    image: lapangF2,
  },
  {
    id: 'lapang-sepak-bola',
    name: 'Lapang Sepak Bola',
    description: 'Sepak Bola',
    badge: 'TERSEDIA',
    buttonLabel: 'Booking Sekarang',
    // TODO: belum ada aset foto lapang sepak bola, sementara pakai futsalF2
    image: futsalF2,
  },
  {
    id: 'ruang-tenis-meja',
    name: 'Ruang Tenis Meja',
    description: 'Tenis Meja',
    badge: 'TERSEDIA',
    buttonLabel: 'Booking Sekarang',
    // TODO: belum ada aset foto ruang tenis meja, sementara pakai futsalF2
    image: futsalF2,
  },
  {
    id: 'ruang-biliard',
    name: 'Ruang Biliard',
    description: 'Biliard',
    badge: 'TERSEDIA',
    buttonLabel: 'Booking Sekarang',
    image: mejaBilliard,
  },
]

// Fasilitas pendukung yang tampil di modal
const AMENITIES = [
  { id: 'toilet', label: 'Toilet T3-T5', icon: 'toilet' },
  { id: 'led', label: 'LED Light', icon: 'led' },
  { id: 'foodcourt', label: 'Foodcourt', icon: 'foodcourt' },
  { id: 'mushola', label: 'Mushola', icon: 'mushola' },
  { id: 'parkir', label: 'Parkir', icon: 'parkir' },
] as const

// TODO: ganti dengan data detail dari API
const MODAL_DETAIL: Record<string, Omit<OrderModalFacility, 'id' | 'name' | 'image'>> = {
  'lapangan-f1': {
    sports: [
      { id: 'futsal-1', label: 'Futsal 1', icon: 'futsal' },
      { id: 'badminton', label: 'Badminton', icon: 'badminton' },
      { id: 'voli', label: 'Voli', icon: 'voli' },
      { id: 'pickleball', label: 'Pickleball', icon: 'pickleball' },
    ],
    specification:
      'Lantai interlock standar turnamen internasional, pencahayaan LED anti-silau, tribun penonton, serta akses ruang ganti eksklusif.',
    amenities: [...AMENITIES],
  },
  'lapangan-f2': {
    sports: [
      { id: 'futsal-2', label: 'Futsal 2', icon: 'futsal' },
      { id: 'basket', label: 'Basket', icon: 'basket' },
    ],
    specification:
      'Lantai interlock standar turnamen, pencahayaan LED anti-silau, dan akses ruang ganti.',
    amenities: [...AMENITIES],
  },
  'lapang-sepak-bola': {
    sports: [{ id: 'sepak-bola', label: 'Sepak Bola', icon: 'sepakbola' }],
    specification: 'Lapangan sepak bola dengan pencahayaan malam dan akses ruang ganti.',
    amenities: [...AMENITIES],
  },
  'ruang-tenis-meja': {
    sports: [{ id: 'tenis-meja', label: 'Tenis Meja', icon: 'tenismeja' }],
    specification: 'Ruang tenis meja dalam ruangan dengan meja standar turnamen.',
    amenities: [...AMENITIES],
  },
  'ruang-biliard': {
    sports: [{ id: 'biliard', label: 'Biliard', icon: 'biliard' }],
    specification: 'Meja biliard standar dengan pencahayaan khusus dan area santai.',
    amenities: [...AMENITIES],
  },
}

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFacility, setSelectedFacility] = useState<FacilityCard | null>(null)
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!previewImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewImage(null)
    }
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      setIsImageZoomed(false)
    }
  }, [previewImage])

  const handleSearch = () => {
    // TODO: sambungkan ke halaman/endpoint pencarian sebenarnya
    navigate(`/cari?q=${encodeURIComponent(searchQuery)}`)
  }

  const modalFacility: OrderModalFacility | null = selectedFacility
    ? {
        id: selectedFacility.id,
        name: selectedFacility.name,
        image: selectedFacility.image,
        ...MODAL_DETAIL[selectedFacility.id],
      }
    : null

  return (
    // overflow-x-hidden: pengaman terakhir agar tidak pernah ada scroll horizontal
    <div className="min-h-screen overflow-x-hidden bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain; padding mengecil di layar kecil */}
      <main className="max-w-[1248px] mx-auto px-3 min-[360px]:px-4 sm:px-6 pt-4 sm:pt-6 pb-10 sm:pb-16">
        {/* ================= Hero sapaan + pencarian ================= */}
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#265021] to-[#404F14] px-4 sm:px-6 py-5 md:py-0 md:min-h-[180px] flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <div className="min-w-0">
            <h1
              className={`${FONT_MONTSERRAT} font-bold text-xl min-[360px]:text-2xl sm:text-[28px] leading-tight sm:leading-9 text-white break-words`}
            >
              Halo, {USER_NAME}! 👋
            </h1>
            <p className="mt-1 text-xs min-[360px]:text-sm leading-relaxed text-white max-w-[540px] font-heading">
              Temukan lapangan favoritmu dan mulai berolahraga hari ini. Pilih tanggal
              &amp; jam main untuk memulai booking.
            </p>
          </div>

          {/* < 300px: input & tombol bertumpuk, >= 300px: sebaris */}
          <div className="flex flex-col min-[300px]:flex-row items-stretch min-[300px]:items-center gap-2 sm:gap-3 w-full md:w-auto md:shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari lapangan olahraga..."
              className="w-full min-w-0 min-[300px]:flex-1 md:flex-none md:w-[300px] h-11 sm:h-[46px] rounded-lg border border-[#D4D4D4] bg-white px-3 text-sm font-heading text-[#343133] placeholder:text-[#6F6B6E] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="w-full min-[300px]:w-[64px] sm:w-[78px] shrink-0 h-11 sm:h-[46px] rounded-lg bg-[#CDF178] text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              Cari
            </button>
          </div>
        </section>

        {/* ================= Informasi cepat ================= */}
        <section className="mt-4 sm:mt-6 rounded-2xl sm:rounded-3xl border border-[#D4D4D4] bg-white p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <h2
            className={`${FONT_MONTSERRAT} font-bold text-xl min-[360px]:text-2xl sm:text-[28px] leading-tight sm:leading-9 text-[#404F14] break-words`}
          >
            INFORMASI CEPAT
          </h2>
          <p className="mt-1 text-xs min-[360px]:text-sm leading-relaxed text-[#343133] max-w-[540px] font-heading">
            Temukan lapangan favoritmu dan mulai berolahraga hari ini. Pilih tanggal
            &amp; jam main untuk memulai booking.
          </p>

          {/* Banner pengumuman: tinggi mengikuti isi agar teks bisa turun baris */}
          <div className="mt-4 sm:mt-5 min-h-11 py-2 flex items-start sm:items-center gap-2 sm:gap-3 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C00000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 mt-px sm:mt-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span className="min-w-0 text-xs sm:text-[13px] leading-snug font-heading font-medium text-[#C00000] break-words">
              {ANNOUNCEMENT}
            </span>
          </div>
        </section>

        {/* ================= Promosi & Event Terbaru ================= */}
        <section className="mt-4 sm:mt-6">
          <h2
            className={`${FONT_MONTSERRAT} font-bold text-base min-[360px]:text-lg sm:text-xl text-[#265021]`}
          >
            Promosi &amp; Event Terbaru
          </h2>
          {/* < md: geser samping (carousel), >= md: grid 3 kolom */}
          <div className="mt-3 flex gap-3 overflow-x-auto pt-1 pb-3 snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-3 px-3 scroll-px-3 min-[360px]:-mx-4 min-[360px]:px-4 min-[360px]:scroll-px-4 sm:-mx-6 sm:px-6 sm:scroll-px-6 md:mx-0 md:px-0 md:scroll-px-0 md:grid md:grid-cols-3 md:gap-[13px] md:overflow-visible md:pb-0">
            {PROMOS.map((promo) => (
              <div
                key={promo.id}
                className="w-[min(260px,88%)] min-w-[210px] shrink-0 snap-start md:w-auto md:min-w-0 flex items-center gap-2 min-[360px]:gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-2.5 sm:p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <button
                  type="button"
                  onClick={() => setPreviewImage({ src: promo.image, alt: promo.title })}
                  aria-label={`Perbesar gambar ${promo.title}`}
                  className="h-[88px] w-14 min-[360px]:h-[110px] min-[360px]:w-[72px] shrink-0 cursor-zoom-in overflow-hidden rounded-lg"
                >
                  <img src={promo.image} alt="" className="h-full w-full object-cover" />
                </button>
                <div className="min-w-0">
                  <span className="inline-block rounded bg-[#E6F0E0] px-2 py-1 text-[10px] leading-none font-heading font-bold text-[#404F14]">
                    PROMO SPESIAL
                  </span>
                  <h3
                    className={`mt-1 ${FONT_MONTSERRAT} font-semibold text-[13px] min-[360px]:text-sm leading-snug text-[#265021] break-words`}
                  >
                    {promo.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-heading text-[#343133] break-words">
                    {promo.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= Ketersediaan lapangan premium ================= */}
        <section className="mt-4 sm:mt-6">
          <h2
            className={`${FONT_MONTSERRAT} font-bold text-base min-[360px]:text-lg sm:text-xl text-[#265021] pb-2 border-b border-[#D4D4D4]`}
          >
            Ketersediaan Lapangan Premium
          </h2>

          {/* Kartu fasilitas: < 300px 1 kolom, 300-639px grid 2 kolom, >= sm wrap 285px jarak 16px */}
          <div className="mt-3 grid grid-cols-1 min-[300px]:grid-cols-2 gap-2 min-[360px]:gap-3 sm:flex sm:flex-wrap sm:gap-4">
            {FACILITIES.map((facility) => (
              <div
                key={facility.id}
                className="flex flex-col min-w-0 w-full sm:w-[285px] rounded-2xl bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
              >
                <button
                  type="button"
                  onClick={() => setPreviewImage({ src: facility.image, alt: facility.name })}
                  aria-label={`Perbesar gambar ${facility.name}`}
                  className="block h-16 min-[360px]:h-20 w-full cursor-zoom-in overflow-hidden"
                >
                  <img
                    src={facility.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </button>
                <div className="flex-1 flex flex-col px-2.5 min-[360px]:px-3 pt-2.5 min-[360px]:pt-3 pb-3 min-[360px]:pb-4 sm:pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <h3 className="font-heading font-semibold text-sm text-[#121212] break-words min-w-0">
                      {facility.name}
                    </h3>
                    <span className="shrink-0 rounded bg-[#E6F0E0] px-2 py-1 text-[10px] leading-none font-heading font-bold text-[#404F14]">
                      {facility.badge}
                    </span>
                  </div>
                  <p className="mt-2 mb-3 text-xs font-heading text-[#6F6B6E] break-words">
                    {facility.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedFacility(facility)}
                    className="mt-auto w-full h-9 sm:h-[30px] rounded-md bg-[#CDF178] text-[11px] min-[360px]:text-xs sm:text-[13px] font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
                  >
                    {facility.buttonLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* ================= Modal pemesanan ================= */}
      <OrderModal
        facility={modalFacility}
        onClose={() => setSelectedFacility(null)}
        onOrder={() => {
          setSelectedFacility(null)
          navigate('/checkout') // TODO: ganti ke halaman checkout sebenarnya
        }}
      />

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewImage(null)
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
        >
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsImageZoomed((zoomed) => !zoomed)}
              aria-label={isImageZoomed ? 'Perkecil gambar' : 'Perbesar gambar'}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              {isImageZoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
            </button>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label="Tutup gambar"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <X size={22} />
            </button>
          </div>
          <div className="max-h-[90vh] max-w-[94vw] overflow-auto">
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className={isImageZoomed ? 'w-[140vw] max-w-[1400px]' : 'max-h-[88vh] max-w-[94vw]'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage