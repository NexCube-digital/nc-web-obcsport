import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, Plus, ShoppingCart, Trash2, X } from 'lucide-react'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
export interface CartItem {
  id: string
  /** Kode singkat di kotak hijau, contoh: "F1" */
  code: string
  facilityName: string
  sportName: string
  /** Contoh: "08:00 - 12:00, 12 Mar 2026" */
  schedule: string
  price: number
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  items?: CartItem[]
  onRemove?: (id: string) => void
  onCheckout?: (items: CartItem[]) => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

/* Animasi masuk drawer & overlay. Dimatikan otomatis jika pengguna memilih reduced motion */
const ANIMATION_CSS = `
@keyframes cart-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes cart-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cart-item-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.cart-overlay { animation: cart-fade-in 200ms ease-out; }
.cart-drawer { animation: cart-slide-in 280ms cubic-bezier(0.22, 1, 0.36, 1); }
.cart-item { animation: cart-item-in 260ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .cart-overlay, .cart-drawer, .cart-item { animation: none; }
}
`

function CartModal({ isOpen, onClose, items = [], onRemove, onCheckout }: CartModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const currentPaddingRight = Number.parseFloat(
      window.getComputedStyle(document.body).paddingRight,
    ) || 0

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const total = items.reduce((sum, item) => sum + item.price, 0)
  const hasItems = items.length > 0

  return (
    <div
      className="cart-overlay fixed inset-0 z-50 flex justify-end bg-[#343133]/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <style>{ANIMATION_CSS}</style>

      {/* Drawer kanan: penuh di mobile, maksimal 581px di layar lebar.
          h-[100dvh] dipakai agar footer tidak tertutup address bar browser mobile */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="cart-drawer flex h-[100dvh] w-full max-w-[581px] flex-col bg-[#FDFCF7] shadow-[-8px_0_32px_rgba(0,0,0,0.15)]"
      >
        {/* ================= Header ================= */}
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[#E5E5E5] bg-white px-4 sm:h-[88px] sm:px-6">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CDF178] text-[#404F14] sm:h-[46px] sm:w-[46px]"
            aria-hidden="true"
          >
            <ShoppingCart size={22} strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2
                id="cart-modal-title"
                className={`${FONT_MONTSERRAT} truncate text-base font-semibold leading-6 text-black sm:text-lg`}
              >
                Keranjang Booking
              </h2>
              {hasItems && (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-[#404F14] px-2.5 py-0.5 font-heading text-xs font-semibold leading-4 text-white">
                  {items.length} paket
                </span>
              )}
            </div>
            <p className="font-heading text-sm leading-5 text-[#6F6B6E]">OBC Sport</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup keranjang"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#CDF178] text-[#343133] transition-colors hover:bg-[#9AAD3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#404F14] focus-visible:ring-offset-2"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        {/* ================= Isi keranjang ================= */}
        <div
          className={`min-h-0 flex-1 px-4 py-4 sm:px-8 sm:py-6 ${
            hasItems ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'
          }`}
        >
          {!hasItems ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5E9] text-[#404F14]">
                <ShoppingCart size={30} strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 font-heading text-base font-bold text-[#343133]">
                Keranjang masih kosong
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6F6B6E]">
                Booking yang ditambahkan ke keranjang akan muncul di sini.
              </p>
              <Link
                to="/home"
                onClick={onClose}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#CDF178] px-5 text-sm font-heading font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E]"
              >
                Cari Lapangan
              </Link>
            </div>
          ) : (
            <>
              {/* Tombol tambah jadwal: gaya garis putus-putus agar jelas sebagai aksi sekunder */}
              <Link
                to="/home"
                onClick={onClose}
                className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#9AAD3E] bg-[#F7FBEA] font-heading text-sm font-bold text-[#404F14] transition-colors hover:bg-[#EEF6D6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#404F14] focus-visible:ring-offset-2"
              >
                <Plus size={17} aria-hidden="true" />
                Tambah Jadwal Baru
              </Link>

              <ul className="space-y-3">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    // Delay kecil per item agar muncul berurutan (maks 5 item pertama)
                    style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
                    className="cart-item relative overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex gap-3 p-3.5 sm:gap-4 sm:p-4">
                      <div
                        className={`${FONT_MONTSERRAT} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#404F14] text-sm font-bold text-white sm:h-14 sm:w-14`}
                        aria-hidden="true"
                      >
                        {item.code}
                      </div>

                      {/* min-w-0 + break-words supaya nama panjang tidak melebar keluar kartu */}
                      <div className="min-w-0 flex-1 pr-9">
                        <h3 className="break-words font-heading text-sm font-semibold leading-5 text-[#404F14]">
                          {item.facilityName}
                        </h3>
                        <p className="break-words font-heading text-sm font-semibold leading-5 text-[#121212]">
                          {item.sportName}
                        </p>
                        <p className="mt-1.5 flex items-start gap-1.5 break-words font-heading text-[13px] leading-5 text-[#6F6B6E]">
                          <CalendarClock
                            size={14}
                            className="mt-[3px] shrink-0 text-[#404F14]"
                            aria-hidden="true"
                          />
                          <span>{item.schedule}</span>
                        </p>
                      </div>

                      {/* Tombol hapus: hover merah sebagai penanda aksi destruktif */}
                      <button
                        type="button"
                        onClick={() => onRemove?.(item.id)}
                        aria-label={`Hapus ${item.facilityName} dari keranjang`}
                        className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#D4E4CC] bg-[#F1F8EC] text-[#343133] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Baris harga dipisah garis tipis agar hierarki lebih jelas */}
                    <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#E5E5E5] bg-[#FAFAF5] px-3.5 py-2.5 sm:px-4">
                      <span className="font-heading text-xs text-[#6F6B6E]">Harga paket</span>
                      <span className="font-heading text-sm font-bold text-[#121212]">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ================= Footer total ================= */}
        {/* pb memakai safe-area agar tombol tidak tertutup home indicator iOS */}
        <footer className="shrink-0 border-t border-[#E5E5E5] bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] sm:px-8 sm:pb-8 sm:pt-5">
          <div className="flex items-center justify-between font-heading text-sm text-[#6F6B6E]">
            <span>Total Bookingan</span>
            <span className="font-semibold text-[#343133]">{items.length} paket</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <span className="font-heading text-base font-bold text-black">Total Tagihan</span>
            <span className={`${FONT_MONTSERRAT} text-xl font-bold text-[#404F14]`}>
              {formatRupiah(total)}
            </span>
          </div>

          <button
            type="button"
            disabled={!hasItems}
            onClick={() => onCheckout?.(items)}
            className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#404F14] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#CDF178]"
          >
            Lanjut ke Pembayaran
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </footer>
      </section>
    </div>
  )
}

export default CartModal