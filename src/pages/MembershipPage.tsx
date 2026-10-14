// pages/MembershipPage.tsx
import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import member from '../assets/bfe838718c7f801119930d28d3d286f12b853b5e.jpg'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface SportOption {
  id: string
  name: string
  amount: string
  unit: string
}

/* -------------------------------------------------------------------------
   Teks section showcase (satu file, tanpa i18n)
   ------------------------------------------------------------------------- */
const SHOWCASE_COPY = {
  badge: 'OBC Sports Membership',
  title: 'Main Rutin,\nBayar Lebih Hemat',
  description:
    'Amankan jadwal lapangan favorit Anda setiap minggu. Dengan membership 4x pertemuan, Anda mendapatkan harga lebih hemat dan slot yang terjamin.',
  benefits: [
    'Diskon 20% untuk 4x pertemuan',
    'Harga lebih hemat',
    'Slot lapangan terjamin',
    'Jadwal tetap untuk bermain',
  ],
  cardSubtitle: 'Sports Membership',
  tagline: 'Play. Move. Connect.',
  cta: 'Daftar Membership Sekarang',
  terms: '*Syarat dan ketentuan berlaku',
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/membershipService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

const SPORT_OPTIONS: SportOption[] = [
  { id: 'futsal', name: 'Futsal', amount: 'Rp 500.000', unit: '4x Sesi' },
  { id: 'badminton', name: 'Badminton', amount: 'Rp 240.000', unit: '4x Sesi' },
  { id: 'basket', name: 'Basket', amount: 'Rp 600.000', unit: '4x Sesi' },
]

/* -------------------------------------------------------------------------
   Section showcase membership (menggantikan foto hero)
   ------------------------------------------------------------------------- */
function MembershipShowcase() {
  return (
    <section
      id="membership"
      className="relative overflow-hidden rounded-2xl border border-[#E2DFD2] bg-white py-10 shadow-[0_4px_16px_rgba(52,49,51,0.06)]"
    >
      {/* tekstur lapangan samar */}
      <img
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-multiply"
        src={member}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={{ filter: 'brightness(1.15)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(0,157,0,0.08)_0%,transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-[calc(100%-40px)] max-w-[520px] grid-cols-1 items-center gap-8 md:w-[calc(100%-32px)] md:max-w-[1246px] md:grid-cols-2 md:gap-x-8 md:gap-y-6 md:px-6 xl:grid-cols-[1fr_auto_1fr] xl:gap-8">
        {/* Kolom kiri: headline & benefit */}
        <div className="flex min-w-0 flex-col items-start text-left">
          <span className="mb-1.5 block font-['Montserrat'] text-[12px] font-bold uppercase tracking-[1px] text-[#222222] md:text-[14px] md:font-medium xl:text-[15px]">
            {SHOWCASE_COPY.badge}
          </span>
          <h2 className="whitespace-pre-line font-['Montserrat'] text-[20px] font-semibold leading-[28px] tracking-normal text-[#000000] md:text-[30px] md:font-bold md:leading-[1.25] md:tracking-[1.5px] lg:text-[32px] xl:text-[36px]">
            {SHOWCASE_COPY.title}
          </h2>
          <p className="mt-2 w-full text-left font-['Montserrat'] text-[13px] font-normal leading-[20px] text-[#444444] md:mt-3 md:max-w-[360px] md:text-[13.5px] md:leading-[24px] xl:text-[14.5px]">
            {SHOWCASE_COPY.description}
          </p>
          <ul className="mt-4 w-full text-left md:mt-3 md:max-w-[360px]">
            {SHOWCASE_COPY.benefits.map((benefit) => (
              <li
                className="mb-2.5 flex items-center gap-3 font-body text-[14px] text-[#1a1a1a] md:gap-2.5 md:text-[13px]"
                key={benefit}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-[#1a1a1a] text-[#1a1a1a] md:h-[18px] md:w-[18px]">
                  <Check className="h-3 w-3 md:h-2.5 md:w-2.5" strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Kartu membership 3D */}
        <div className="grid min-w-0 place-items-center py-2 md:py-0">
          <div
            className="relative flex h-[168px] w-[305px] max-w-full flex-col justify-between rounded-[16px] border border-[#10B9814D] p-5 shadow-[0_0_30px_0_rgba(198,245,42,0.12),-12px_18px_36px_-10px_rgba(0,0,0,0.6)] transition-transform [transform:rotate(3deg)] hover:scale-[1.02] md:h-[196px] md:w-[320px] md:[transform:rotate(2.5deg)] lg:h-[212px] lg:w-[350px] xl:h-[224px] xl:w-[365px] xl:p-6"
            style={{
              background:
                'linear-gradient(132.33deg, #002400 0.9%, #009D00 49.99%, #004000 99.1%)',
            }}
            aria-hidden="true"
          >
            <div className="flex items-start justify-between">
              <div>
                <strong className="block font-['Montserrat'] text-[17px] font-extrabold leading-none tracking-[-0.6px] text-[#FFFFFF] md:text-[26px] xl:text-[28px]">
                  OBC
                </strong>
                <span className="mt-1 block font-['Montserrat'] text-[8px] font-semibold uppercase leading-tight tracking-[2px] text-[#FFFFF7] md:text-[7.5px] xl:text-[8px]">
                  SPORT CENTER
                </span>
              </div>
              {/* Chip */}
              <div
                className="relative grid h-[19px] w-[26px] place-items-center shadow md:h-[17px] md:w-[24px]"
                style={{ transform: 'rotate(-2.5deg)' }}
              >
                <span className="absolute inset-0 rounded-[3px] border border-[#FFF717] bg-white" />
                <span
                  className="absolute h-[9px] w-[13px] rounded-[2px] border border-[#FFF717] bg-transparent md:h-2 md:w-3"
                  style={{ transform: 'rotate(-2.5deg)' }}
                />
              </div>
            </div>

            <div className="-translate-y-8 flex flex-col items-center justify-center text-center md:-translate-y-14">
              <p className="whitespace-nowrap font-['Montserrat'] text-[16px] font-extrabold leading-tight tracking-[0.5px] text-white md:text-[14px] xl:text-[15px]">
                {SHOWCASE_COPY.cardSubtitle}
              </p>
              <p className="mt-1 font-['Montserrat'] text-[7.5px] font-semibold uppercase leading-tight tracking-[2px] text-[#FFFFF7] xl:text-[8px]">
                {SHOWCASE_COPY.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom kanan: brand & CTA */}
        <div className="flex min-w-0 flex-col items-end gap-1.5 pr-1.5 text-right md:col-span-2 md:items-center md:pr-0 md:text-center xl:col-span-1 xl:items-end xl:gap-2 xl:text-right">
          <div className="text-center xl:text-right">
            <strong className="block font-heading text-[40px] font-extrabold leading-none tracking-tight text-[#111111] md:text-[38px] xl:text-[46px]">
              OBC
            </strong>
            <small className="mt-1 block font-heading text-[13px] font-semibold tracking-[0.35em] text-[#111111] md:mt-0 md:text-[10.5px] xl:text-[11.5px]">
              SPORT CENTER
            </small>
          </div>

          <p className="mt-3 -rotate-2 text-right font-['Caveat'] text-[30px] font-bold leading-tight tracking-[1px] text-[#222222] md:mt-2 md:rotate-0 md:text-center xl:text-right xl:text-[36px]">
            {SHOWCASE_COPY.tagline}
          </p>

          <a
            className="group mt-3 inline-flex h-[56px] w-fit max-w-full shrink-0 items-center justify-start gap-3 self-start rounded-full border-[0.67px] border-[#CDF178] bg-[#CDF178] py-1.5 pl-[15px] pr-[6px] font-['Montserrat'] text-[13px] font-semibold text-[#1F3320] transition-colors duration-300 hover:border-[#004000] hover:bg-[#004000] md:mt-1 md:h-[52px] md:gap-3 md:self-auto md:py-2 md:pl-5 md:pr-2 md:text-[15px] xl:h-[58px] xl:text-[16px]"
            href="https://sport.obcgroup.id/"
            target="_blank"
            rel="noreferrer"
          >
            <span className="min-w-0 text-left leading-[20px] tracking-[0.02em] text-[#1F3320] transition-colors duration-300 group-hover:!text-[#CDF178] md:whitespace-nowrap md:leading-[18px]">
              {SHOWCASE_COPY.cta}
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1F3320] text-[#CDF178] transition-colors duration-300 group-hover:bg-[#CDF178] group-hover:text-[#004000] md:h-[40px] md:w-[40px] xl:h-[46px] xl:w-[46px]">
              <ArrowRight size={22} className="transition-transform duration-300 group-hover:rotate-45 md:hidden" />
              <ArrowUpRight size={22} className="hidden transition-transform duration-300 group-hover:rotate-45 md:block" />
            </span>
          </a>

          <small className="mt-11 text-right font-body text-[13px] italic text-[#6b7280] md:mt-2 md:text-center md:text-[10px] xl:text-right">
            {SHOWCASE_COPY.terms}
          </small>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------
   Halaman
   ------------------------------------------------------------------------- */
function MembershipPage() {
  const [selectedSport, setSelectedSport] = useState('badminton')

  const handleSubmitMembership = () => {
    // TODO: sambungkan ke services/membershipService.js (POST /membership)
    console.log({ selectedSport })
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      <main className="mx-auto max-w-[1288px] px-6 pb-32 pt-4 md:pb-16 md:pt-10">
        {/* ================= Section showcase membership ================= */}
        <MembershipShowcase />

        <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-6">
          <a
            href="#membership-details"
            className="block w-full rounded-xl border-2 border-[#121212] bg-white p-4 text-left transition-colors hover:bg-[#F8FAF4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000] md:rounded-2xl md:px-6 md:py-7"
          >
            <h2 className="font-heading text-[13px] font-bold leading-snug text-[#404F14] md:text-lg">
              <span className="md:hidden">OBC Sports Membership</span>
              <span className="hidden md:inline">Sports Membership (Sewa Rutin 4x Sesi)</span>
            </h2>
            <p className="mt-2 text-[10px] leading-snug text-[#121212] md:text-sm md:leading-relaxed">
              Amankan jadwal dan jam langganan lapangan Anda setiap minggu. Nikmati garansi slot
              utama dan diskon hemat 20% khusus pembayaran di muka.
            </p>
          </a>

          {/* ================= Konten: Sports Membership ================= */}
          <section
            id="membership-details"
            className="w-full scroll-mt-20 md:rounded-2xl md:border md:border-[#E5E5E5] md:bg-white md:p-6 md:shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
          >
            {/* Judul mobile */}
            <h3 className="font-heading text-xl font-bold leading-snug text-[#343133] md:hidden">
              Amankan Jadwal Rutin Anda, Main Tanpa Khawatir
            </h3>

            {/* Judul & deskripsi desktop */}
            <h3 className="hidden font-heading text-xl font-bold text-[#121212] md:block">
              Booking Rutin 4x Sesi, Slot Lapangan Dijamin Aman
            </h3>
            <p className="mt-1 hidden text-sm text-[#6F6B6E] md:block">
              Nikmati kemudahan bermain di hari dan jam yang sama setiap minggu dengan potongan
              harga spesial.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {SPORT_OPTIONS.map((sport) => {
                const isSelected = selectedSport === sport.id
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSport(sport.id)}
                    className={`min-w-0 cursor-pointer rounded-lg p-3 text-left transition-colors md:h-[87px] md:p-0 md:text-center ${
                      isSelected
                        ? 'border-2 border-[#404F14] bg-[#F5FAF3]'
                        : 'border border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <p className="font-heading text-sm font-bold text-[#121212] md:text-base">
                      {sport.name}
                    </p>
                    <p className="mt-2 font-heading text-sm font-bold text-[#404F14] md:mt-1">
                      {sport.amount}
                      <span className="hidden md:inline"> / {sport.unit}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6F6B6E] md:hidden">
                      /{sport.unit.toLowerCase()}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Kotak keuntungan member */}
            <div className="mt-5 flex gap-2 rounded-lg border border-dashed border-[#404F14] bg-[#EFF6EC] px-3 py-3">
              <span aria-hidden="true">💳</span>
              <p className="text-sm leading-relaxed text-[#404F14]">
                <span className="font-heading font-bold">Keuntungan Member:</span> Garansi slot
                jam utama tidak direbut orang lain, serta diskon langsung 20% untuk pembayaran
                penuh di muka (<em>full payment</em>).
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmitMembership}
              className="mt-5 h-12 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-base font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] md:h-[42px] md:rounded-lg md:text-sm"
            >
              <span className="md:hidden">Daftar Membership</span>
              <span className="hidden md:inline">Lanjutkan Pembayaran Membership</span>
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MembershipPage