import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getPublicBusinessUnits } from '../../services/businessUnitPublicService'
import { getImageUrl } from '../../utils/imageUrl'
import fallbackCourtImage from '../../assets/no-image.webp'

type Unit = {
	id: string
	slug: string
	name: string
	image: string | null
	link: string
}

const FONT = "font-['Montserrat',sans-serif]"
const bookingClass = `${FONT} inline-flex h-8 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-3 text-[11px] font-bold text-black shadow-[0_2px_4px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-colors hover:bg-[#004000] hover:text-white md:h-7 md:w-auto`
const detailClass = `${FONT} inline-flex h-7 w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-black transition-colors hover:text-[#004000] md:w-auto md:justify-start md:text-[13px]`

type UnitCardProps = {
	unit: Unit
}

function UnitCard({ unit }: UnitCardProps) {
	const { t } = useTranslation()
	return (
		<article
			className="group relative flex flex-col items-center rounded-[14px] border border-transparent bg-white p-3 pt-[22px] text-center shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b8e28a] hover:bg-[#f0f7e6] hover:shadow-[0_12px_28px_rgba(0,64,0,0.12)] md:rounded-[20px] md:p-5 md:pt-6"
		>
			<div className="pointer-events-none grid h-[78px] w-[78px] place-items-center md:h-[clamp(72px,13.5svh,108px)] md:w-[clamp(72px,13.5svh,108px)]">
				{unit.image ? (
					<img
						src={unit.image}
						className="block max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
						alt={t('landing.businessLogoAlt', { name: unit.name })}
						onError={(event) => { event.currentTarget.src = fallbackCourtImage }}
						loading="lazy"
						decoding="async"
					/>
				) : (
					<img src={fallbackCourtImage} alt={t('landing.businessLogoAlt', { name: unit.name })} className="block max-h-full max-w-full object-contain" />
				)}
			</div>
			<div className="mt-2 w-full text-center md:mt-3 md:text-left">
				<h3 className={`${FONT} min-h-10 text-[14px] font-bold leading-tight text-[#111111] md:text-[16px]`}>
					{unit.name}
				</h3>
				<div className="mt-1.5 flex w-full flex-col items-stretch gap-1.5 md:mt-2.5 md:flex-row md:items-center md:justify-between md:gap-2">
					<a className={bookingClass} href={unit.link} target="_blank" rel="noreferrer">
						{t('landing.businessBooking')}
					</a>
					<a className={detailClass} href={unit.link} target="_blank" rel="noreferrer">
						{t('landing.businessDetail')} <ArrowRight size={14} />
					</a>
				</div>
			</div>
		</article>
	)
}

export default function UnitBisnis() {
	const { t } = useTranslation()
	const [units, setUnits] = useState<Unit[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)

	useEffect(() => {
		let active = true

		getPublicBusinessUnits()
			.then((businessUnits) => {
				if (!active) return
				setUnits(businessUnits.flatMap((unit) => {
					if (unit.config.showOnSport === false) return []
					const imagePath = typeof unit.config.imageUrl === 'string' ? unit.config.imageUrl : null
					const link = unit.slug === 'obc-sport'
						? 'https://sport.obcgroup.id/'
						: `https://obcgroup.id/unit-bisnis/${encodeURIComponent(unit.slug)}`
					return [{ id: unit.id, slug: unit.slug, name: unit.name, image: getImageUrl(imagePath), link }]
				}))
			})
			.catch(() => {
				if (active) setHasError(true)
			})
			.finally(() => {
				if (active) setIsLoading(false)
			})

		return () => { active = false }
	}, [])

	return (
		<section
			className="mx-auto flex w-[calc(100%-44px)] max-w-[1280px] flex-col bg-[#fffff7] py-10 md:w-[calc(100%-48px)] md:py-14"
			id="layanan"
		>
			<span className={`${FONT} mb-1 block text-center text-[16px] font-medium text-black md:mb-3 md:text-[18px] md:font-semibold md:uppercase md:tracking-[1.4px] md:text-[#000000CC]`}>
				{t('landing.businessBadge')}
			</span>
			<h2 className={`${FONT} mx-auto w-full max-w-[1098px] text-center text-[22px] font-semibold leading-[30px] text-black md:text-[28px] md:font-bold md:leading-[40px] md:tracking-[1px] lg:text-[36px] lg:leading-[45px] lg:tracking-[1.5px]`}>
				{t('landing.businessTitle')}
			</h2>
			<div className="mx-auto mt-4 w-full max-w-[812px] border-t border-[#00000080] md:border-t-2" aria-hidden="true" />
			<div className="mt-6 flex w-full flex-wrap justify-center gap-[14px] md:mt-[clamp(16px,3.5svh,28px)] md:gap-5">
				{units.map((unit) => (
					<div key={unit.id} className="w-[calc((100%_-_14px)/2)] max-w-[280px] md:w-[calc((100%_-_40px)/3)] lg:w-[calc((100%_-_60px)/4)]">
						<UnitCard unit={unit} />
					</div>
				))}
			</div>
			{isLoading && <p className="mt-6 text-center text-sm text-[#62665f]">{t('landing.businessLoading')}</p>}
			{!isLoading && hasError && <p role="status" className="mt-6 text-center text-sm text-[#62665f]">{t('landing.businessError')}</p>}
			{!isLoading && !hasError && units.length === 0 && <p className="mt-6 text-center text-sm text-[#62665f]">{t('landing.businessEmpty')}</p>}
		</section>
	)
}