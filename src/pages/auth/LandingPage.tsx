import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Trophy, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../../components/layout/LandingNavbar'
import Footer from '../../components/layout/LandingFooter'
import lapangF1 from '../../assets/layanan/Lapang F1.png'
import futsalF2 from '../../assets/layanan/Futsal F2.png'
import lapangF2 from '../../assets/layanan/Lapang F2.png'
import mejaBilliard from '../../assets/layanan/Meja Billiard.png'
import logoSportCenter from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import promoBanner from '../../assets/slider/Rectangle 48.png'

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

// Kelas bersama untuk foto kolase (supaya tidak diulang-ulang)
const COLLAGE_IMG =
  'w-full rounded-lg sm:rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)]'

function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activePromo, setActivePromo] = useState(1)
  const [activeTesti, setActiveTesti] = useState(1)
  const navigate = useNavigate()

  const testimonial = TESTIMONIALS[activeTesti]

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 4000)

    return () => window.clearTimeout(timeoutId)
  }, [activeSlide])

  // Navigasi carousel dibuat melingkar
  const handlePrevPromo = () =>
    setActivePromo((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length)
  const handleNextPromo = () => setActivePromo((prev) => (prev + 1) % PROMO_SLIDES.length)
  const handlePrevTesti = () =>
    setActiveTesti((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const handleNextTesti = () => setActiveTesti((prev) => (prev + 1) % TESTIMONIALS.length)

  return (
    <>
      <style>{`
        @keyframes hero-fade {
          from {
            opacity: 0;
            transform: scale(1.08) translateX(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }

        @keyframes hero-progress {
          from { width: 0; }
          to { width: 100%; }
        }

        /* Hormati pengaturan "reduce motion" milik pengguna */
        @media (prefers-reduced-motion: reduce) {
          .hero-anim { animation: none !important; }
        }
      `}</style>

      <div className="min-h-screen overflow-x-clip bg-[#FDFCF7] font-body text-[#343133]">
        <Navbar />

        {/* ================= Hero section (MOBILE: full-bleed) ================= */}
        <section className="relative h-[520px] overflow-hidden bg-[#E9E7E0] md:hidden">
          <img
            key={activeSlide}
            src={HERO_IMAGES[activeSlide]}
            alt="Fasilitas olahraga OBC Sport Center"
            className="hero-anim absolute inset-0 h-full w-full object-cover"
            style={{ animation: 'hero-fade 0.7s ease-in-out' }}
          />
          {/* Fade abu di atas, hijau gelap di bawah */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, #E9E7E0 0%, rgba(233,231,224,0) 38%, rgba(20,61,31,0.92) 100%)',
            }}
          />

          <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-center text-white">
            <h1 className="line-clamp-3 font-heading text-2xl font-bold leading-tight">
              Fasilitas Olahraga Premium Dalam Genggaman Anda
            </h1>
            <p className="mx-auto mt-3 line-clamp-3 max-w-[340px] text-sm leading-relaxed">
              Temukan dan sewa lapangan olahraga terbaik pilihan Anda dalam genggaman.
              Nikmati fasilitas modern premium di kota Anda.
            </p>

            <div className="mt-6 flex justify-center gap-2">
              {HERO_IMAGES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Tampilkan foto ${index + 1}`}
                  aria-pressed={index === activeSlide}
                  onClick={() => setActiveSlide(index)}
                  className="relative h-1.5 w-9 cursor-pointer overflow-hidden rounded-full bg-white/50"
                >
                  {index === activeSlide && (
                    <span
                      key={activeSlide}
                      className="hero-anim absolute inset-y-0 left-0 rounded-full bg-white"
                      style={{ animation: 'hero-progress 4s linear forwards' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= Hero section (DESKTOP / TABLET) ================= */}
        <section className="hidden border-y border-[#D4D4D4] bg-[#FDFCF7] md:block">
          <div className="mx-auto grid max-w-[1248px] items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-20">
            {/* Kolom kiri: teks & CTA */}
            <div className="text-center lg:text-left">
              <span className="inline-block rounded-full bg-[#E8EDE3] px-3 py-1.5 font-heading text-[10px] font-bold tracking-wide text-[#404F14] sm:px-4 sm:py-2 sm:text-xs">
                PROMOSI DAN SEWA LAPANGAN TERBAIK
              </span>

              <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-[#343133] sm:mt-5 sm:text-4xl lg:text-5xl">
                Fasilitas Olahraga Premium Dalam Genggaman Anda
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#343133] sm:mt-5 sm:text-base lg:mx-0">
                Temukan dan sewa lapangan olahraga terbaik pilihan Anda dalam genggaman.
                Nikmati fasilitas modern premium di kota Anda.
              </p>

              <div className="mt-6 sm:mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="w-full cursor-pointer rounded-lg bg-[#CDF178] px-6 py-3 font-heading font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] sm:w-auto"
                >
                  Mulai Sewa Sekarang
                </button>
              </div>
            </div>

            {/* Kolom kanan: foto hero + indikator slide */}
            <div className="relative mx-auto aspect-[534/418] w-full max-w-[534px] overflow-hidden rounded-2xl bg-[#E9E7E0] shadow-[0_18px_40px_rgba(52,49,51,0.08)] sm:rounded-3xl lg:ml-auto lg:mr-0">
              <img
                key={activeSlide}
                src={HERO_IMAGES[activeSlide]}
                alt="Fasilitas olahraga OBC Sport Center"
                className="hero-anim h-full w-full object-cover"
                style={{ animation: 'hero-fade 0.7s ease-in-out' }}
              />
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
                {HERO_IMAGES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Tampilkan foto ${index + 1}`}
                    aria-pressed={index === activeSlide}
                    onClick={() => setActiveSlide(index)}
                    className="relative h-1.5 w-7 cursor-pointer overflow-hidden rounded-full bg-white/60 sm:w-9"
                  >
                    {index === activeSlide && (
                      <span
                        key={activeSlide}
                        className="hero-anim absolute inset-y-0 left-0 rounded-full bg-[#343133]"
                        style={{ animation: 'hero-progress 4s linear forwards' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= Promo & penawaran ================= */}
        <section className="mx-auto max-w-[1384px] px-4 pt-10 sm:px-6 sm:pt-12">
          <h2 className="text-center font-heading text-xl font-semibold text-[#343133] sm:text-2xl">
            Promo dan penawaran dari OBC Sport
          </h2>

          <div className="relative mt-5 overflow-hidden rounded-xl sm:mt-6 sm:rounded-2xl">
            <img
              src={promoBanner}
              alt="Join OBC Sport, unlock your potential"
              className="block h-auto min-h-[140px] w-full object-cover"
            />

            <button
              type="button"
              aria-label="Promo sebelumnya"
              onClick={handlePrevPromo}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#343133]/60 text-white transition-colors hover:bg-[#343133]/80 sm:left-4 sm:h-11 sm:w-11 lg:left-6 lg:h-12 lg:w-12"
            >
              <ChevronLeft className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
            </button>
            <button
              type="button"
              aria-label="Promo berikutnya"
              onClick={handleNextPromo}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#343133]/60 text-white transition-colors hover:bg-[#343133]/80 sm:right-4 sm:h-11 sm:w-11 lg:right-6 lg:h-12 lg:w-12"
            >
              <ChevronRight className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
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
                className={`h-1.5 w-6 cursor-pointer rounded-full border transition-colors ${
                  index === activePromo
                    ? 'border-[#D4D4D4] bg-[#D4D4D4]'
                    : 'border-[#D4D4D4] bg-white'
                }`}
              />
            ))}
          </div>
        </section>

        {/* ================= Highlight cards ================= */}
        <section className="mx-auto max-w-[1248px] px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:pb-12 lg:pt-20">
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1.5 rounded-xl border border-[#D4D4D4] bg-white px-4 py-4 sm:flex-row sm:items-center sm:gap-3 md:flex-col md:items-start md:gap-1.5 lg:flex-row lg:items-center lg:gap-3"
              >
                <div className="flex shrink-0 items-center gap-2">
                  {item.icon}
                  <h3 className="font-heading text-base font-bold text-[#404F14]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm leading-snug text-[#6F6B6E]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= Booking OBC Sport ================= */}
        <section className="border-y border-[#D4D4D4] bg-white">
          <div className="mx-auto grid max-w-[1248px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-10">
            {/* Kolom kiri: teks */}
            <div className="flex h-full flex-col lg:min-h-[480px]">
              <span className="inline-block self-start rounded-full bg-[#E8EDE3] px-4 py-2 font-heading text-xs font-medium text-[#404F14]">
                OBC Sport
              </span>
              <h2 className="mt-3 max-w-[480px] font-heading text-xl font-semibold leading-snug text-[#343133] sm:text-2xl">
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
                className="mt-5 cursor-pointer self-start py-2 font-heading text-sm text-[#004000] underline underline-offset-2 lg:mt-auto lg:pt-16"
              >
                Mulai Booking Sekarang -&gt;
              </button>
            </div>

            {/* Kolom kanan: kolase foto fasilitas (fluid, tinggi mengikuti rasio) */}
            {/* TODO: foto tenis meja dan lapang sepak bola belum ada, sementara pakai futsalF2 */}
            <div className="mx-auto flex w-full max-w-[468px] gap-3 sm:gap-4 lg:mr-0 lg:justify-end">
              <div className="flex min-w-0 flex-[259] flex-col gap-3 pt-8 sm:gap-5 sm:pt-14">
                <img
                  src={lapangF1}
                  alt="Lapangan F1"
                  loading="lazy"
                  decoding="async"
                  className={`${COLLAGE_IMG} aspect-[259/194]`}
                />
                <img
                  src={lapangF2}
                  alt="Lapangan F2"
                  loading="lazy"
                  decoding="async"
                  className={`${COLLAGE_IMG} aspect-[259/133]`}
                />
              </div>
              <div className="flex min-w-0 flex-[193] flex-col gap-3 sm:gap-5">
                <img
                  src={futsalF2}
                  alt="Ruang tenis meja"
                  loading="lazy"
                  decoding="async"
                  className={`${COLLAGE_IMG} aspect-[193/112]`}
                />
                <img
                  src={mejaBilliard}
                  alt="Ruang billiard"
                  loading="lazy"
                  decoding="async"
                  className={`${COLLAGE_IMG} aspect-[193/194]`}
                />
                <img
                  src={futsalF2}
                  alt="Lapang sepak bola"
                  loading="lazy"
                  decoding="async"
                  className={`${COLLAGE_IMG} aspect-[193/111]`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= Testimoni ================= */}
        <section className="mx-auto max-w-[1248px] px-4 pt-10 sm:px-6 sm:pt-12">
          <div className="mx-auto grid max-w-[1106px] overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] md:min-h-[430px] md:grid-cols-[minmax(240px,35%)_1fr] lg:grid-cols-[426px_1fr]">
            {/* Panel kiri hijau */}
            <div className="flex items-center bg-gradient-to-br from-[#004000] to-[#404F14] px-6 py-8 sm:px-10 md:px-8 md:py-10 lg:px-12">
              <h2 className="font-heading text-xl font-semibold leading-snug text-white sm:text-2xl">
                Apa kata Pengguna OBC Sport ?
              </h2>
            </div>

            {/* Panel kanan testimoni */}
            <div className="flex flex-col px-6 py-6 sm:px-10 sm:py-8">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* TODO: ganti dengan foto pelanggan asli */}
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9AAD3E] font-heading text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
                  {testimonial.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-bold text-[#343133]">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#343133]">{testimonial.role}</p>
                </div>
              </div>

              <p className="mt-6 text-sm italic leading-relaxed text-[#343133] md:mt-12">
                {testimonial.quote}
              </p>

              <div className="mt-auto flex items-center justify-between pt-8 md:pt-10">
                <span className="font-heading text-xs font-semibold text-[#343133]">
                  {String(activeTesti + 1).padStart(2, '0')}/
                  {String(TESTIMONIALS.length).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Testimoni sebelumnya"
                    onClick={handlePrevTesti}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-heading text-xl font-bold text-[#343133] transition-colors hover:bg-[#E8EDE3]"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    aria-label="Testimoni berikutnya"
                    onClick={handleNextTesti}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-heading text-xl font-bold text-[#343133] transition-colors hover:bg-[#E8EDE3]"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Unit bisnis ================= */}
        <section className="mx-auto max-w-[1248px] px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:pt-24">
          <h2 className="font-heading text-xl font-semibold text-[#404F14] sm:text-2xl">
            Unit Bisnis Kami :
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {BUSINESS_UNITS.map((unit) => (
              <div
                key={unit.id}
                className="flex h-[160px] flex-col justify-between rounded-xl bg-white px-3 pb-3 pt-3 shadow-[0_2px_10px_rgba(0,0,0,0.15)] sm:h-[208px] sm:px-4 sm:pt-4"
              >
                <div className="flex flex-1 items-center justify-center">
                  {unit.logo ? (
                    <img
                      src={unit.logo}
                      alt={unit.name}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 rounded-full object-contain sm:h-[120px] sm:w-[120px]"
                    />
                  ) : (
                    // TODO: ganti dengan logo unit bisnis asli
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8EDE3] font-heading text-2xl font-bold text-[#404F14] sm:h-[120px] sm:w-[120px] sm:text-3xl">
                      {unit.name.replace('OBC ', '').charAt(0)}
                    </span>
                  )}
                </div>
                <p className="font-heading text-sm font-bold text-[#343133] sm:text-base">
                  {unit.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer + spacer setinggi tombol sticky (mobile) supaya footer tidak tertutup */}
        <div className="bg-gradient-to-r from-[#004000] to-[#404F14] md:bg-none">
          <Footer />
          <div className="h-20 md:hidden" aria-hidden="true" />
        </div>

        {/* ================= Tombol "Mulai Sekarang" sticky (mobile) =================
            Menempel di dasar layar dan terus mengikuti saat scroll */}
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-5 pt-6 md:hidden"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            background:
              'linear-gradient(to top, rgba(253,252,247,0.95) 55%, rgba(253,252,247,0))',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="pointer-events-auto h-12 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] shadow-[0_4px_14px_rgba(64,79,20,0.25)] transition-colors hover:bg-[#BDE35F]"
          >
            Mulai Sewa Sekarang
          </button>
        </div>
      </div>
    </>
  )
}

export default LandingPage