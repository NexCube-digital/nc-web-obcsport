import { useEffect, useRef, useState } from 'react'
import { Crop, Move, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'

/* -------------------------------------------------------------------------
   Modal atur ukuran & posisi foto profil
   Letakkan di: components/settings/PhotoCropModal.tsx
   - Desktop (>= 768px): modal melebar ke samping, area foto di kiri dan kontrol di kanan
   - Mobile (< 768px): bottom sheet satu kolom
   - Isi modal selalu muat satu layar (tanpa scroll)
   ------------------------------------------------------------------------- */
interface PhotoCropModalProps {
  file: File
  onCancel: () => void
  onApply: (blob: Blob) => void
}

const DESKTOP_BREAKPOINT = 768 // sama dengan breakpoint "md" Tailwind
const OUTPUT_SIZE = 512 // ukuran hasil akhir foto (px)
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.1
const PREVIEW_SIZES = [56, 36, 24] // ukuran pratinjau avatar (px)

// Hitung ukuran area foto berdasarkan lebar & tinggi layar saat ini
function calcViewSize(): number {
  const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT
  if (isDesktop) {
    // Dua kolom: hanya dibatasi tinggi layar (header + jarak ≈ 150px)
    return Math.round(Math.max(220, Math.min(320, window.innerHeight - 150)))
  }
  // Satu kolom: dibatasi lebar dan tinggi layar (header, slider, pratinjau, tombol ≈ 320px)
  const byWidth = window.innerWidth - 56
  const byHeight = window.innerHeight - 320
  return Math.round(Math.max(160, Math.min(300, byWidth, byHeight)))
}

function PhotoCropModal({ file, onCancel, onApply }: PhotoCropModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  const [src, setSrc] = useState('')
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(MIN_ZOOM)
  // Posisi disimpan sebagai pecahan dari ukuran area, supaya tetap pas saat layar diputar / diubah ukurannya
  const [offsetRatio, setOffsetRatio] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [viewSize, setViewSize] = useState(() => calcViewSize())

  // Buat URL sementara dari file, bersihkan saat modal ditutup
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Tutup modal dengan Escape, kunci scroll halaman, dan sesuaikan ukuran saat layar berubah
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    const onResize = () => setViewSize(calcViewSize())
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)

    // Kunci scroll di html & body, sisakan lebar scrollbar agar tampilan tidak bergeser
    const html = document.documentElement
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    // Cegah scroll halaman lewat mouse wheel selama modal terbuka (listener non-passive)
    const overlay = overlayRef.current
    const blockWheel = (e: WheelEvent) => e.preventDefault()
    overlay?.addEventListener('wheel', blockWheel, { passive: false })

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      overlay?.removeEventListener('wheel', blockWheel)
      html.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.paddingRight = prevBodyPadding
    }
  }, [onCancel])

  // Skala dasar: gambar selalu menutupi seluruh area (mode "cover")
  const baseScale = natural.w ? Math.max(viewSize / natural.w, viewSize / natural.h) : 1
  const scale = baseScale * zoom
  const dispW = natural.w * scale
  const dispH = natural.h * scale
  const offset = { x: offsetRatio.x * viewSize, y: offsetRatio.y * viewSize }

  // Batasi geser agar tidak muncul ruang kosong di tepi area (nilai px)
  const clamp = (x: number, y: number, w: number, h: number) => {
    const maxX = Math.max(0, (w - viewSize) / 2)
    const maxY = Math.max(0, (h - viewSize) / 2)
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    }
  }

  const saveOffset = (x: number, y: number, w = dispW, h = dispH) => {
    const c = clamp(x, y, w, h)
    setOffsetRatio({ x: c.x / viewSize, y: c.y / viewSize })
  }

  const handleImageLoad = () => {
    const img = imgRef.current
    if (!img) return
    setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    setOffsetRatio({ x: 0, y: 0 })
    setZoom(MIN_ZOOM)
  }

  const changeZoom = (next: number) => {
    const value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next))
    const s = baseScale * value
    setZoom(value)
    // Sesuaikan ulang posisi karena ukuran gambar berubah
    saveOffset(offset.x, offset.y, natural.w * s, natural.h * s)
  }

  const handleReset = () => {
    setZoom(MIN_ZOOM)
    setOffsetRatio({ x: 0, y: 0 })
  }

  /* ---------- Geser gambar dengan drag / sentuh ---------- */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    saveOffset(drag.originX + (e.clientX - drag.startX), drag.originY + (e.clientY - drag.startY))
  }

  const handlePointerUp = () => {
    dragRef.current = null
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    changeZoom(zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))
  }

  // Geser dengan tombol panah keyboard (aksesibilitas)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 10
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    saveOffset(offset.x + move[0], offset.y + move[1])
  }

  /* ---------- Terapkan: potong gambar sesuai area yang dipilih ---------- */
  const handleApply = () => {
    const img = imgRef.current
    if (!img || !natural.w) return

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Posisi pojok kiri atas gambar di dalam area pengaturan
    const left = (viewSize - dispW) / 2 + offset.x
    const top = (viewSize - dispH) / 2 + offset.y

    // Konversi area pengaturan ke koordinat gambar asli
    const sx = -left / scale
    const sy = -top / scale
    const sSize = viewSize / scale

    // Latar putih supaya PNG transparan tidak menjadi hitam saat jadi JPEG
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    // PNG tetap PNG; JPG & GIF (frame pertama) disimpan sebagai JPEG
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    canvas.toBlob((blob) => blob && onApply(blob), type, 0.92)
  }

  // Persentase untuk slider (isi bar hijau)
  const zoomPercent = ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
  const isChanged = zoom !== MIN_ZOOM || offsetRatio.x !== 0 || offsetRatio.y !== 0

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden overscroll-none bg-[#121212]/60 backdrop-blur-sm md:items-center md:px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Mobile: bottom sheet menempel di bawah. Desktop: modal lebar di tengah. Tanpa scroll. */}
      <div className="w-full max-h-[100dvh] overflow-hidden rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl md:max-w-[760px] md:rounded-2xl md:pb-0">
        {/* Garis pegangan (hanya mobile) */}
        <div className="flex justify-center pt-2 md:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-[#E5E5E5]" />
        </div>

        {/* ================= Header ================= */}
        <div className="flex items-center gap-3 px-5 pt-3 md:px-6 md:pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF8F0] text-[#004000]">
            <Crop size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id="crop-title" className="font-heading font-semibold text-base text-[#121212] md:text-lg">
              Atur Foto Profil
            </h3>
            <p className="mt-0.5 truncate text-xs text-[#6F6B6E]">
              Pilih bagian foto yang ingin ditampilkan pada profil Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-[#6F6B6E] hover:bg-[#F3F4F6] hover:text-[#121212] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= Isi: mobile satu kolom, desktop dua kolom ================= */}
        <div className="md:mt-4 md:flex md:gap-6 md:px-6 md:pb-6">
          {/* ---------- Kiri: area pengaturan ---------- */}
          <div className="mt-3 px-5 md:mt-0 md:shrink-0 md:px-0">
            <div
              tabIndex={0}
              role="application"
              aria-label="Area pengaturan foto. Gunakan tombol panah untuk menggeser."
              className={`relative mx-auto overflow-hidden rounded-xl bg-[#121212] touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[#9AAD3E] ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ width: viewSize, height: viewSize }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              onKeyDown={handleKeyDown}
            >
              {src && (
                <img
                  ref={imgRef}
                  src={src}
                  alt="Foto yang diatur"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="absolute max-w-none"
                  style={{
                    width: natural.w ? dispW : 'auto',
                    height: natural.h ? dispH : 'auto',
                    left: (viewSize - dispW) / 2 + offset.x,
                    top: (viewSize - dispH) / 2 + offset.y,
                    visibility: natural.w ? 'visible' : 'hidden',
                  }}
                />
              )}

              {/* Bingkai lingkaran: bagian di luar lingkaran akan terpotong */}
              <div
                className="pointer-events-none absolute inset-3 rounded-full border-2 border-white/90"
                style={{ boxShadow: '0 0 0 9999px rgba(18,18,18,0.6)' }}
              />

              {/* Garis bantu 3x3, tampil saat foto digeser */}
              <div
                className={`pointer-events-none absolute inset-3 overflow-hidden rounded-full transition-opacity duration-200 ${
                  isDragging ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
              </div>

              {/* Petunjuk singkat */}
              <span
                className={`pointer-events-none absolute bottom-1.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur transition-opacity duration-200 ${
                  isDragging ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <Move size={12} />
                Geser untuk mengatur
              </span>
            </div>
          </div>

          {/* ---------- Kanan: perbesaran, pratinjau, tombol ---------- */}
          <div className="md:flex md:min-w-0 md:flex-1 md:flex-col md:justify-between">
            <div>
              {/* Perbesaran */}
              <div className="mt-3 px-5 md:mt-0 md:px-0">
                <div className="hidden items-center justify-between md:flex">
                  <label htmlFor="zoom" className="text-sm font-heading font-medium text-[#121212]">
                    Perbesaran
                  </label>
                  <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-xs font-heading font-semibold text-[#404F14]">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 md:mt-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => changeZoom(zoom - ZOOM_STEP)}
                    disabled={zoom <= MIN_ZOOM}
                    aria-label="Perkecil"
                    className="rounded-lg p-1.5 text-[#404F14] hover:bg-[#EEF8F0] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <input
                    id="zoom"
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => changeZoom(Number(e.target.value))}
                    aria-label="Perbesaran foto"
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-[#404F14]"
                    style={{
                      background: `linear-gradient(to right, #9AAD3E ${zoomPercent}%, #E5E5E5 ${zoomPercent}%)`,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => changeZoom(zoom + ZOOM_STEP)}
                    disabled={zoom >= MAX_ZOOM}
                    aria-label="Perbesar"
                    className="rounded-lg p-1.5 text-[#404F14] hover:bg-[#EEF8F0] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ZoomIn size={18} />
                  </button>
                  {/* Persen perbesaran (mobile saja, desktop sudah ada di atas slider) */}
                  <span className="w-12 shrink-0 rounded-md bg-[#F3F4F6] py-0.5 text-center text-xs font-heading font-semibold text-[#404F14] md:hidden">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              {/* Pratinjau avatar */}
              <div className="mx-5 mt-3 flex items-center gap-3 rounded-xl border border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2 md:mx-0 md:mt-5 md:px-4 md:py-3">
                <div className="flex items-end gap-2.5">
                  {PREVIEW_SIZES.map((size) => {
                    const ratio = size / viewSize
                    return (
                      <div
                        key={size}
                        className="relative shrink-0 overflow-hidden rounded-full border border-[#E5E5E5] bg-[#E5E5E5]"
                        style={{ width: size, height: size }}
                      >
                        {src && natural.w > 0 && (
                          <img
                            src={src}
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            className="absolute max-w-none"
                            style={{
                              width: dispW * ratio,
                              height: dispH * ratio,
                              left: ((viewSize - dispW) / 2 + offset.x) * ratio,
                              top: ((viewSize - dispH) / 2 + offset.y) * ratio,
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-heading font-medium text-[#121212]">Pratinjau</p>
                  <p className="truncate text-xs text-[#6F6B6E]" title={file.name}>
                    {file.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!isChanged}
                  aria-label="Atur ulang"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-heading font-medium text-[#404F14] hover:bg-[#EEF8F0] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={14} />
                  <span className="hidden md:inline">Atur ulang</span>
                </button>
              </div>
            </div>

            {/* Aksi */}
            <div className="mt-3 flex gap-3 border-t border-[#E5E5E5] px-5 py-3 md:mt-5 md:border-t-0 md:px-0 md:py-0">
              <button
                type="button"
                onClick={onCancel}
                className="h-10 flex-1 rounded-lg border border-[#E5E5E5] bg-white text-sm font-heading font-medium text-[#121212] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!natural.w}
                className="h-10 flex-1 rounded-lg bg-[#CDF178] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Terapkan Foto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoCropModal