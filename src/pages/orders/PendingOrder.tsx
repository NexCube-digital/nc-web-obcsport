import { useLocation, useNavigate } from 'react-router-dom'
import NavbarDashboard from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface PendingState {
  transactionId?: string
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// TODO: nomor WhatsApp admin sementara hardcode, ambil dari konfigurasi
const ADMIN_WA_URL = 'https://wa.me/6281234567890'

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const DEFAULT_TRANSACTION_ID = 'OBC-20260112-985A'
const ESTIMATED_WAIT = '< 1 Menit'

const NEXT_STEPS: string[] = [
  'E-tiket resmi akan dikirim via Email & WhatsApp begitu sukses.',
  'Halaman ini akan otomatis di-refresh real-time jika pembayaran terdeteksi.',
]

function PendingOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as PendingState | null) ?? {}
  const transactionId = state.transactionId ?? DEFAULT_TRANSACTION_ID

  // TODO: polling / websocket status pembayaran, lalu navigate ke
  // '/pembayaran/berhasil' atau '/pembayaran/gagal' sesuai hasilnya.

  return (
    <div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} showDesktopNavigation={false} />

      <main className="mx-auto w-full max-w-[1248px] flex-1 px-6 pb-16 pt-6">
        {/* Kartu: lebar 600px sesuai desain */}
        <section className="mx-auto w-full max-w-[600px] rounded-2xl border border-[#D4D4D4] bg-white p-8">
          {/* Spinner */}
          <div className="flex justify-center">
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              className="motion-safe:animate-[spin_2s_linear_infinite]"
              role="img"
              aria-label="Memproses pembayaran"
            >
              <path
                d="M48.8 16 A24 24 0 1 1 36.2 5.4"
                stroke="#404F14"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="46" cy="9" r="3.5" fill="#265021" />
            </svg>
          </div>

          <h1
            className={`${FONT_MONTSERRAT} mt-6 text-center text-xl font-bold leading-7 text-[#343133]`}
          >
            Menunggu Konfirmasi Pembayaran
          </h1>
          <p className="mx-auto mt-1 max-w-[340px] text-center font-heading text-xs leading-[18px] text-[#343133]">
            Kami sedang memverifikasi transaksi QRIS/Transfer Anda secara otomatis. Mohon
            tunggu beberapa saat.
          </p>

          <hr className="mt-5 border-[#D4D4D4]" />

          {/* Info transaksi */}
          <dl className="mt-5 space-y-2 rounded-lg bg-[#FDFCF7] px-3 py-3 font-heading text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-[#343133]">Status Transaksi</dt>
              <dd className="rounded bg-[#FDEBC8] px-2 py-1 text-[9px] font-bold leading-none text-[#D97706]">
                PENDING / VERIFIKASI
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#343133]">Estimasi Waktu Tunggu</dt>
              <dd className="font-bold text-[#121212]">{ESTIMATED_WAIT}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#343133]">ID Transaksi</dt>
              <dd className="font-bold text-[#404F14]">{transactionId}</dd>
            </div>
          </dl>

          {/* Langkah selanjutnya */}
          <h2 className="mt-5 font-heading text-xs font-bold text-[#121212]">
            Langkah Selanjutnya:
          </h2>
          <ul className="mt-2 space-y-2 font-heading text-[11px] leading-4 text-[#343133]">
            {NEXT_STEPS.map((step) => (
              <li key={step}>
                <span aria-hidden="true">✓</span> {step}
              </li>
            ))}
          </ul>

          {/* Aksi */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="h-11 w-[181px] shrink-0 cursor-pointer rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] font-heading text-[13px] font-bold text-[#404F14] transition-colors hover:bg-[#F5F4EA]"
            >
              Kembali ke Beranda
            </button>
            <a
              href={ADMIN_WA_URL}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
            >
              Hubungi Bantuan WA
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default PendingOrder