import { useState } from 'react'
import NavbarDashboard from '../components/layout/Navbar'
import MobileHeader from '../components/layout/MobileHeader'
import Footer from '../components/layout/Footer'
import footballHero from '../assets/figma/member.jpg'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type TabType = 'membership' | 'academy'

interface AcademyClass {
  id: string
  title: string
  mobileTitle: string
  description: string
  amount: string
  unit: string
}

interface ScheduleRow {
  id: string
  day: string
  times: string[]
  classes: string[]
}

interface MobileScheduleRow {
  id: string
  day: string
  time: string
  label: string
}

interface SportOption {
  id: string
  name: string
  amount: string
  unit: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/membershipService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

const ACADEMY_CLASSES: AcademyClass[] = [
  {
    id: 'beginner',
    title: 'Beginner Class',
    mobileTitle: 'Beginner',
    description:
      'Fokus pada penguasaan teknik dasar, pengenalan peraturan olahraga, koordinasi motorik, dan kesenangan dalam bermain.',
    amount: 'Rp 150.000',
    unit: 'bulan',
  },
  {
    id: 'intermediate',
    title: 'Intermediate Class',
    mobileTitle: 'Intermediate',
    description:
      'Pengembangan taktik permainan tingkat menengah, latihan fisik terfokus, simulasi pertandingan, dan mental kompetitif.',
    amount: 'Rp 125.000',
    unit: 'bulan',
  },
  {
    id: 'liga-pro',
    title: 'Liga Class',
    mobileTitle: 'Liga',
    description:
      'Pelatihan atlet profesional untuk persiapan liga kompetitif daerah. Strategi tim tingkat tinggi dan analisis video.',
    amount: 'Rp 175.000',
    unit: 'bulan',
  },
]

// Jadwal tetap mingguan (tampilan desktop)
const SCHEDULE_ROWS: ScheduleRow[] = [
  { id: 'senin', day: 'Senin', times: ['16:00 - 18:00'], classes: ['Beginner'] },
  { id: 'selasa', day: 'Selasa', times: ['16:00 - 18:00'], classes: ['Liga & Kiper'] },
  {
    id: 'rabu',
    day: 'Rabu',
    times: ['14:00 - 16:00', '16:00 - 18:00'],
    classes: ['Beginner', 'Intermediate'],
  },
  { id: 'kamis', day: 'Kamis', times: ['16:00 - 18:00'], classes: ['Liga'] },
  { id: 'jumat', day: 'Jum’at', times: ['16:00 - 18:00'], classes: ['Intermediate'] },
]

// Jadwal latihan mingguan (tampilan mobile, sesuai desain mobile)
const MOBILE_SCHEDULE_ROWS: MobileScheduleRow[] = [
  { id: 'senin', day: 'Senin', time: '16:00 - 18:00', label: 'Beginner Class' },
  { id: 'selasa', day: 'Selasa', time: '19:00 - 21:00', label: 'Liga Training' },
  { id: 'rabu', day: 'Rabu', time: '16:00 - 18:00', label: 'Intermediate' },
  { id: 'kamis', day: 'Kamis', time: '19:00 - 21:00', label: 'Beginner Class' },
  { id: 'jumat', day: 'Jumat', time: '18:00 - 20:00', label: 'Liga Training' },
]

const ACADEMY_STRUCTURE: { label: string; value: string }[] = [
  { label: 'Pelatih', value: '4 Pelatih (Termasuk Kiper)' },
  { label: 'Official', value: '2 Orang Official' },
  { label: 'Lokasi', value: 'Lapangan F1 & F2' },
  { label: 'Kelompok', value: 'Usia & Level Kemampuan' },
  { label: 'Fokus Utama', value: 'Skill, Fisik, & Karakter' },
]

const SPORT_OPTIONS: SportOption[] = [
  { id: 'futsal', name: 'Futsal', amount: 'Rp 500.000', unit: '4x Sesi' },
  { id: 'badminton', name: 'Badminton', amount: 'Rp 240.000', unit: '4x Sesi' },
  { id: 'basket', name: 'Basket', amount: 'Rp 600.000', unit: '4x Sesi' },
]

function MembershipPage() {
  const [activeTab, setActiveTab] = useState<TabType>('membership')
  const [selectedClass, setSelectedClass] = useState('intermediate')
  const [selectedSport, setSelectedSport] = useState('badminton')

  const handleSubmitMembership = () => {
    // TODO: sambungkan ke services/membershipService.js (POST /membership)
    console.log({ selectedSport })
  }

  const handleRegisterAcademy = () => {
    // TODO: sambungkan ke services/membershipService.js (POST /academy)
    console.log({ selectedClass })
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      {/* Navbar desktop (di mobile diganti header + bottom nav) */}
      <div className="hidden md:contents">
        <NavbarDashboard userName={USER_NAME} />
      </div>

      <div className="md:hidden">
        <MobileHeader variant="title" title="OBC Membership & Academy" />
      </div>

      <main className="max-w-[1288px] mx-auto px-6 pt-0 pb-32 md:pt-10 md:pb-16">
        {/* ================= Hero foto ================= */}
        <div className="h-[125px] md:h-72 overflow-hidden rounded-2xl bg-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.15)] md:shadow-none">
          <img
            src={footballHero}
            alt="Foto sepak bola OBC Sport Center"
            className="h-full w-full object-cover [object-position:40%_40%]"
          />
        </div>

        {/* ================= Judul & badge (desktop) ================= */}
        <div className="hidden md:block">
          <span className="mt-6 inline-block rounded-full bg-[#E8EDE3] px-4 py-2 text-xs font-heading font-bold text-[#404F14] tracking-wide">
            OBC MEMBERSHIP
          </span>
          <h1 className="mt-2 font-heading font-bold text-3xl text-[#343133]">
            Kembangkan Bakat Olahragamu Bersama Pelatih Profesional
          </h1>
        </div>

        {/* ================= Toggle Sports Membership / OBC Academy ================= */}
        <div className="mt-5 flex gap-3 md:mt-6 md:flex-wrap md:gap-3.5">
          <button
            type="button"
            onClick={() => setActiveTab('membership')}
            className={`min-w-0 flex-1 md:flex-none md:w-[387px] md:h-[210px] text-left rounded-xl md:rounded-2xl bg-white p-3 md:pl-[54px] md:pr-4 md:pt-7 transition-shadow cursor-pointer ${
              activeTab === 'membership'
                ? 'border-2 md:border border-[#121212]'
                : 'border-2 md:border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
            }`}
          >
            <h2 className="font-heading font-bold text-[13px] md:text-lg text-[#404F14] leading-snug">
              <span className="md:hidden">OBC Sports Membership</span>
              <span className="hidden md:inline">
                Sports Membership
                <br />
                (Sewa Rutin 4x Sesi)
              </span>
            </h2>
            <p className="mt-2 text-[10px] leading-snug md:text-sm md:leading-relaxed text-[#121212]">
              Amankan jadwal dan jam langganan lapangan Anda setiap minggu. Nikmati
              garansi slot utama dan diskon hemat 20% khusus pembayaran di muka
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academy')}
            className={`min-w-0 flex-1 md:flex-none md:w-[387px] md:h-[210px] text-left rounded-xl md:rounded-2xl bg-white p-3 md:pl-[54px] md:pr-4 md:pt-7 transition-shadow cursor-pointer ${
              activeTab === 'academy'
                ? 'border-2 md:border border-[#121212]'
                : 'border-2 md:border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
            }`}
          >
            <h2 className="font-heading font-bold text-[13px] md:text-lg text-[#404F14] leading-snug">
              <span className="md:hidden">OBC Sports Academy</span>
              <span className="hidden md:inline">
                OBC Academy
                <br />
                (Kelas Pelatihan)
              </span>
            </h2>
            <p className="mt-2 text-[10px] leading-snug md:text-sm md:leading-relaxed text-[#121212]">
              Tingkatkan skill dan teknik bermain Anda bersama pelatih profesional.
              Tersedia kelas berjenjang untuk pemula hingga tingkat lanjut.
            </p>
          </button>
        </div>

        {/* ================= Konten: Sports Membership ================= */}
        {activeTab === 'membership' && (
          <section className="mt-6 w-full md:max-w-[772px] md:rounded-2xl md:border md:border-[#E5E5E5] md:bg-white md:p-6 md:shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            {/* Judul mobile */}
            <h3 className="md:hidden font-heading font-bold text-xl leading-snug text-[#343133]">
              Amankan Jadwal Rutinmu, Main Tanpa Khawatir
            </h3>

            {/* Judul & deskripsi desktop */}
            <h3 className="hidden md:block font-heading font-bold text-xl text-[#121212]">
              Booking Rutin 4x Sesi - Jamin Slot Lapangan Aman
            </h3>
            <p className="hidden md:block mt-1 text-sm text-[#6F6B6E]">
              Nikmati kemudahan bermain di hari dan jam yang sama setiap minggunya
              dengan potongan harga spesial.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {SPORT_OPTIONS.map((sport) => {
                const isSelected = selectedSport === sport.id
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSport(sport.id)}
                    className={`min-w-0 rounded-lg p-3 text-left md:p-0 md:h-[87px] md:text-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#404F14] bg-[#F5FAF3]'
                        : 'border border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <p className="font-heading font-bold text-sm md:text-base text-[#121212]">
                      {sport.name}
                    </p>
                    <p className="mt-2 md:mt-1 font-heading font-bold text-sm text-[#404F14]">
                      {sport.amount}
                      <span className="hidden md:inline"> / {sport.unit}</span>
                    </p>
                    <p className="md:hidden mt-0.5 text-[11px] text-[#6F6B6E]">
                      /{sport.unit.toLowerCase()}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Kotak keuntungan member */}
            <div className="mt-5 flex gap-2 rounded-lg border border-dashed border-[#404F14] bg-[#EFF6EC] px-3 py-3 md:px-3">
              <span aria-hidden="true">💳</span>
              <p className="text-sm text-[#404F14] leading-relaxed">
                <span className="font-heading font-bold">Keuntungan Member:</span> Garansi
                slot jam utama tidak direbut orang lain, diskon langsung 20% untuk
                pembayaran penuh di muka (<em>full payment</em>).
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmitMembership}
              className="mt-5 w-full h-12 md:h-[42px] rounded-xl md:rounded-lg bg-[#CDF178] text-base md:text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              <span className="md:hidden">Daftar Membership</span>
              <span className="hidden md:inline">Lanjutkan Pembayaran Membership</span>
            </button>
          </section>
        )}

        {/* ================= Konten: OBC Academy ================= */}
        {activeTab === 'academy' && (
          <section className="mt-6">
            {/* Judul mobile */}
            <h3 className="md:hidden font-heading font-bold text-xl leading-snug text-[#343133]">
              Kembangkan Bakat Olahragamu Bersama Pelatih Profesional
            </h3>

            {/* Judul desktop */}
            <div className="hidden md:block">
              <span className="inline-block rounded-full bg-[#E8EDE3] px-4 py-2 text-xs font-heading font-bold text-[#404F14] tracking-wide">
                OBC ACADEMY
              </span>
              <h2 className="mt-2 font-heading font-bold text-2xl text-[#343133]">
                OBC ACADEMY FUTSAL
              </h2>
            </div>

            {/* Pilihan kelas */}
            <div className="mt-4 md:mt-6 grid grid-cols-3 gap-3 md:gap-4 md:max-w-[780px]">
              {ACADEMY_CLASSES.map((item) => {
                const isSelected = selectedClass === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedClass(item.id)}
                    className={`min-w-0 text-left rounded-lg md:rounded-xl bg-white p-3 md:p-4 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#404F14]'
                        : 'border border-[#D4D4D4]'
                    }`}
                  >
                    <h3 className="font-heading font-bold text-sm md:text-base text-[#404F14] break-words">
                      <span className="md:hidden">{item.mobileTitle}</span>
                      <span className="hidden md:inline">{item.title}</span>
                    </h3>
                    <p className="hidden md:block mt-2 text-sm text-[#6F6B6E] leading-relaxed">
                      {item.description}
                    </p>
                    <p className="mt-2 md:mt-3 font-heading font-bold text-sm text-[#343133]">
                      {item.amount}
                      <span className="hidden md:inline"> / {item.unit}</span>
                    </p>
                    <p className="md:hidden mt-0.5 text-[11px] text-[#6F6B6E]">
                      /{item.unit}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Jadwal latihan */}
            <div className="mt-6 md:mt-4 w-full md:max-w-[756px] md:rounded-2xl md:border md:border-[#D4D4D4] md:bg-white md:p-6">
              {/* Judul jadwal mobile */}
              <h3 className="md:hidden font-heading font-bold text-base text-[#404F14]">
                Jadwal Latihan Mingguan
              </h3>

              {/* Judul jadwal desktop */}
              <h3 className="hidden md:block font-heading font-bold text-lg text-[#343133]">
                Jadwal Latihan OBC Academy
              </h3>
              <p className="hidden md:block mt-1 text-sm text-[#6F6B6E]">
                Program pelatihan reguler dan profesional dengan jadwal tetap mingguan.
              </p>

              {/* Daftar jadwal mobile */}
              <ul className="md:hidden mt-3 rounded-2xl border border-[#E5E5E5] bg-white px-5 py-3">
                {MOBILE_SCHEDULE_ROWS.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-heading font-bold text-sm text-[#121212]">
                        {row.day}
                      </p>
                      <p className="text-xs text-[#6F6B6E]">{row.time}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#EEFBEA] px-3 py-1.5 text-[11px] font-heading font-bold text-[#404F14]">
                      {row.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Struktur + tabel jadwal desktop */}
              <div className="hidden md:flex mt-8 items-start justify-center gap-5">
                {/* Struktur & operasional */}
                <div className="w-[286px] shrink-0 rounded-lg border border-dashed border-[#D4D4D4] bg-[#F8F9FA] px-6 py-5">
                  <h4 className="font-heading font-bold text-xs text-[#404F14]">
                    Struktur &amp; Operasional Academy
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {ACADEMY_STRUCTURE.map((item) => (
                      <li key={item.label} className="flex gap-2 text-xs text-[#121212]">
                        <span aria-hidden="true">•</span>
                        <span>
                          <span className="font-heading font-bold">{item.label}</span>:{' '}
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tabel jadwal */}
                <table className="w-[313px] shrink-0 border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#404F14] text-white">
                      <th className="rounded-tl-lg py-2 pl-4 text-left font-heading font-bold">
                        Hari
                      </th>
                      <th className="py-2 text-left font-heading font-bold">Jam</th>
                      <th className="rounded-tr-lg py-2 text-left font-heading font-bold">
                        Kelas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCHEDULE_ROWS.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`${
                          index % 2 === 1 ? 'bg-[#EEFBEA]' : 'bg-white'
                        } ${index === SCHEDULE_ROWS.length - 1 ? 'border-b border-[#D4D4D4]' : ''}`}
                      >
                        <td className="py-2.5 pl-4 align-middle text-[#343133]">{row.day}</td>
                        <td className="py-2.5 align-middle text-[#343133]">
                          {row.times.map((time) => (
                            <div key={time}>{time}</div>
                          ))}
                        </td>
                        <td className="py-2.5 pr-3 align-middle text-[#004000]">
                          {row.classes.map((cls) => (
                            <div key={cls}>{cls}</div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Info promo mobile */}
              <div className="md:hidden mt-5 flex items-center gap-3 rounded-2xl bg-[#EEFBEA] px-4 py-4 text-[#404F14]">
                <span className="shrink-0">
                  <IconAward />
                </span>
                <p className="text-sm leading-relaxed">
                  Gabung hari ini dan dapatkan jersey latihan resmi OBC gratis serta
                  potongan sewa lapangan umum 15%!
                </p>
              </div>

              <button
                type="button"
                onClick={handleRegisterAcademy}
                className="mt-5 md:mt-7 w-full h-12 md:h-10 rounded-xl md:rounded-lg bg-[#CDF178] text-base md:text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
              >
                <span className="md:hidden">Daftar Academy OBC</span>
                <span className="hidden md:inline">Daftar Academy Sekarang</span>
              </button>
            </div>
          </section>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

    </div>
  )
}

export default MembershipPage