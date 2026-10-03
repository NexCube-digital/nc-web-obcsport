import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface QuickBookItem {
  id: string
  name: string
  price: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/facilityService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user disini sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

const QUICK_BOOK_ITEMS: QuickBookItem[] = [
  { id: 'futsal-premium', name: 'Lapangan Futsal Premium', price: 'Mulai Rp 125.000 / Jam' },
  { id: 'badminton-vip', name: 'Badminton VIP Court', price: 'Mulai Rp 80.000 / Jam' },
  { id: 'billiard-premium', name: 'Meja Billiard Premium', price: 'Mulai Rp 60.000 / Jam' },
]

function HistoryPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FFFFF7] font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* ================= Kolom kiri: empty state ================= */}
          <div>
            {/* TODO: ganti dengan ilustrasi asli, sementara pakai placeholder logo + angka */}
            <div className="rounded-2xl bg-[#EDEFE6] h-72 flex flex-col items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#004000]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#004000] text-lg font-heading font-bold text-white">
                  8
                </div>
              </div>
              <span className="font-heading font-bold text-lg text-[#004000]">
                OBC Sport Center
              </span>
            </div>

            <h1 className="mt-8 font-heading font-bold text-4xl leading-tight text-[#343133]">
              Belum Ada Jadwal Lapangan Aktif
            </h1>
            <p className="mt-4 text-[#6F6B6E] text-base leading-relaxed max-w-md">
              Anda belum memiliki transaksi booking aktif saat ini. Jelajahi
              ketersediaan lapangan premium kami dan mulailah berolahraga bersama
              komunitas OBC hari ini!
            </p>
          </div>

          {/* ================= Kolom kanan: pesan lapangan cepat ================= */}
          <div className="rounded-3xl border border-[#E2DFD2] p-6">
            <h2 className="font-heading font-bold text-lg text-[#343133]">
              Pesan Lapangan Sekarang
            </h2>

            <div className="mt-4 space-y-3">
              {QUICK_BOOK_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-[#E2DFD2] px-5 py-4"
                >
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[#343133]">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-[#6F6B6E]">{item.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/booking/${item.id}`)} // TODO: sesuaikan ke route booking sebenarnya
                    className="flex items-center gap-1 text-sm font-heading font-bold text-[#004000] cursor-pointer"
                  >
                    Booking
                    <Zap size={14} className="fill-[#F5C518] text-[#F5C518]" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate('/fasilitas')} // TODO: sesuaikan ke route daftar fasilitas
              className="mt-4 w-full rounded-lg bg-[#1A1A1A] py-3 text-sm font-heading font-bold text-white hover:bg-black transition-colors cursor-pointer"
            >
              Cari Lapangan Lain
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default HistoryPage