import { Bath, Landmark, Lightbulb, ParkingCircle, Star, Utensils } from 'lucide-react'
import lapangF1 from '../../../assets/layanan/Lapang F1.png'

interface PriceTier {
  id: string
  range: string
  price: string
}

interface FacilityChip {
  id: string
  label: string
  icon: React.ReactNode
}

const COURT_NAME = 'Lapangan F1'
const COURT_RATING = '4.8 / 5.0'
const COURT_REVIEW_COUNT = '(120 Ulasan Terverifikasi)'

const PRICE_TIERS: PriceTier[] = [
  { id: 'pagi', range: '07:00-15:00', price: '125k/jam' },
  { id: 'sore', range: '15:00-18:00', price: '150k/jam' },
  { id: 'malam', range: '18:00-00:00', price: '175k/jam' },
]

const FACILITY_CHIPS: FacilityChip[] = [
  { id: 'toilet', label: 'Toilet T3-T5', icon: <Bath size={11} /> },
  { id: 'led', label: 'LED Light', icon: <Lightbulb size={11} /> },
  { id: 'foodcourt', label: 'Foodcourt', icon: <Utensils size={11} /> },
  { id: 'mushola', label: 'Mushola', icon: <Landmark size={11} /> },
  { id: 'parkir', label: 'Parkir', icon: <ParkingCircle size={11} /> },
]

const MOBILE_RATING_DETAILS = [
  { id: 'kondisi', label: 'Kondisi Lapangan', value: '4.9/5' },
  { id: 'wc', label: 'Kebersihan WC', value: '4.7/5' },
  { id: 'pendukung', label: 'Fasilitas Pendukung', value: '4.8/5' },
]

interface FacilityDetailsProps {
  variant: 'mobile' | 'desktop'
  facilityName?: string
  image?: string
  locationName?: string
}

function FacilityDetails({ variant, facilityName = COURT_NAME, image = lapangF1, locationName = 'OBC Sport Center' }: FacilityDetailsProps) {
  return (
    variant === 'mobile' ? (
      <div>
        <img src={image} alt={facilityName} className="h-[205px] w-full rounded-2xl object-cover" />
        <h1 className="mt-5 font-heading text-xl font-bold text-[#121212]">{facilityName}</h1>
        <p className="mt-1 text-xs text-[#6F6B6E]">{locationName} - {facilityName}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {PRICE_TIERS.map((tier) => (
            <div key={tier.id} className="rounded-md border border-[#D4D4D4] bg-white px-2 py-1.5">
              <p className="font-heading text-[10px] font-bold leading-tight text-[#121212]">
                {tier.range}
              </p>
              <p className="font-heading text-[11px] font-bold leading-tight text-[#265021]">
                {tier.price}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-4 font-heading text-xs font-bold text-[#265021]">Fasilitas Lapangan</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {FACILITY_CHIPS.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] bg-white px-2.5 py-1 text-[11px] text-[#343133]"
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-lg border border-[#D4D4D4] bg-white px-4 py-3">
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl font-bold leading-none text-[#265021]">4.8</span>
            <span className="mt-1 text-[10px] text-[#6F6B6E]">120 Ulasan</span>
          </div>
          <ul className="space-y-0.5 text-[10px] text-[#343133]">
            {MOBILE_RATING_DETAILS.map((detail) => (
              <li key={detail.id}>
                {detail.label}: {detail.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : (
      <div>
        <img src={image} alt={facilityName} className="h-[364px] w-full rounded-xl object-cover" />
        <h1 className="mt-6 font-heading text-2xl font-bold text-[#343133]">{facilityName}</h1>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((index) => (
              <Star key={index} size={16} className={index < 4 ? 'text-[#F5B301]' : 'text-[#D4D4D4]'} />
            ))}
          </div>
          <span className="font-heading text-sm font-semibold text-[#343133]">{COURT_RATING}</span>
          <span className="text-sm text-[#343133]">{COURT_REVIEW_COUNT}</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-1.5">
          {PRICE_TIERS.map((tier) => (
            <div key={tier.id} className="rounded-md border border-[#D4D4D4] bg-white px-1.5 py-1">
              <p className="font-heading text-[10px] font-bold leading-tight text-[#121212]">
                {tier.range}
              </p>
              <p className="font-heading text-[11px] font-bold leading-tight text-[#265021]">
                {tier.price}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-heading text-xs font-bold text-[#265021]">Fasilitas Lapangan</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {FACILITY_CHIPS.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] bg-white px-2 py-1 text-[11px] text-[#343133]"
            >
              {chip.icon}
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    )
  )
}

export default FacilityDetails