import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import NavbarDashboard from '../components/layout/Navbar'
import DeferredFooter from '../components/layout/DeferredFooter'
import ScrollReveal from '../components/animation/ScrollReveal'
import DeferredSection from '../components/layout/DeferredSection'
import type { OrderModalFacility } from '../components/ui/OrderModal'
import Hero from './home/Hero'
import type { FacilityCard } from './home/Court'
import { getSportsFacilities } from '../services/facilityService'
import type { SportsFacility } from '../services/facilityService'
import lapangF1 from '../assets/layanan/Lapang F1.png'
import lapangF2 from '../assets/layanan/Lapang F2.png'
import mejaBilliard from '../assets/layanan/Meja Billiard.png'
import pickleballImage from '../assets/layanan/pickleball-mockup.png'

const Court = lazy(() => import('./home/Court'))
const Information = lazy(() => import('./home/Information'))
const Event = lazy(() => import('./home/Event'))
const OrderModal = lazy(() => import('../components/ui/OrderModal'))

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
  const [apiFacilities, setApiFacilities] = useState<FacilityCard[]>()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    getSportsFacilities()
      .then((resources) => {
        if (active) setApiFacilities(resources.map(toFacilityCard))
      })
      .catch(() => {
        if (active) setApiFacilities(undefined)
      })

    return () => { active = false }
  }, [])

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
        sports: selectedFacility.sportTypes?.map(toSportOption).filter((sport) => sport.id !== 'volleyball')
          ?? MODAL_DETAIL[selectedFacility.id]?.sports
          ?? [],
        specification: selectedFacility.description || MODAL_DETAIL[selectedFacility.id]?.specification || '',
        amenities: MODAL_DETAIL[selectedFacility.id]?.amenities ?? [...AMENITIES],
      }
    : null

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-body text-[#343133]">
      <NavbarDashboard userName={USER_NAME} />

      {/* Lebar konten 1200px sesuai desain; padding mengecil di layar kecil */}
      <main className="mx-auto w-full max-w-[1248px] flex-1 px-3 pt-4 pb-10 min-[360px]:px-4 sm:px-6 sm:pt-6 sm:pb-16">
        <ScrollReveal>
          <Hero
            userName={USER_NAME}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </ScrollReveal>

        <DeferredSection placeholderClassName="min-h-[164px] sm:min-h-[190px]">
          <Information />
        </DeferredSection>

        <DeferredSection placeholderClassName="min-h-[160px] min-[360px]:min-h-[180px] min-[833px]:min-h-[190px]">
          <Event onPreviewImage={setPreviewImage} />
        </DeferredSection>

        <DeferredSection placeholderClassName="min-h-[680px] md:min-h-[1000px] lg:min-h-[720px]">
          <Court
            submittedSearch={submittedSearch}
            onPreviewImage={setPreviewImage}
            onSelectFacility={setSelectedFacility}
            facilities={apiFacilities}
          />
        </DeferredSection>
      </main>

      <DeferredFooter />

      {/* ================= Modal pemesanan ================= */}
      {modalFacility && (
        <Suspense fallback={null}>
          <OrderModal
            facility={modalFacility}
            onClose={() => setSelectedFacility(null)}
            onOrder={(facilityId, sportType) => {
              const facility = selectedFacility
              setSelectedFacility(null)
              navigate('/checkout', {
                state: { resourceId: facilityId, sportType, facility },
              })
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

const SPORT_LABELS: Record<string, string> = {
  futsal: 'Futsal',
  badminton: 'Badminton',
  basketball: 'Basket',
  volleyball: 'Voli',
  pickleball: 'Pickleball',
  tennis: 'Tenis',
  billiard: 'Biliard',
  swimming: 'Renang',
  event: 'Event',
  other: 'Lainnya',
}

const SPORT_ICONS = {
  futsal: 'futsal',
  badminton: 'badminton',
  basketball: 'basket',
  volleyball: 'basket',
  pickleball: 'pickleball',
  tennis: 'sepakbola',
  billiard: 'biliard',
  swimming: 'sepakbola',
  event: 'sepakbola',
  other: 'sepakbola',
} as const

function toSportOption(sportType: string) {
  return {
    id: sportType,
    label: SPORT_LABELS[sportType] ?? sportType,
    icon: SPORT_ICONS[sportType as keyof typeof SPORT_ICONS] ?? 'sepakbola',
  }
}

function toFacilityCard(resource: SportsFacility): FacilityCard {
  const sportNames = resource.sportTypes
    .filter((sport) => sport !== 'volleyball')
    .map((sport) => SPORT_LABELS[sport] ?? sport)
  const image = resource.sportTypes.includes('billiard')
    ? mejaBilliard
    : resource.sportTypes.includes('pickleball')
      ? pickleballImage
      : resource.name.toLowerCase().includes('f2')
        ? lapangF2
        : lapangF1

  return {
    id: resource.id,
    name: resource.name,
    description: sportNames.join(', ') || resource.description || resource.resourceType,
    badge: 'TERSEDIA',
    buttonLabel: 'Booking Sekarang',
    image,
    sportTypes: resource.sportTypes,
    slotMinutes: resource.slotMinutes,
    fromPrice: resource.fromPrice,
    fromPriceFormatted: resource.fromPriceFormatted,
    location: resource.location,
  }
}

export default HomePage