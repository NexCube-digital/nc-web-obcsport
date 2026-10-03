import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
        {/* ================= Hero sapaan + pencarian ================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#265021] to-[#404F14] px-6 h-[180px] flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <div>
            <h1 className={`${FONT_MONTSERRAT} font-bold text-[28px] leading-9 text-white`}>
              Halo, {USER_NAME}! 👋
            </h1>
            <p className="mt-1 text-sm leading-[21px] text-white max-w-[540px] font-heading">
              Temukan lapangan favoritmu dan mulai berolahraga hari ini. Pilih tanggal
              &amp; jam main untuk memulai booking.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari lapangan olahraga..."
              className="w-[300px] h-[46px] rounded-lg border border-[#D4D4D4] bg-white px-3 text-sm font-heading text-[#343133] placeholder:text-[#6F6B6E] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="w-[78px] h-[46px] rounded-lg bg-[#CDF178] text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              Cari
            </button>
          </div>
        </section>

        {/* ================= Informasi cepat ================= */}
        <section className="mt-6 rounded-3xl border border-[#D4D4D4] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <h2 className={`${FONT_MONTSERRAT} font-bold text-[28px] leading-9 text-[#404F14]`}>
            INFORMASI CEPAT
          </h2>
          <p className="mt-1 text-sm leading-[21px] text-[#343133] max-w-[540px] font-heading">
            Temukan lapangan favoritmu dan mulai berolahraga hari ini. Pilih tanggal
            &amp; jam main untuk memulai booking.
          </p>

          {/* Banner pengumuman */}
          <div className="mt-5 h-11 flex items-center gap-3 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-3">
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
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span className="text-[13px] font-heading font-medium text-[#C00000]">
              {ANNOUNCEMENT}
            </span>
          </div>
        </section>

        {/* ================= Promosi & Event Terbaru ================= */}
        <section className="mt-6">
          <h2 className={`${FONT_MONTSERRAT} font-bold text-xl text-[#265021]`}>
            Promosi &amp; Event Terbaru
          </h2>
          <div className="mt-3 grid md:grid-cols-3 gap-[13px]">
            {PROMOS.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="h-[110px] w-[72px] shrink-0 rounded-lg object-cover"
                />
                <div>
                  <span className="inline-block rounded bg-[#E6F0E0] px-2 py-1 text-[10px] leading-none font-heading font-bold text-[#404F14]">
                    PROMO SPESIAL
                  </span>
                  <h3 className={`mt-1 ${FONT_MONTSERRAT} font-semibold text-sm text-[#265021]`}>
                    {promo.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-heading text-[#343133]">
                    {promo.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= Ketersediaan lapangan premium ================= */}
        <section className="mt-6">
          <h2
            className={`${FONT_MONTSERRAT} font-bold text-xl text-[#265021] pb-2 border-b border-[#D4D4D4]`}
          >
            Ketersediaan Lapangan Premium
          </h2>

          {/* Kartu fasilitas: lebar tetap 285px, jarak 16px */}
          <div className="mt-3 flex flex-wrap gap-4">
            {FACILITIES.map((facility) => (
              <div
                key={facility.id}
                className="w-[285px] rounded-2xl bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
              >
                <img
                  src={facility.image}
                  alt={facility.name}
                  className="h-20 w-full object-cover"
                  loading="lazy"
                />
                <div className="px-3 pt-3 pb-6">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-semibold text-sm text-[#121212]">
                      {facility.name}
                    </h3>
                    <span className="rounded bg-[#E6F0E0] px-2 py-1 text-[10px] leading-none font-heading font-bold text-[#404F14]">
                      {facility.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-heading text-[#6F6B6E]">
                    {facility.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedFacility(facility)}
                    className="mt-3 w-full h-[30px] rounded-md bg-[#CDF178] text-[13px] font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
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
    </div>
  )
}

export default HomePage