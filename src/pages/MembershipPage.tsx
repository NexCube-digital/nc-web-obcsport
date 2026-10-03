import { useState } from 'react'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import footballHero from '../assets/figma/member.jpg'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type TabType = 'membership' | 'academy'

interface AcademyClass {
  id: string
  title: string
  description: string
  price: string
}

interface ScheduleRow {
  id: string
  day: string
  times: string[]
  classes: string[]
}

interface SportOption {
  id: string
  name: string
  price: string
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
    description:
      'Fokus pada penguasaan teknik dasar, pengenalan peraturan olahraga, koordinasi motorik, dan kesenangan dalam bermain.',
    price: 'Rp 150.000 / bulan',
  },
  {
    id: 'intermediate',
    title: 'Intermediate Class',
    description:
      'Pengembangan taktik permainan tingkat menengah, latihan fisik terfokus, simulasi pertandingan, dan mental kompetitif.',
    price: 'Rp 125.000 / bulan',
  },
  {
    id: 'liga-pro',
    title: 'Liga Class',
    description:
      'Pelatihan atlet profesional untuk persiapan liga kompetitif daerah. Strategi tim tingkat tinggi dan analisis video.',
    price: 'Rp 175.000 / bulan',
  },
]

// Jadwal tetap mingguan (sama untuk semua kelas, sesuai desain)
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

const ACADEMY_STRUCTURE: { label: string; value: string }[] = [
  { label: 'Pelatih', value: '4 Pelatih (Termasuk Kiper)' },
  { label: 'Official', value: '2 Orang Official' },
  { label: 'Lokasi', value: 'Lapangan F1 & F2' },
  { label: 'Kelompok', value: 'Usia & Level Kemampuan' },
  { label: 'Fokus Utama', value: 'Skill, Fisik, & Karakter' },
]

const SPORT_OPTIONS: SportOption[] = [
  { id: 'futsal', name: 'Futsal', price: 'Rp 500.000 / 4x Sesi' },
  { id: 'badminton', name: 'Badminton', price: 'Rp 240.000 / 4x Sesi' },
  { id: 'basket', name: 'Basket', price: 'Rp 600.000 / 4x Sesi' },
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
      <NavbarDashboard userName={USER_NAME} />

      <main className="max-w-[1288px] mx-auto px-6 pt-10 pb-16">
        {/* ================= Hero foto (ukuran tidak diubah) ================= */}
        <div className="h-72 overflow-hidden rounded-2xl bg-[#111111]">
          <img
            src={footballHero}
            alt="Foto sepak bola OBC Sport Center"
            className="h-full w-full object-cover [object-position:40%_40%]"
          />
        </div>

        {/* ================= Judul & badge ================= */}
        <span className="mt-6 inline-block rounded-full bg-[#E8EDE3] px-4 py-2 text-xs font-heading font-bold text-[#404F14] tracking-wide">
          OBC MEMBERSHIP
        </span>
        <h1 className="mt-2 font-heading font-bold text-3xl text-[#343133]">
          Kembangkan Bakat Olahragamu Bersama Pelatih Profesional
        </h1>

        {/* ================= Toggle Sports Membership / OBC Academy ================= */}
        <div className="mt-6 flex flex-wrap gap-3.5">
          <button
            type="button"
            onClick={() => setActiveTab('membership')}
            className={`w-[387px] h-[210px] text-left rounded-2xl bg-white pl-[54px] pr-4 pt-7 transition-shadow cursor-pointer ${
              activeTab === 'membership'
                ? 'border border-[#121212]'
                : 'border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
            }`}
          >
            <h2 className="font-heading font-bold text-lg text-[#404F14]">
              Sports Membership
              <br />
              (Sewa Rutin 4x Sesi)
            </h2>
            <p className="mt-2 text-sm text-[#121212] leading-relaxed">
              Amankan jadwal dan jam langganan lapangan Anda setiap minggu. Nikmati
              garansi slot utama dan diskon hemat 20% khusus pembayaran di muka
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academy')}
            className={`w-[387px] h-[210px] text-left rounded-2xl bg-white pl-[54px] pr-4 pt-7 transition-shadow cursor-pointer ${
              activeTab === 'academy'
                ? 'border border-[#121212]'
                : 'border border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
            }`}
          >
            <h2 className="font-heading font-bold text-lg text-[#404F14]">
              OBC Academy
              <br />
              (Kelas Pelatihan)
            </h2>
            <p className="mt-2 text-sm text-[#121212] leading-relaxed">
              Tingkatkan skill dan teknik bermain Anda bersama pelatih profesional.
              Tersedia kelas berjenjang untuk pemula hingga tingkat lanjut.
            </p>
          </button>
        </div>

        {/* ================= Konten: Sports Membership ================= */}
        {activeTab === 'membership' && (
          <section className="mt-6 w-full max-w-[772px] rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <h3 className="font-heading font-bold text-xl text-[#121212]">
              Booking Rutin 4x Sesi - Jamin Slot Lapangan Aman
            </h3>
            <p className="mt-1 text-sm text-[#6F6B6E]">
              Nikmati kemudahan bermain di hari dan jam yang sama setiap minggunya
              dengan potongan harga spesial.
            </p>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {SPORT_OPTIONS.map((sport) => {
                const isSelected = selectedSport === sport.id
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSport(sport.id)}
                    className={`h-[87px] rounded-lg text-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#404F14] bg-[#F5FAF3]'
                        : 'border border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <p className="font-heading font-bold text-base text-[#121212]">
                      {sport.name}
                    </p>
                    <p className="mt-1 font-heading font-bold text-sm text-[#404F14]">
                      {sport.price}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Kotak keuntungan member */}
            <div className="mt-5 flex gap-2 rounded-lg border border-dashed border-[#404F14] bg-[#EFF6EC] px-3 py-3">
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
              className="mt-5 w-full h-[42px] rounded-lg bg-[#CDF178] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              Lanjutkan Pembayaran Membership
            </button>
          </section>
        )}

        {/* ================= Konten: OBC Academy ================= */}
        {activeTab === 'academy' && (
          <section className="mt-6">
            <span className="inline-block rounded-full bg-[#E8EDE3] px-4 py-2 text-xs font-heading font-bold text-[#404F14] tracking-wide">
              OBC ACADEMY
            </span>
            <h2 className="mt-2 font-heading font-bold text-2xl text-[#343133]">
              OBC ACADEMY FUTSAL
            </h2>

            {/* Pilihan kelas */}
            <div className="mt-6 grid sm:grid-cols-3 gap-4 max-w-[780px]">
              {ACADEMY_CLASSES.map((item) => {
                const isSelected = selectedClass === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedClass(item.id)}
                    className={`text-left rounded-xl bg-white p-4 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#404F14]'
                        : 'border border-[#D4D4D4]'
                    }`}
                  >
                    <h3 className="font-heading font-bold text-base text-[#404F14]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#6F6B6E] leading-relaxed">
                      {item.description}
                    </p>
                    <p className="mt-3 font-heading font-bold text-sm text-[#343133]">
                      {item.price}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Jadwal latihan */}
            <div className="mt-4 w-full max-w-[756px] rounded-2xl border border-[#D4D4D4] bg-white p-6">
              <h3 className="font-heading font-bold text-lg text-[#343133]">
                Jadwal Latihan OBC Academy
              </h3>
              <p className="mt-1 text-sm text-[#6F6B6E]">
                Program pelatihan reguler dan profesional dengan jadwal tetap mingguan.
              </p>

              <div className="mt-8 flex flex-col md:flex-row items-start justify-center gap-5">
                {/* Struktur & operasional */}
                <div className="w-full md:w-[286px] shrink-0 rounded-lg border border-dashed border-[#D4D4D4] bg-[#F8F9FA] px-6 py-5">
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
                <table className="w-full md:w-[313px] shrink-0 border-collapse text-xs">
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

              <button
                type="button"
                onClick={handleRegisterAcademy}
                className="mt-7 w-full h-10 rounded-lg bg-[#CDF178] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
              >
                Daftar Academy Sekarang
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default MembershipPage