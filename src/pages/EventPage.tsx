import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/LandingFooter'
import whatsappIcon from '../assets/icon/whatsapp2.svg'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface ReservationStep {
  id: number
  title: string
  description: string
  maxWidth: string // lebar teks deskripsi per langkah, mengikuti pemisahan baris di desain
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/eventService.js jika perlu)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// Font heading di desain terlihat seperti Montserrat, pastikan sudah di-load
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const RESERVATION_STEPS: ReservationStep[] = [
  {
    id: 1,
    title: 'Konsultasi Awal',
    description:
      'Diskusikan kebutuhan lapangan, tanggal, durasi, serta layanan tambahan (sound system, panggung, wasit resmi).',
    maxWidth: 'max-w-[460px]',
  },
  {
    id: 2,
    title: 'Penerbitan Invoice & Penawaran',
    description:
      'Tim admin OBC akan menghitung estimasi biaya sesuai paket event khusus mabar korporat atau akademi.',
    maxWidth: 'max-w-[300px]',
  },
  {
    id: 3,
    title: 'Uang Muka (DP) & Locking Slot',
    description:
      'Pembayaran DP minimal 50% untuk mengamankan slot agar tidak terisi oleh penyewa regular lainnya.',
    maxWidth: 'max-w-[250px]',
  },
]

// TODO: ganti dengan nomor WhatsApp PIC Event yang sebenarnya
const PIC_WHATSAPP_NUMBER = '628123456789'
const PIC_WHATSAPP_MESSAGE = 'Halo, saya ingin bertanya tentang sewa event di OBC Sport Center.'

function OrderPage() {
  const handleContactWhatsApp = () => {
    const url = `https://wa.me/${PIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(PIC_WHATSAPP_MESSAGE)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
        {/* ================= Judul halaman ================= */}
        <h1 className={`${FONT_MONTSERRAT} font-bold text-2xl leading-8 text-[#343133]`}>
          Layanan Sewa Event &amp; Multi-Day OBC
        </h1>
        <p className="mt-1 text-sm leading-[21px] font-heading text-[#343133]">
          Penyelenggaraan turnamen korporat, liga komunitas, gathering, dan festival
          olahraga premium.
        </p>

        {/* Kiri fleksibel (740px), kanan 420px, jarak 40px */}
        <div className="mt-6 grid lg:grid-cols-[1fr_420px] gap-10">
          {/* ================= Ketentuan & alur reservasi ================= */}
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-6">
            <h2 className={`${FONT_MONTSERRAT} font-semibold text-lg leading-7 text-[#343133]`}>
              Ketentuan &amp; Alur Reservasi Event
            </h2>

            <div className="mt-4 space-y-4">
              {RESERVATION_STEPS.map((step) => (
                <div key={step.id} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6F0E0] text-sm font-heading font-bold text-[#265021]">
                    {step.id}
                  </span>
                  <div className={step.maxWidth}>
                    <h3 className={`${FONT_MONTSERRAT} font-semibold text-sm leading-5 text-[#343133]`}>
                      {step.title}
                    </h3>
                    <p className="text-xs leading-[18px] font-heading text-[#343133]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Kotak peringatan kebijakan pembatalan */}
            <div className="mt-6 flex items-start gap-1.5 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-3 py-3">
              <span className="text-xs leading-[18px]" aria-hidden="true">
                ⚠️
              </span>
              <p className="text-xs leading-[18px] font-heading text-[#C00000]">
                Kebijakan Pembatalan Event: Pembatalan kurang dari H-7 acara dikenakan
                denda hangus sebesar 50% dari total uang muka yang dibayarkan.
              </p>
            </div>
          </section>

          {/* ================= Kontak admin event ================= */}
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-6 flex flex-col">
            <h2 className={`${FONT_MONTSERRAT} font-semibold text-lg leading-7 text-[#343133]`}>
              Hubungi Admin Event
            </h2>
            <p className="mt-3 text-sm leading-5 font-heading text-[#343133]">
              Ada rencana event besar dalam waktu dekat? Langsung terhubung dengan PIC
              Event OBC Sport Center via WhatsApp untuk penawaran harga terbaik.
            </p>

            {/* Info PIC (tanpa kotak, hanya padding) */}
            <div className="mt-6 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <img src={whatsappIcon} alt="" aria-hidden="true" className="h-4 w-4 brightness-0 invert" />
                </span>
                <span className="font-heading font-semibold text-sm text-[#343133]">
                  Bpk. Hermawan (PIC Event)
                </span>
              </div>
              <p className="mt-3 text-[11px] font-heading text-[#343133]">
                Fast Response: Senin - Sabtu (08:00 - 18:00)
              </p>
            </div>

            {/* Tombol menempel di bawah kartu */}
            <button
              type="button"
              onClick={handleContactWhatsApp}
              className="mt-auto w-full h-10 rounded-lg bg-[#CDF178] text-[13px] font-heading font-semibold text-[#343133] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              Hubungi PIC Event via WA
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default OrderPage