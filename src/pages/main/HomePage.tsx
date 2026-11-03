import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
import ScrollReveal from '../../components/animation/ScrollReveal'
import DeferredSection from '../../components/layout/DeferredSection'
import type { OrderModalFacility } from '../../components/ui/OrderModal'
import Hero from './home/Hero'
import type { FacilityCard } from './home/Court'
import { getSportsFacilities } from '../../services/facilityService'
import { useAuth } from '../../hooks/useAuth'
import type { SportsFacility } from '../../services/facilityService'
import { getImageUrl } from '../../utils/imageUrl'

const Court = lazy(() => import('./home/Court'))
const Information = lazy(() => import('./home/Information'))
const Event = lazy(() => import('./home/Event'))
const OrderModal = lazy(() => import('../../components/ui/OrderModal'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
const AMENITY_LABELS: Record<string, string> = {
  toilet: 'Toilet',
  led: 'Lampu LED',
  foodcourt: 'Foodcourt',
  mushola: 'Mushola',
  musholla: 'Mushola',
  parkir: 'Parkir',
  parkir_luas: 'Parkir Luas',
  shower: 'Kamar Mandi',
  loker: 'Loker',
  wifi: 'Wi-Fi',
}

const AMENITY_ICONS: Record<string, 'toilet' | 'led' | 'foodcourt' | 'mushola' | 'parkir'> = {
  toilet: 'toilet',
  led: 'led',
  foodcourt: 'foodcourt',
  mushola: 'mushola',
  musholla: 'mushola',
  parkir: 'parkir',
  parkir_luas: 'parkir',
}

function HomePage() {
  const { user } = useAuth()
  const userName = user?.name ?? 'Akun OBC'
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
        if (active) setApiFacilities(toFacilityCards(resources))
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
        sports: selectedFacility.bookingOptions ?? selectedFacility.sportTypes?.map(toSportOption).filter((sport) => sport.id !== 'volleyball') ?? [],
        specification: selectedFacility.description || '',
        selectionTitle: selectedFacility.selectionTitle,
        amenities: selectedFacility.amenities?.length
          ? selectedFacility.amenities.map((amenity, index) => ({
              id: `${amenity}-${index}`,
              label: AMENITY_LABELS[amenity] ?? amenity.replaceAll('_', ' '),
              icon: AMENITY_ICONS[amenity] ?? 'parkir',
            }))
          : [],
      }
    : null

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-body text-[#343133]">
      <NavbarDashboard userName={userName} />

      {/* Lebar konten 1200px sesuai desain; padding mengecil di layar kecil */}
      <main className="mx-auto w-full max-w-[1248px] flex-1 px-3 pt-4 pb-10 min-[360px]:px-4 sm:px-6 sm:pt-6 sm:pb-16">
        <ScrollReveal>
          <Hero
            userName={userName}
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
  sepakbola: 'Sepak Bola',
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
  sepakbola: 'sepakbola',
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
  const image = getImageUrl(resource.imageUrl ?? resource.gallery?.[0]) ?? ''

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
    amenities: resource.amenities ?? [],
    location: resource.location,
  }
}

function toFacilityCards(resources: SportsFacility[]): FacilityCard[] {
  const resourcesBySlug = new Map(resources.map((resource) => [resource.slug, resource]))
  const facilities: FacilityCard[] = []
  const appendResource = (slug: string, name: string, sportTypes?: string[]) => {
    const resource = resourcesBySlug.get(slug)
    if (!resource) return
    const card = toFacilityCard(resource)
    card.name = name
    if (sportTypes) {
      card.sportTypes = sportTypes
      card.description = sportTypes.map((sport) => SPORT_LABELS[sport] ?? sport).join(', ')
    }
    facilities.push(card)
  }

  appendResource('lapangan-f1', 'Lapang F1')

  const f2 = resourcesBySlug.get('lapangan-f2')
  let footballCard: FacilityCard | undefined
  if (f2) {
    const selectableSports = f2.sportTypes.filter((sport) => sport !== 'other' && sport !== 'sepakbola')
    appendResource('lapangan-f2', 'Lapang F2', selectableSports)
    if (f2.sportTypes.includes('sepakbola')) {
      footballCard = toFacilityCard(f2)
      footballCard.key = `${f2.id}-sepakbola`
      footballCard.name = 'Lapang Sepakbola'
      footballCard.description = 'Sepak bola di Lapang F2'
      footballCard.sportTypes = ['sepakbola']
    }
  }

  const appendTableRoom = (slugPrefix: 'biliard' | 'tenis-meja', name: string, sportType: string, icon: 'biliard' | 'tenismeja') => {
    const tables = resources
      .filter((resource) => resource.slug.startsWith(`${slugPrefix}-`))
      .sort((left, right) => left.slug.localeCompare(right.slug, 'id'))
    const firstTable = tables[0]
    if (!firstTable) return

    const tableNumber = (slug: string, index: number) => slug.match(/-(\d+)$/)?.[1] ?? String(index + 1)
    const room = toFacilityCard(firstTable)
    room.name = name
    room.description = `${tables.length} meja tersedia`
    room.sportTypes = [sportType]
    room.selectionTitle = 'Pilih Meja'
    room.bookingOptions = tables.map((table, index) => {
      const number = tableNumber(table.slug, index)
      return {
        id: `meja-${number}`,
        label: `Meja ${number}`,
        icon,
        resourceId: table.id,
        sportType,
      }
    })
    facilities.push(room)
  }

  appendTableRoom('biliard', 'Ruang Billiard', 'billiard', 'biliard')
  appendTableRoom('tenis-meja', 'Ruang Tenis Meja', 'tennis', 'tenismeja')
  if (footballCard) facilities.push(footballCard)

  return facilities
}

export default HomePage