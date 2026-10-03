import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavbarDashboard from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type PaymentMethodId = 'qris' | 'bca-va'

interface PaymentMethod {
  id: PaymentMethodId
  badge: string
  name: string
  description: string
}

interface PaymentGroup {
  id: string
  label: string
  methods: PaymentMethod[]
}

// Data yang dikirim dari halaman DetailOrder lewat navigate('/checkout', { state })
interface CheckoutState {
  date?: string
  time?: string
  endTime?: string
  total?: number
}

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/paymentService.js)
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// TODO: nama fasilitas sementara statis, ambil dari data lapangan yang dipilih
const FACILITY_NAME = 'Lapangan Futsal Premium'

// TODO: kode promo & biaya layanan sementara hardcode, ambil dari API
const PROMO_CODE = 'OBCMABAR'
const PROMO_PERCENT = 0.1
const SERVICE_FEE = 2000

// Fallback bila halaman dibuka tanpa state (sesuai desain)
const DEFAULT_DATE = 'Senin, 12 Januari 2026'
const DEFAULT_START = '08:00'
const DEFAULT_END = '10:00'
const DEFAULT_SUBTOTAL = 250000

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    id: 'instant',
    label: 'INSTANT QRIS (REKOMENDASI)',
    methods: [
      {
        id: 'qris',
        badge: 'QRIS',
        name: 'QRIS',
        description: 'Konfirmasi instan otomatis tanpa ribet',
      },
    ],
  },
  {
    id: 'va',
    label: 'VIRTUAL ACCOUNT',
    methods: [
      {
        id: 'bca-va',
        badge: 'BCA VA',
        name: 'BCA Virtual Account',
        description: 'Verifikasi otomatis 24 Jam',
      },
    ],
  },
]

/* -------------------------------------------------------------------------
   Fungsi bantu
   ------------------------------------------------------------------------- */
const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

const hourOf = (time: string) => Number(time.split(':')[0])

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as CheckoutState | null) ?? {}

  const [method, setMethod] = useState<PaymentMethodId>('qris')

  /* ---------- Turunan data pesanan ---------- */
  const date = state.date ?? DEFAULT_DATE
  const startTime = state.time ?? DEFAULT_START
  const endTime = state.endTime ?? DEFAULT_END
  const subtotal = state.total ?? DEFAULT_SUBTOTAL

  const hours = Math.max(hourOf(endTime) - hourOf(startTime), 1)
  const pricePerHour = Math.round(subtotal / hours / 1000)
  const promo = Math.round(subtotal * PROMO_PERCENT)
  const total = subtotal - promo + SERVICE_FEE

  /* ---------- Handler ---------- */
  const handlePay = () => {
    // TODO: kirim ke API pembayaran (services/paymentService.js) dengan metode terpilih,
    // lalu arahkan ke halaman instruksi pembayaran / riwayat sesuai route sebenarnya
    navigate('/riwayat', {
      state: { method, date, startTime, endTime, total },
    })
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-6 pt-6 pb-16">
        <h1 className={`${FONT_MONTSERRAT} font-bold text-[26px] leading-9 text-[#343133]`}>
          Pembayaran &amp; Checkout
        </h1>
        <p className="mt-0.5 font-heading text-[13px] leading-5 text-[#343133]">
          Selesaikan transaksi Anda dengan memilih opsi pembayaran di bawah ini.
        </p>

        <div className="mt-5 grid lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* ================= Kolom kiri: metode pembayaran ================= */}
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
            <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
              Pilih Metode Pembayaran
            </h2>

            <div role="radiogroup" aria-label="Metode pembayaran">
              {PAYMENT_GROUPS.map((group, groupIndex) => (
                <div key={group.id} className={groupIndex === 0 ? 'mt-4' : 'mt-4'}>
                  <h3 className={`${FONT_MONTSERRAT} font-bold text-[11px] text-[#404F14]`}>
                    {group.label}
                  </h3>

                  {group.methods.map((item) => {
                    const isActive = method === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setMethod(item.id)}
                        className={`mt-2 flex h-14 w-full items-center gap-3 rounded-lg bg-white px-3 text-left cursor-pointer transition-colors ${
                          isActive
                            ? 'border-2 border-[#404F14]'
                            : 'border border-[#D4D4D4] hover:border-[#9AAD3E]'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-heading font-bold ${
                            isActive
                              ? 'bg-[#E6F0E0] text-[#404F14]'
                              : 'bg-[#F0F0F0] text-[#6F6B6E]'
                          }`}
                        >
                          {item.badge}
                        </span>
                        <span className="flex-1">
                          <span className="block font-heading font-semibold text-[13px] leading-[18px] text-[#343133]">
                            {item.name}
                          </span>
                          <span className="block font-heading text-[10px] leading-[14px] text-[#6F6B6E]">
                            {item.description}
                          </span>
                        </span>
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            isActive ? 'bg-[#404F14]' : 'border border-[#D4D4D4] bg-white'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Peringatan cashless */}
            <div className="mt-4 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-2 py-2">
              <p className="font-heading text-[10px] leading-4 text-[#C00000]">
                <span aria-hidden="true">⚠️</span> Sistem OBC Sport Center sepenuhnya cashless.
                Pembayaran di tempat (COD) tidak didukung untuk mengamankan slot secara real-time.
              </p>
            </div>
          </section>

          {/* ================= Kolom kanan: ringkasan ================= */}
          <div>
            <section className="rounded-2xl border border-[#D4D4D4] bg-white p-5">
              <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                Detail Reservasi
              </h2>

              <dl className="mt-3 space-y-2 font-heading text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">Fasilitas</dt>
                  <dd className="font-bold text-[#121212]">{FACILITY_NAME}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">Tanggal</dt>
                  <dd className="font-bold text-[#121212]">{date}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">Waktu</dt>
                  <dd className="font-bold text-[#404F14]">
                    {startTime} - {endTime} ({hours} Jam)
                  </dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />

              <h2 className={`${FONT_MONTSERRAT} font-semibold text-base text-[#343133]`}>
                Rincian Biaya
              </h2>

              <dl className="mt-3 space-y-2 font-heading text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">
                    Sewa Lapangan (Rp {pricePerHour}k x {hours})
                  </dt>
                  <dd className="text-[#343133]">{formatRupiah(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#404F14]">Promo ({PROMO_CODE})</dt>
                  <dd className="font-bold text-[#404F14]">-{formatRupiah(promo)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6F6B6E]">Biaya Layanan</dt>
                  <dd className="text-[#343133]">{formatRupiah(SERVICE_FEE)}</dd>
                </div>
              </dl>

              <hr className="my-3 border-[#D4D4D4]" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-heading font-bold text-[13px] text-[#121212]">
                  Total Bayar
                </span>
                <span className={`${FONT_MONTSERRAT} font-bold text-xl text-[#404F14]`}>
                  {formatRupiah(total)}
                </span>
              </div>
            </section>

            <button
              type="button"
              onClick={handlePay}
              className="mt-4 h-10 w-full rounded-lg bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] cursor-pointer"
            >
              Konfirmasi &amp; Bayar
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PaymentPage