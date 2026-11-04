import { Bath, Landmark, Lightbulb, ParkingCircle, Star, Utensils } from 'lucide-react'
import lapangF1 from '../../../assets/images/lapang/Lapang F1.webp'
import { useTranslation } from 'react-i18next'

interface PriceTier {
  id: string
  range: string
  price: string
}

interface FacilityChip {
  id: string
  labelKey: string
  icon: React.ReactNode
}

const COURT_NAME = 'Lapangan F1'
const COURT_RATING = '4.8 / 5.0'
const COURT_REVIEW_COUNT = '(120 Ulasan Terverifikasi)'

const FACILITY_CHIPS: FacilityChip[] = [
  { id: 'toilet', labelKey: 'toilet', icon: <Bath size={14} /> },
  { id: 'led', labelKey: 'led', icon: <Lightbulb size={14} /> },
  { id: 'foodcourt', labelKey: 'foodcourt', icon: <Utensils size={14} /> },
  { id: 'mushola', labelKey: 'mushola', icon: <Landmark size={14} /> },
  { id: 'parkir', labelKey: 'parkir', icon: <ParkingCircle size={14} /> },
]

const MOBILE_RATING_DETAILS = [
  { id: 'kondisi', labelKey: 'courtCondition', value: '4.9/5' },
  { id: 'wc', labelKey: 'restroomCleanliness', value: '4.7/5' },
  { id: 'pendukung', labelKey: 'supportingFacilities', value: '4.8/5' },
]

interface FacilityDetailsProps {
  variant: 'mobile' | 'desktop'
  facilityName?: string
  image?: string
  locationName?: string
  priceTiers?: PriceTier[]
  isPriceLoading?: boolean
}

function FacilityDetails({ variant, facilityName = COURT_NAME, image = lapangF1, locationName = 'OBC Sport Center', priceTiers = [], isPriceLoading = false }: FacilityDetailsProps) {
  const { t } = useTranslation()
  const amenityLabel = (chip: FacilityChip) => `${t(`home.amenities.${chip.labelKey}`)}${chip.id === 'toilet' ? ' T3-T5' : ''}`
  return (
    variant === 'mobile' ? (
      <div>
        <img src={image} alt={facilityName} className="h-[clamp(245px,40svh,340px)] w-full rounded-2xl object-cover" />
        <h1 className="mt-5 font-heading text-2xl font-bold text-[#121212]">{facilityName}</h1>
        <p className="mt-1 text-sm text-[#6F6B6E]">{locationName} - {facilityName}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {isPriceLoading && (
            <p className="col-span-3 text-center text-[10px] text-[#6F6B6E]">{t('booking.priceLoading')}</p>
          )}
          {!isPriceLoading && priceTiers.length === 0 && (
            <p className="col-span-3 text-center text-[10px] text-[#6F6B6E]">{t('booking.priceUnavailable')}</p>
          )}
          {priceTiers.map((tier) => (
            <div key={tier.id} className="rounded-md border border-[#D4D4D4] bg-white px-2 py-1.5">
              <p className="font-heading text-[11px] font-bold leading-tight text-[#121212]">{tier.range}</p>
              <p className="font-heading text-xs font-bold leading-tight text-[#265021]">{tier.price}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-4 font-heading text-xs font-bold text-[#265021]">{t('booking.courtFacilities')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {FACILITY_CHIPS.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs text-[#343133]"
            >
              {chip.icon}
              {amenityLabel(chip)}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-lg border border-[#D4D4D4] bg-white px-4 py-3">
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl font-bold leading-none text-[#265021]">4.8</span>
            <span className="mt-1 text-xs text-[#6F6B6E]">{t('booking.ratingCount', { count: 120 })}</span>
          </div>
          <ul className="space-y-1 text-xs text-[#343133]">
            {MOBILE_RATING_DETAILS.map((detail) => (
              <li key={detail.id}>
                {t(`booking.${detail.labelKey}`)}: {detail.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : (
      <div>
        <img src={image} alt={facilityName} className="h-[clamp(400px,50svh,560px)] w-full rounded-xl object-cover" />
        <h1 className="mt-6 font-heading text-3xl font-bold text-[#343133]">{facilityName}</h1>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((index) => (
              <Star key={index} size={18} className={index < 4 ? 'text-[#F5B301]' : 'text-[#D4D4D4]'} />
            ))}
          </div>
          <span className="font-heading text-base font-semibold text-[#343133]">{COURT_RATING}</span>
          <span className="text-base text-[#343133]">{COURT_REVIEW_COUNT}</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-1.5">
          {isPriceLoading && (
            <p className="col-span-3 text-center text-[10px] text-[#6F6B6E]">{t('booking.priceLoading')}</p>
          )}
          {!isPriceLoading && priceTiers.length === 0 && (
            <p className="col-span-3 text-center text-[10px] text-[#6F6B6E]">{t('booking.priceUnavailable')}</p>
          )}
          {priceTiers.map((tier) => (
            <div key={tier.id} className="rounded-md border border-[#D4D4D4] bg-white px-1.5 py-1">
              <p className="font-heading text-[11px] font-bold leading-tight text-[#121212]">{tier.range}</p>
              <p className="font-heading text-xs font-bold leading-tight text-[#265021]">{tier.price}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-heading text-xs font-bold text-[#265021]">{t('booking.courtFacilities')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {FACILITY_CHIPS.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs text-[#343133]"
            >
              {chip.icon}
              {amenityLabel(chip)}
            </span>
          ))}
        </div>
      </div>
    )
  )
}

export default FacilityDetails