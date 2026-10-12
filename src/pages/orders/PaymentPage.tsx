import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, Check } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import Footer from '../../components/layout/LandingFooter'
import PendingOrderModal from '../../components/ui/PendingOrderModal'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
type PaymentMethodId = 'qris' | 'bca-va'

// Metode pembayaran khusus tampilan mobile (lebih lengkap sesuai desain)
type MobileMethodId =
  | 'qris'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'bca-va'
  | 'mandiri'
  | 'bri'

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

interface MobileMethod {
  id: MobileMethodId
  badge: string
  name: string
}

interface MobileMethodGroup {
  id: string
  label: string
  methods: MobileMethod[]
}

interface ExtraItem {
  id: string
  name: string
  price: number
}

interface PendingPayment {
  method: string
  total: number
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

// TODO: lokasi sementara hardcode (tampilan mobile), ambil dari data lapangan
const FACILITY_LOCATION = 'OBC Sport Center, Bandung'

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

// TODO: sewa alat tambahan (mobile) sementara hardcode, ambil dari API
const EXTRA_ITEMS: ExtraItem[] = [
  { id: 'raket', name: 'Sewa Raket Tambahan', price: 20000 },
  { id: 'bola', name: 'Sewa Bola / Paddle', price: 15000 },
]

const MOBILE_METHOD_GROUPS: MobileMethodGroup[] = [
  {
    id: 'ewallet',
    label: 'E-WALLET (INSTAN)',
    methods: [
      { id: 'qris', badge: 'QRIS', name: 'QRIS (Gopay/OVO/Dana)' },
      { id: 'gopay', badge: 'GOPAY', name: 'GoPay' },
      { id: 'ovo', badge: 'OVO', name: 'OVO' },
      { id: 'dana', badge: 'DANA', name: 'DANA' },
    ],
  },
  {
    id: 'bank',
    label: 'TRANSFER BANK (VERIFIKASI MANUAL)',
    methods: [
      { id: 'bca-va', badge: 'BCA', name: 'BCA Virtual Account' },
      { id: 'mandiri', badge: 'MANDIRI', name: 'Mandiri Transfer' },
      { id: 'bri', badge: 'BRI', name: 'BRI Transfer' },
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

  // State khusus mobile: metode pembayaran & alat tambahan yang dicentang
  const [mobileMethod, setMobileMethod] = useState<MobileMethodId>('qris')
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['raket'])
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null)

  /* ---------- Turunan data pesanan ---------- */
  const date = state.date ?? DEFAULT_DATE
  const startTime = state.time ?? DEFAULT_START
  const endTime = state.endTime ?? DEFAULT_END
  const subtotal = state.total ?? DEFAULT_SUBTOTAL

  const hours = Math.max(hourOf(endTime) - hourOf(startTime), 1)
  const pricePerHour = Math.round(subtotal / hours / 1000)
  const promo = Math.round(subtotal * PROMO_PERCENT)
  const total = subtotal - promo + SERVICE_FEE

  /* ---------- Turunan data mobile ---------- */
  const extrasTotal = EXTRA_ITEMS.filter((item) => selectedExtras.includes(item.id)).reduce(
    (sum, item) => sum + item.price,
    0,
  )
  // Catatan: desain mobile tidak menampilkan promo, jadi tidak dihitung di total mobile.
  // Biaya Admin memakai SERVICE_FEE yang sama dengan versi PC.
  const mobileTotal = subtotal + SERVICE_FEE + extrasTotal

  /* ---------- Handler ---------- */
  const handlePay = () => {
    setPendingPayment({
      method: method === 'qris' ? 'QRIS' : 'BCA Virtual Account',
      total,
    })
  }

  const handleToggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handlePayMobile = () => {
    const selectedMethod = MOBILE_METHOD_GROUPS
      .flatMap((group) => group.methods)
      .find((item) => item.id === mobileMethod)

    setPendingPayment({
      method: selectedMethod?.name ?? mobileMethod,
      total: mobileTotal,
    })
  }

  return (
    <>
      
      <MobileHeader
        variant="title"
        title="Konfirmasi & Pembayaran"
        showShare
        showBottomNav={false}
      />
      <div className="md:hidden min-h-[100dvh] bg-white font-body text-[#343133] pb-28">

        <div className="px-4 pt-4">
          {/* Kartu reservasi + rincian biaya */}
          <section className="rounded-2xl border border-[#D4D4D4] bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0E0] text-[#404F14]">
                <CalendarDays size={18} />
              </span>
              <div className="min-w-0 font-heading">
                <h2 className={`${FONT_MONTSERRAT} font-bold text-base leading-snug text-[#343133]`}>
                  {FACILITY_NAME}
                </h2>
                <p className="mt-0.5 text-xs text-[#6F6B6E]">{FACILITY_LOCATION}</p>
                <p className="mt-0.5 text-xs text-[#6F6B6E]">{date}</p>
                <p className="mt-0.5 text-xs text-[#6F6B6E]">
                  {startTime} - {endTime}
                </p>
              </div>
            </div>

            <hr className="my-3 border-[#D4D4D4]" />

            <dl className="space-y-2 font-heading text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">Sewa Lapangan</dt>
                <dd className="text-[#343133]">{formatRupiah(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">Biaya Admin</dt>
                <dd className="text-[#343133]">{formatRupiah(SERVICE_FEE)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6F6B6E]">Sewa Tambahan</dt>
                <dd className="text-[#343133]">{formatRupiah(extrasTotal)}</dd>
              </div>
            </dl>

            <hr className="my-3 border-[#D4D4D4]" />

            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-[#121212]">
                Total Pembayaran
              </span>
              <span className={`${FONT_MONTSERRAT} font-bold text-lg text-[#404F14]`}>
                {formatRupiah(mobileTotal)}
              </span>
            </div>
          </section>

          {/* Sewa alat tambahan */}
          <h2 className={`${FONT_MONTSERRAT} mt-6 font-semibold text-base text-[#343133]`}>
            Sewa Alat Tambahan
          </h2>
          <div className="mt-2 space-y-2">
            {EXTRA_ITEMS.map((item) => {
              const isChecked = selectedExtras.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => handleToggleExtra(item.id)}
                  className={`flex h-12 w-full items-center gap-3 rounded-lg bg-white px-3 text-left cursor-pointer transition-colors ${
                    isChecked ? 'border-2 border-[#404F14]' : 'border border-[#D4D4D4]'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                      isChecked ? 'bg-[#404F14] text-white' : 'border border-[#D4D4D4] bg-white'
                    }`}
                    aria-hidden="true"
                  >
                    {isChecked && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="flex-1 font-heading text-sm text-[#343133]">{item.name}</span>
                  <span
                    className={`font-heading text-sm ${
                      isChecked ? 'font-bold text-[#404F14]' : 'text-[#6F6B6E]'
                    }`}
                  >
                    {formatRupiah(item.price)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Metode pembayaran */}
          <h2 className={`${FONT_MONTSERRAT} mt-6 font-semibold text-base text-[#343133]`}>
            Metode Pembayaran
          </h2>

          <div role="radiogroup" aria-label="Metode pembayaran" className="mt-2 space-y-3">
            {MOBILE_METHOD_GROUPS.map((group) => (
              <div
                key={group.id}
                className="overflow-hidden rounded-2xl border border-[#D4D4D4] bg-white"
              >
                <h3 className={`${FONT_MONTSERRAT} px-3 pt-3 pb-1 font-bold text-[11px] text-[#404F14]`}>
                  {group.label}
                </h3>

                {group.methods.map((item, index) => {
                  const isActive = mobileMethod === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setMobileMethod(item.id)}
                      className={`flex h-12 w-full items-center gap-3 bg-white px-3 text-left cursor-pointer ${
                        index > 0 ? 'border-t border-[#D4D4D4]' : ''
                      }`}
                    >
                      <span
                        className={`flex h-6 w-14 shrink-0 items-center justify-center rounded px-1 text-[9px] font-heading font-bold ${
                          isActive
                            ? 'bg-[#E6F0E0] text-[#404F14]'
                            : 'bg-[#F0F0F0] text-[#6F6B6E]'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span className="flex-1 font-heading text-sm font-semibold text-[#343133]">
                        {item.name}
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          isActive ? 'border-2 border-[#404F14]' : 'border border-[#D4D4D4]'
                        }`}
                        aria-hidden="true"
                      >
                        {isActive && <span className="h-2.5 w-2.5 rounded-full bg-[#404F14]" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Peringatan cashless (sama dengan versi PC) */}
          <div className="mt-4 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-2 py-2">
            <p className="font-heading text-[10px] leading-4 text-[#C00000]">
              <span aria-hidden="true">⚠️</span> Sistem OBC Sport Center sepenuhnya cashless.
              Pembayaran di tempat (COD) tidak didukung untuk mengamankan slot secara real-time.
            </p>
          </div>
        </div>

        {/* Tombol bayar (fixed di bawah) */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D4D4D4] bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handlePayMobile}
            className="h-12 w-full rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] transition-colors active:bg-[#9AAD3E] cursor-pointer"
          >
            Bayar Sekarang • {formatRupiah(mobileTotal)}
          </button>
        </div>
      </div>

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      <div className="hidden md:block min-h-screen bg-white font-body text-[#343133]">
        <NavbarDashboard userName={USER_NAME} showDesktopNavigation={false} />

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

      <PendingOrderModal
        isOpen={pendingPayment !== null}
        date={date}
        time={`${startTime} - ${endTime}`}
        paymentMethod={pendingPayment?.method ?? ''}
        amount={pendingPayment?.total ?? 0}
        onClose={() => setPendingPayment(null)}
        onReturnHome={() => {
          setPendingPayment(null)
          navigate('/home')
        }}
      />
    </>
  )
}

export default PaymentPage