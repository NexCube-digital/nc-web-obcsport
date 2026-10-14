import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import type { OrderModalFacility } from '../components/ui/OrderModal'
import Hero from './home/Hero'
import Information from './home/Information'
import type { FacilityCard } from './home/Court'

const Event = lazy(() => import('./home/Event'))
const Court = lazy(() => import('./home/Court'))
const OrderModal = lazy(() => import('../components/ui/OrderModal'))

interface DeferredSectionProps {
  children: ReactNode
  placeholderClassName: string
}

function DeferredSection({ children, placeholderClassName }: DeferredSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: '250px 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="flow-root">
      {isNearViewport ? (
        <Suspense fallback={<div aria-hidden="true" className={placeholderClassName} />}>
          {children}
        </Suspense>
      ) : (
        <div aria-hidden="true" className={placeholderClassName} />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
// TODO: nama user sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'

// Fasilitas pendukung yang tampil di modal
const AMENITIES = [
  { id: 'toilet', label: 'Toilet T3-T5', icon: 'toilet' },
  { id: 'led', label: 'LED Light', icon: 'led' },
  { id: 'foodcourt', label: 'Foodcourt', icon: 'foodcourt' },
  { id: 'mushola', label: 'Mushola', icon: 'mushola' },
  { id: 'parkir', label: 'Parkir', icon: 'parkir' },
] as const

// TODO: ganti dengan data detail dari API
const MODAL_DETAIL: Record<string, Omit<OrderModalFacility, 'id' | 'name' | 'image'>> = {
  'lapangan-f1': {
    // Voli dihapus: status harga masih pending konfirmasi OBC (lihat PRD)
    sports: [
      { id: 'futsal-1', label: 'Futsal 1', icon: 'futsal' },
      { id: 'badminton', label: 'Badminton', icon: 'badminton' },
      { id: 'pickleball', label: 'Pickleball', icon: 'pickleball' },
    ],
    specification:
      'Lantai interlock standar turnamen internasional, pencahayaan LED anti-silau, tribun penonton, serta akses ruang ganti eksklusif.',
    amenities: [...AMENITIES],
  },
  'lapangan-f2': {
    sports: [
      { id: 'futsal-2', label: 'Futsal 2', icon: 'futsal' },
      { id: 'basket', label: 'Basket', icon: 'basket' },
    ],
    specification:
      'Lantai interlock standar turnamen, pencahayaan LED anti-silau, dan akses ruang ganti.',
    amenities: [...AMENITIES],
  },
  'lapang-sepak-bola': {
    sports: [{ id: 'sepak-bola', label: 'Sepak Bola', icon: 'sepakbola' }],
    specification: 'Lapangan sepak bola dengan pencahayaan malam dan akses ruang ganti.',
    amenities: [...AMENITIES],
  },
  'ruang-tenis-meja': {
    sports: [{ id: 'tenis-meja', label: 'Tenis Meja', icon: 'tenismeja' }],
    specification: 'Ruang tenis meja dalam ruangan dengan meja standar turnamen.',
    amenities: [...AMENITIES],
  },
  'ruang-biliard': {
    sports: [{ id: 'biliard', label: 'Biliard', icon: 'biliard' }],
    specification: 'Meja biliard standar dengan pencahayaan khusus dan area santai.',
    amenities: [...AMENITIES],
  },
}

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [selectedFacility, setSelectedFacility] = useState<FacilityCard | null>(null)
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!previewImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewImage(null)
    }
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      setIsImageZoomed(false)
    }
  }, [previewImage])

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setSubmittedSearch(searchQuery.trim())
    }, 300)

    return () => window.clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearch = () => {
    setSubmittedSearch(searchQuery.trim())
  }

  const modalFacility: OrderModalFacility | null = selectedFacility
    ? {
        id: selectedFacility.id,
        name: selectedFacility.name,
        image: selectedFacility.image,
        ...MODAL_DETAIL[selectedFacility.id],
      }
    : null

  return (
    // overflow-x-hidden: pengaman terakhir agar tidak pernah ada scroll horizontal
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain; padding mengecil di layar kecil */}
      <main className="mx-auto w-full max-w-[1248px] flex-1 px-3 pt-4 pb-10 min-[360px]:px-4 sm:px-6 sm:pt-6 sm:pb-16">
        <Hero
          userName={USER_NAME}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />
        <Information />

        <DeferredSection placeholderClassName="min-h-[180px]">
          <Event onPreviewImage={setPreviewImage} />
        </DeferredSection>

        <DeferredSection placeholderClassName="min-h-[680px] md:min-h-[420px]">
          <Court
            submittedSearch={submittedSearch}
            onPreviewImage={setPreviewImage}
            onSelectFacility={setSelectedFacility}
          />
        </DeferredSection>
      </main>

      <Footer />

      {/* ================= Modal pemesanan ================= */}
      {modalFacility && (
        <Suspense fallback={null}>
          <OrderModal
            facility={modalFacility}
            onClose={() => setSelectedFacility(null)}
            onOrder={() => {
              setSelectedFacility(null)
              navigate('/checkout') // TODO: ganti ke halaman checkout sebenarnya
            }}
          />
        </Suspense>
      )}

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewImage(null)
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
        >
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsImageZoomed((zoomed) => !zoomed)}
              aria-label={isImageZoomed ? 'Perkecil gambar' : 'Perbesar gambar'}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              {isImageZoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
            </button>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label="Tutup gambar"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <X size={22} />
            </button>
          </div>
          <div className="max-h-[90vh] max-w-[94vw] overflow-auto">
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className={isImageZoomed ? 'w-[140vw] max-w-[1400px]' : 'max-h-[88vh] max-w-[94vw]'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage