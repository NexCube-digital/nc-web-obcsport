import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import NavbarDashboard from '../components/layout/Navbar'
import MobileHeader from '../components/layout/MobileHeader'
import Footer from '../components/layout/Footer'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface FaqItem {
  id: string
  question: string
  answer: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/faqService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'batal-pemesanan',
    question: 'Bagaimana cara membatalkan pemesanan?',
    answer:
      'Pembatalan sewa lapangan dapat dilakukan maksimal 24 jam sebelum jadwal main melalui menu Riwayat Transaksi.',
  },
  {
    id: 'akademi-futsal',
    question: 'Apakah tersedia akademi pelatihan futsal?',
    answer:
      'Ya! OBC Academy menyediakan pelatihan berlisensi internasional untuk kelompok umur anak hingga remaja.',
  },
  {
    id: 'e-ticket-qr',
    question: 'Bagaimana cara menggunakan e-ticket QR Code?',
    answer:
      'Cukup tunjukkan QR Code dari detail transaksi Anda ke petugas kasir saat tiba di OBC Sport Center.',
  },
  {
    id: 'kartu-kredit',
    question: 'Apakah OBC mendukung pembayaran kartu kredit?',
    answer:
      'Ya, kami mendukung transaksi digital menggunakan QRIS otomatis, transfer bank, dan kartu kredit.',
  },
]

// TODO: ganti dengan nomor WhatsApp customer service yang sebenarnya
const CS_WHATSAPP_NUMBER = '628123456789'
const CS_WHATSAPP_MESSAGE = 'Halo, saya butuh bantuan terkait layanan OBC Sport Center.'

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // State khusus mobile: FAQ yang sedang terbuka (awal: item pertama, sesuai desain)
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id)

  const filteredFaqs = FAQ_ITEMS.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleContactWhatsApp = () => {
    const url = `https://wa.me/${CS_WHATSAPP_NUMBER}?text=${encodeURIComponent(CS_WHATSAPP_MESSAGE)}`
    window.open(url, '_blank')
  }

  const handleToggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <div className="hidden md:block">
        <NavbarDashboard userName={USER_NAME} />
      </div>
      <div className="md:hidden">
        <MobileHeader variant="title" title="Bantuan & QnA" />
      </div>

      {/* ===================================================================
          TAMPILAN MOBILE (< md)
          Warna & font mengikuti versi PC
          =================================================================== */}
      <div className="md:hidden px-4 pt-5 pb-44">
        <p className="mt-2 font-heading text-xs text-[#6F6B6E]">
          Pertanyaan populer dan panduan pusat olahraga
        </p>

        {/* Pencarian */}
        <div className="relative mt-4">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6F6B6E]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari solusi permasalahan Anda disini..."
            className="h-12 w-full rounded-full border border-[#D4D4D4] bg-white pl-11 pr-4 text-sm placeholder:text-[#6F6B6E] focus:outline-none focus:border-[#404F14]"
          />
        </div>

        {/* Daftar FAQ (accordion) */}
        <div className="mt-6 space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id
            return (
              <div
                key={faq.id}
                className={`rounded-xl bg-white ${
                  isOpen ? 'border-2 border-[#404F14]' : 'border border-[#D4D4D4]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer"
                >
                  <h3 className="min-w-0 flex-1 truncate font-heading font-bold text-sm text-[#343133]">
                    {faq.question}
                  </h3>
                  <Plus
                    size={14}
                    className={`shrink-0 text-[#004000] transition-transform ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-[#343133]">{faq.answer}</p>
                )}
              </div>
            )
          })}

          {filteredFaqs.length === 0 && (
            <p className="text-sm text-[#6F6B6E] py-6 text-center">
              Tidak ada pertanyaan yang cocok dengan pencarian Anda.
            </p>
          )}
        </div>

        {/* Tombol WhatsApp (fixed, di atas bottom nav)
            Catatan: bottom-[68px] disesuaikan dengan tinggi bottom nav di Navbar.
            Jika tinggi bottom nav berubah, sesuaikan angka ini. */}
        <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-30 border-t border-[#D4D4D4] bg-white px-4 py-3">
          <button
            type="button"
            onClick={handleContactWhatsApp}
            className="h-12 w-full rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] cursor-pointer"
          >
            Hubungi Admin Hub via WhatsApp
          </button>
        </div>
      </div>

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      {/* Lebar konten 1068px sesuai desain */}
      <main className="hidden md:block max-w-[1116px] mx-auto px-6 pt-5 pb-16">
        <span className="inline-block rounded-full bg-[#E8EDE3] px-3 py-2 text-xs font-heading font-bold text-[#404F14] tracking-wide">
          DUKUNGAN PELANGGAN &amp; FAQ
        </span>

        {/* Lebar dibatasi supaya judul pecah jadi 2 baris seperti desain */}
        <h1 className="mt-4 max-w-[440px] font-heading font-bold text-4xl leading-tight text-[#343133]">
          Ada yang Bisa Kami Bantu?
        </h1>

        {/* Kolom kiri 540px, kolom kanan fleksibel (480px), jarak 48px */}
        <div className="mt-6 grid lg:grid-cols-[540px_1fr] gap-12 items-start">
          {/* ================= Kolom kiri: pencarian & FAQ ================= */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari solusi permasalahan Anda disini..."
              className="w-full h-[45px] rounded-lg border border-[#D4D4D4] bg-white px-3 text-sm placeholder:text-[#6F6B6E] focus:outline-none focus:border-[#404F14]"
            />

            <div className="mt-6 space-y-3">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-[#D4D4D4] bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-heading font-bold text-base text-[#343133]">
                      {faq.question}
                    </h3>
                    <Plus size={14} className="mt-1 shrink-0 text-[#004000]" />
                  </div>
                  <p className="mt-2 text-sm text-[#343133] leading-relaxed">{faq.answer}</p>
                </div>
              ))}

              {filteredFaqs.length === 0 && (
                <p className="text-sm text-[#6F6B6E] py-6 text-center">
                  Tidak ada pertanyaan yang cocok dengan pencarian Anda.
                </p>
              )}
            </div>
          </div>

          {/* ================= Kolom kanan: hubungi customer service ================= */}
          <div className="lg:mt-4 rounded-2xl border border-[#D4D4D4] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="font-heading font-bold text-lg text-[#343133]">
              Hubungi Customer Service
            </h2>
            <p className="mt-4 text-sm text-[#343133] leading-relaxed">
              Butuh bantuan mendesak terkait transaksi atau sewa lapangan kelompok
              besar / turnamen korporat? Hubungi tim support admin kami melalui pesan
              langsung WhatsApp.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-sm font-heading font-bold text-[#404F14]">
                Admin WhatsApp Sedang Online (Respons Cepat)
              </span>
            </div>

            {/* Tombol tidak selebar kartu, mengikuti desain (306px) */}
            <button
              type="button"
              onClick={handleContactWhatsApp}
              className="mt-5 w-full max-w-[306px] h-10 rounded-lg bg-[#CDF178] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              Hubungi Hub WhatsApp Kami
            </button>
          </div>
        </div>
      </main>

      {/* Footer hanya tampil di desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}

export default HelpPage