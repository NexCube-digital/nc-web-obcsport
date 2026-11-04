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
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

const Court = lazy(() => import('./home/Court'))
const Information = lazy(() => import('./home/Information'))
const Event = lazy(() => import('./home/Event'))
const OrderModal = lazy(() => import('../../components/ui/OrderModal'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
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
  const { t } = useTranslation()
  const { user } = useAuth()
  const userName = user?.name ?? t('common.myAccount')
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [selectedFacility, setSelectedFacility] = useState<FacilityCard | null>(null)
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [apiFacilities, setApiFacilities] = useState<FacilityCard[]>([])
  const [facilityLoadStatus, setFacilityLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [facilityRetry, setFacilityRetry] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    setFacilityLoadStatus('loading')
    getSportsFacilities()
      .then((resources) => {
        if (!active) return
        setApiFacilities(toFacilityCards(resources, t))
        setFacilityLoadStatus('ready')
      })
      .catch(() => {
        if (!active) return
        setApiFacilities([])
        setFacilityLoadStatus('error')
      })

    return () => { active = false }
  }, [facilityRetry, t])

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
        sports: (selectedFacility.bookingOptions ?? selectedFacility.sportTypes?.map((sport) => toSportOption(sport, t)).filter((sport) => sport.id !== 'volleyball') ?? []).map((sport) => ({
          ...sport,
          label: sport.id.startsWith('meja-')
            ? t('home.facilities.table', { number: sport.id.replace('meja-', '') })
            : t(`home.sports.${sport.sportType ?? sport.id}`, { defaultValue: sport.label }),
        })),
        specification: selectedFacility.description || '',
        selectionTitle: selectedFacility.selectionTitle,
        amenities: selectedFacility.amenities?.length
          ? selectedFacility.amenities.map((amenity, index) => ({
              id: `${amenity}-${index}`,
              label: t(`home.amenities.${amenity === 'musholla' ? 'mushola' : amenity}`, { defaultValue: amenity.replaceAll('_', ' ') }),
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
              loadStatus={facilityLoadStatus}
              onRetry={() => setFacilityRetry((current) => current + 1)}
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
              aria-label={isImageZoomed ? t('landing.zoomOut') : t('landing.zoomIn')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              {isImageZoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
            </button>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label={t('landing.closeImage')}
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

function toSportOption(sportType: string, t: TFunction) {
  return {
    id: sportType,
    label: t(`home.sports.${sportType}`, { defaultValue: sportType }),
    icon: SPORT_ICONS[sportType as keyof typeof SPORT_ICONS] ?? 'sepakbola',
  }
}

function toFacilityCard(resource: SportsFacility, t: TFunction): FacilityCard {
  const sportNames = resource.sportTypes
    .filter((sport) => sport !== 'volleyball')
    .map((sport) => t(`home.sports.${sport}`, { defaultValue: sport }))
  const image = getImageUrl(resource.imageUrl ?? resource.gallery?.[0]) ?? ''

  return {
    id: resource.id,
    name: resource.name,
    description: sportNames.join(', ') || resource.description || resource.resourceType,
    badge: t('booking.available'),
    buttonLabel: t('booking.bookCourt'),
    image,
    sportTypes: resource.sportTypes,
    slotMinutes: resource.slotMinutes,
    fromPrice: resource.fromPrice,
    fromPriceFormatted: resource.fromPriceFormatted,
    amenities: resource.amenities ?? [],
    location: resource.location,
  }
}

function toFacilityCards(resources: SportsFacility[], t: TFunction): FacilityCard[] {
  const resourcesBySlug = new Map(resources.map((resource) => [resource.slug, resource]))
  const facilities: FacilityCard[] = []
  const appendResource = (slug: string, name: string, sportTypes?: string[]) => {
    const resource = resourcesBySlug.get(slug)
    if (!resource) return
    const card = toFacilityCard(resource, t)
    card.name = name
    if (sportTypes) {
      card.sportTypes = sportTypes
      card.description = sportTypes.map((sport) => t(`home.sports.${sport}`, { defaultValue: sport })).join(', ')
    }
    facilities.push(card)
  }

  appendResource('lapangan-f1', t('home.facilities.courtF1'))

  const f2 = resourcesBySlug.get('lapangan-f2')
  let footballCard: FacilityCard | undefined
  if (f2) {
    const selectableSports = f2.sportTypes.filter((sport) => sport !== 'other' && sport !== 'sepakbola')
    appendResource('lapangan-f2', t('home.facilities.courtF2'), selectableSports)
    if (f2.sportTypes.includes('sepakbola')) {
      footballCard = toFacilityCard(f2, t)
      footballCard.key = `${f2.id}-sepakbola`
      footballCard.name = t('home.facilities.soccerF2')
      footballCard.description = t('home.facilities.soccerDescription')
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
    const room = toFacilityCard(firstTable, t)
    room.name = name
    room.description = t('home.facilities.tablesAvailable', { count: tables.length })
    room.sportTypes = [sportType]
    room.selectionTitle = t('orderModal.chooseTableTitle')
    room.bookingOptions = tables.map((table, index) => {
      const number = tableNumber(table.slug, index)
      return {
        id: `meja-${number}`,
        label: t('home.facilities.table', { number }),
        icon,
        resourceId: table.id,
        sportType,
      }
    })
    facilities.push(room)
  }

  appendTableRoom('biliard', t('home.facilities.billiardsRoom'), 'billiard', 'biliard')
  appendTableRoom('tenis-meja', t('home.facilities.tableTennisRoom'), 'tennis', 'tenismeja')
  if (footballCard) facilities.push(footballCard)

  return facilities
}

export default HomePage