import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBasket } from 'lucide-react'

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#343133]/40" onClick={onClose}>
      {/* Drawer kanan: lebar 581px sesuai desain */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[581px] flex-col bg-[#FDFCF7] shadow-[-8px_0_32px_rgba(0,0,0,0.15)]"
      >
        {/* ================= Header ================= */}
        <header className="flex h-[88px] shrink-0 items-center gap-3 border-b border-[#E5E5E5] bg-white px-5">
          <div
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-lg bg-[#CDF178] text-[#404F14]"
            aria-hidden="true"
          >
            <ShoppingBasket size={22} strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2
                id="cart-modal-title"
                className={`${FONT_MONTSERRAT} text-lg font-semibold leading-6 text-black`}
              >
                Keranjang Booking
              </h2>
              {items.length > 0 && (
                <span className="rounded-md bg-[#404F14] px-2 py-0.5 font-heading text-[13px] leading-4 text-white">
                  {items.length} paket
                </span>
              )}
            </div>
            <p className="font-heading text-sm leading-5 text-black">OBC Sport</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup keranjang"
            className="mr-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#CDF178] font-heading text-sm text-[#343133] transition-colors hover:bg-[#9AAD3E]"
          >
            X
          </button>
        </header>

        {/* ================= Isi keranjang ================= */}
        <div className="flex-1 overflow-y-auto px-9 py-7">
          {items.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5E9] text-[#404F14]">
                <ShoppingBasket size={30} strokeWidth={1.6} />
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
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="relative flex min-h-[188px] gap-4 rounded-xl border border-[#E5E5E5] bg-white p-4"
                >
                  <div
                    className={`${FONT_MONTSERRAT} flex h-[58px] w-[54px] shrink-0 items-center justify-center rounded-lg bg-[#404F14] text-sm font-bold text-white`}
                  >
                    {item.code}
                  </div>

                  <div className="flex flex-1 flex-col pr-8">
                    <div>
                      <h3 className="font-heading text-sm font-semibold leading-5 text-[#404F14]">
                        {item.facilityName}
                      </h3>
                      <p className="font-heading text-sm font-semibold leading-5 text-[#121212]">
                        {item.sportName}
                      </p>
                      <p className="mt-1 font-heading text-sm leading-5 text-[#343133]">
                        {item.schedule}
                      </p>
                    </div>
                    <p className="mt-auto pt-6 font-heading text-sm font-bold leading-5 text-[#121212]">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove?.(item.id)}
                    aria-label={`Hapus ${item.facilityName} dari keranjang`}
                    className="absolute right-4 top-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#D4E4CC] bg-[#F1F8EC] font-heading text-xs text-[#343133] transition-colors hover:bg-[#E6F0E0]"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================= Footer total ================= */}
        <footer className="shrink-0 border-t border-[#E5E5E5] bg-white px-8 pb-10 pt-8">
          <p className="font-heading text-sm leading-5 text-black">
            Total Bookingan <span className="ml-1">{items.length}</span>
          </p>
          <div className="mt-0.5 flex items-center justify-between px-0 pr-6">
            <span className="font-heading text-base font-bold text-black">Total Tagihan</span>
            <span className="font-heading text-base font-bold text-[#404F14]">
              Rp.{total.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => onCheckout?.(items)}
            className="mx-auto mt-8 block h-10 w-full max-w-[371px] cursor-pointer rounded-md bg-[#CDF178] font-heading text-xs font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#CDF178]"
          >
            Lanjut ke Pembayaran
          </button>
        </footer>
      </section>
    </div>
  )
}

export default CartModal