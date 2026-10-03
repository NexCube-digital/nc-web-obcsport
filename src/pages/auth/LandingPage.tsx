import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Trophy, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../../components/layout/LandingNavbar'
import Footer from '../../components/layout/Footer'
import lapangF1 from '../../assets/layanan/Lapang F1.png'
import futsalF2 from '../../assets/layanan/Futsal F2.png'
import lapangF2 from '../../assets/layanan/Lapang F2.png'
import mejaBilliard from '../../assets/layanan/Meja Billiard.png'
import logoSportCenter from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface HighlightItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

interface PromoSlide {
  id: string
  title: string
  subtitle: string
}

interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
}

interface BusinessUnit {
  id: string
  name: string
  logo?: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/homeService.js jika perlu)
   ------------------------------------------------------------------------- */
const HERO_IMAGES: string[] = [lapangF1, futsalF2, lapangF2, mejaBilliard]

const HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'booking',
    icon: <Zap size={20} className="text-[#404F14]" />,
    title: 'Booking Real-Time',
    description: 'Konfirmasi instan tanpa harus chat admin manual.',
  },
  {
    id: 'fasilitas',
    icon: <Trophy size={20} className="text-[#404F14]" />,
    title: 'Fasilitas Premium',
    description: 'Sistem pencahayaan LED standar turnamen internasional.',
  },
  {
    id: 'membership',
    icon: <Users size={20} className="text-[#404F14]" />,
    title: 'Sistem Membership',
    description: 'Akses latihan eksklusif & program akademi terstruktur.',
  },
]

// TODO: belum ada aset banner promo, sementara pakai banner teks bergradient.
// Ganti dengan gambar banner asli dari API / CMS
const PROMO_SLIDES: PromoSlide[] = [
  { id: 'promo-1', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
  { id: 'promo-2', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
  { id: 'promo-3', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
  { id: 'promo-4', title: 'JOIN OBC SPORT', subtitle: 'UNLOCK YOUR POTENTIAL' },
]

// TODO: ganti dengan data testimoni dari API
const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    name: 'Ahmad sukron',
    role: 'Pelanggan OBC Sport',
    quote:
      '“OBC Sport Center benar-benar mengubah cara tim kami menyewa lapangan. Proses booking-nya instan tanpa ribet chat admin, lapangannya sangat premium dengan pencahayaan LED yang nyaman. Pilihan terbaik untuk mabar maupun turnamen rutin.”',
  },
  {
    id: 'testi-2',
    name: 'Ahmad sukron',
    role: 'Pelanggan OBC Sport',
    quote:
      '“OBC Sport Center benar-benar mengubah cara tim kami menyewa lapangan. Proses booking-nya instan tanpa ribet chat admin, lapangannya sangat premium dengan pencahayaan LED yang nyaman. Pilihan terbaik untuk mabar maupun turnamen rutin.”',
  },
  {
    id: 'testi-3',
    name: 'Ahmad sukron',
    role: 'Pelanggan OBC Sport',
    quote:
      '“OBC Sport Center benar-benar mengubah cara tim kami menyewa lapangan. Proses booking-nya instan tanpa ribet chat admin, lapangannya sangat premium dengan pencahayaan LED yang nyaman. Pilihan terbaik untuk mabar maupun turnamen rutin.”',
  },
]

// TODO: baru logo OBC Sport Center yang ada asetnya, logo lain tampil sebagai placeholder inisial
const BUSINESS_UNITS: BusinessUnit[] = [
  { id: 'sport-center', name: 'OBC Sport Center', logo: logoSportCenter },
  { id: 'guest-house', name: 'OBC Guest House' },
  { id: 'villa', name: 'OBC Villa' },
  { id: 'laundry', name: 'OBC Laundry' },
  { id: 'food-court', name: 'OBC Food Court' },
  { id: 'coffee', name: 'OBC Coffee' },
  { id: 'agribisnis', name: 'OBC Agribisnis' },
]

function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activePromo, setActivePromo] = useState(1)
  const [activeTesti, setActiveTesti] = useState(1)
  const navigate = useNavigate()

  const testimonial = TESTIMONIALS[activeTesti]

  // Navigasi carousel dibuat melingkar
  const handlePrevPromo = () =>
    setActivePromo((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length)
  const handleNextPromo = () => setActivePromo((prev) => (prev + 1) % PROMO_SLIDES.length)
  const handlePrevTesti = () =>
    setActiveTesti((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const handleNextTesti = () => setActiveTesti((prev) => (prev + 1) % TESTIMONIALS.length)

  return (
    <div className="min-h-screen bg-[#FDFCF7] font-body text-[#343133]">
      <Navbar />

      {/* ================= Hero section ================= */}
      <section className="border-y border-[#D4D4D4] bg-[#FDFCF7]">
        <div className="max-w-[1248px] mx-auto px-6 py-14 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Kolom kiri: teks & CTA */}
          <div>
            <span className="inline-block rounded-full bg-[#E8EDE3] px-4 py-2 text-xs font-heading font-bold text-[#404F14] tracking-wide">
              PROMOSI DAN SEWA LAPANGAN TERBAIK
            </span>

            <h1 className="mt-5 font-heading font-bold text-4xl lg:text-5xl leading-tight text-[#343133]">
              Fasilitas Olahraga Premium Dalam Genggaman Anda
            </h1>

            <p className="mt-5 text-[#343133] text-base leading-relaxed max-w-md">
              Temukan dan sewa lapangan olahraga terbaik pilihan Anda dalam genggaman.
              Nikmati fasilitas modern premium di kota Anda.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/schedule')}
                className="rounded-lg bg-[#CDF178] px-6 py-3 font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
              >
                Mulai Sewa Sekarang
              </button>
            </div>
          </div>

          {/* Kolom kanan: foto hero + indikator slide */}
          <div className="relative rounded-3xl overflow-hidden w-full max-w-[534px] h-[418px] ml-auto bg-[#E9E7E0]">
            <img
              src={HERO_IMAGES[activeSlide]}
              alt="Fasilitas olahraga OBC Sport Center"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {HERO_IMAGES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Tampilkan foto ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-1 w-9 rounded-full transition-colors cursor-pointer ${
                    index === activeSlide ? 'bg-[#343133]' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= Promo & penawaran ================= */}
      <section className="max-w-[1384px] mx-auto px-6 pt-12">
        <h2 className="text-center font-heading font-semibold text-2xl text-[#343133]">
          Promo dan penawaran dari OBC Sport
        </h2>

        <div className="relative mt-6 h-[373px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#004000] to-[#404F14] flex flex-col items-center justify-center text-white">
          {/* TODO: ganti blok teks ini dengan gambar banner promo asli */}
          <p className="font-heading font-bold text-5xl tracking-wide">
            {PROMO_SLIDES[activePromo].title}
          </p>
          <p className="mt-2 font-heading text-2xl tracking-wide">
            {PROMO_SLIDES[activePromo].subtitle}
          </p>

          <button
            type="button"
            aria-label="Promo sebelumnya"
            onClick={handlePrevPromo}
            className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-[#343133]/60 text-white hover:bg-[#343133]/80 transition-colors cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Promo berikutnya"
            onClick={handleNextPromo}
            className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-[#343133]/60 text-white hover:bg-[#343133]/80 transition-colors cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Indikator promo */}
        <div className="mt-4 flex justify-center gap-2">
          {PROMO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Tampilkan promo ${index + 1}`}
              onClick={() => setActivePromo(index)}
              className={`h-1.5 w-6 rounded-full border transition-colors cursor-pointer ${
                index === activePromo
                  ? 'bg-[#D4D4D4] border-[#D4D4D4]'
                  : 'bg-white border-[#D4D4D4]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ================= Highlight cards ================= */}
      <section className="max-w-[1248px] mx-auto px-6 pt-20 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-[#D4D4D4] bg-white px-4 py-4"
            >
              <div className="flex items-center gap-2 shrink-0">
                {item.icon}
                <h3 className="font-heading font-bold text-base text-[#404F14]">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-[#6F6B6E] leading-snug">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= Booking OBC Sport ================= */}
      <section className="border-y border-[#D4D4D4] bg-white">
        <div className="max-w-[1248px] mx-auto px-6 py-10 grid lg:grid-cols-2 gap-10 items-center">
          {/* Kolom kiri: teks */}
          <div className="flex flex-col h-full lg:min-h-[480px]">
            <span className="inline-block self-start rounded-full bg-[#E8EDE3] px-4 py-2 text-xs font-heading font-medium text-[#404F14]">
              OBC Sport
            </span>
            <h2 className="mt-3 max-w-[480px] font-heading font-semibold text-2xl leading-snug text-[#343133]">
              Booking Lapangan Instan untuk Harian, Rutin, hingga Event Skala Besar
            </h2>
            <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-[#343133]">
              Nikmati kemudahan sewa lapangan olahraga premium di OBC Sport Center secara
              cepat dan praktis. Mulai dari pemesanan harian, membership rutin, hingga
              sewa eksklusif untuk turnamen dan gathering komunitas—semuanya diatur
              secara transparan tanpa ribet.
            </p>
            <button
              type="button"
              onClick={() => navigate('/schedule')}
              className="mt-auto pt-16 self-start text-sm font-heading text-[#004000] underline underline-offset-2 cursor-pointer"
            >
              Mulai Booking Sekarang -&gt;
            </button>
          </div>

          {/* Kolom kanan: kolase foto fasilitas */}
          {/* TODO: foto tenis meja dan lapang sepak bola belum ada, sementara pakai futsalF2 */}
          <div className="flex gap-4 justify-end">
            <div className="w-[259px] flex flex-col gap-5 pt-14">
              <img
                src={lapangF1}
                alt="Lapangan F1"
                className="h-[194px] w-full rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              />
              <img
                src={lapangF2}
                alt="Lapangan F2"
                className="h-[133px] w-full rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              />
            </div>
            <div className="w-[193px] flex flex-col gap-5">
              <img
                src={futsalF2}
                alt="Ruang tenis meja"
                className="h-[112px] w-full rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              />
              <img
                src={mejaBilliard}
                alt="Ruang billiard"
                className="h-[194px] w-full rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              />
              <img
                src={futsalF2}
                alt="Lapang sepak bola"
                className="h-[111px] w-full rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= Testimoni ================= */}
      <section className="max-w-[1248px] mx-auto px-6 pt-12">
        <div className="mx-auto max-w-[1106px] grid md:grid-cols-[426px_1fr] rounded-xl overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] min-h-[430px]">
          {/* Panel kiri hijau */}
          <div className="bg-gradient-to-br from-[#004000] to-[#404F14] flex items-center px-12 py-10">
            <h2 className="font-heading font-semibold text-2xl leading-snug text-white">
              Apa kata Pengguna OBC Sport ?
            </h2>
          </div>

          {/* Panel kanan testimoni */}
          <div className="flex flex-col px-10 py-8">
            <div className="flex items-center gap-4">
              {/* TODO: ganti dengan foto pelanggan asli */}
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#9AAD3E] font-heading font-bold text-xl text-white">
                {testimonial.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-heading font-bold text-base text-[#343133]">
                  {testimonial.name}
                </p>
                <p className="text-xs text-[#343133]">{testimonial.role}</p>
              </div>
            </div>

            <p className="mt-12 text-sm italic leading-relaxed text-[#343133]">
              {testimonial.quote}
            </p>

            <div className="mt-auto pt-10 flex items-center justify-between">
              <span className="text-xs font-heading font-semibold text-[#343133]">
                {String(activeTesti + 1).padStart(2, '0')}/
                {String(TESTIMONIALS.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Testimoni sebelumnya"
                  onClick={handlePrevTesti}
                  className="font-heading font-bold text-xl text-[#343133] cursor-pointer"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  aria-label="Testimoni berikutnya"
                  onClick={handleNextTesti}
                  className="font-heading font-bold text-xl text-[#343133] cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Unit bisnis ================= */}
      <section className="max-w-[1248px] mx-auto px-6 pt-24 pb-20">
        <h2 className="font-heading font-semibold text-2xl text-[#404F14]">
          Unit Bisnis Kami :
        </h2>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {BUSINESS_UNITS.map((unit) => (
            <div
              key={unit.id}
              className="flex h-[208px] flex-col justify-between rounded-xl bg-white px-4 pt-4 pb-3 shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
            >
              <div className="flex flex-1 items-center justify-center">
                {unit.logo ? (
                  <img
                    src={unit.logo}
                    alt={unit.name}
                    className="h-[120px] w-[120px] rounded-full object-contain"
                  />
                ) : (
                  // TODO: ganti dengan logo unit bisnis asli
                  <span className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#E8EDE3] font-heading font-bold text-3xl text-[#404F14]">
                    {unit.name.replace('OBC ', '').charAt(0)}
                  </span>
                )}
              </div>
              <p className="font-heading font-bold text-base text-[#343133]">{unit.name}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage