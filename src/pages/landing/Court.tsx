import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fallbackCourtImage, getCourtImages, getPublicCourts, formatCourtPrice, type PublicCourt } from './publicCourt'

function CourtImage({ court }: { court: PublicCourt }) {
	const image = getCourtImages(court)[0]

	return <img src={image || fallbackCourtImage} alt={court.name} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = fallbackCourtImage }} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
}

export default function Court() {
	const { t } = useTranslation()
	const [courts, setCourts] = useState<PublicCourt[]>([])
	const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

	const loadCourts = () => {
		setStatus('loading')
		getPublicCourts()
			.then((resources) => {
				setCourts(resources)
				setStatus('ready')
			})
			.catch(() => setStatus('error'))
	}

	useEffect(() => {
		let active = true
		getPublicCourts()
			.then((resources) => {
				if (!active) return
				setCourts(resources)
				setStatus('ready')
			})
			.catch(() => {
				if (active) setStatus('error')
			})
		return () => { active = false }
	}, [])

	return (
		<section id="lapangan" className="relative overflow-hidden border-y border-[#DDE5D5] bg-[#F3F6EE] px-4 py-14 sm:px-6 sm:py-18 lg:py-22">
			<div className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full border-[28px] border-[#DCECC1]/70" aria-hidden="true" />
			<div className="relative mx-auto max-w-[1200px]">
				<div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
					<div className="max-w-2xl">
						<p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[#62751E]">{t('landing.courtEyebrow')}</p>
						<h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-[#243523] sm:text-3xl lg:text-4xl">{t('landing.courtTitle')}</h2>
						<p className="mt-3 max-w-xl text-sm leading-7 text-[#59635A] sm:text-base">{t('landing.courtDescription')}</p>
					</div>
				</div>

				{status === 'loading' && <div role="status" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><div className="h-80 animate-pulse rounded-2xl bg-white/70" /><div className="hidden h-80 animate-pulse rounded-2xl bg-white/70 sm:block" /><div className="hidden h-80 animate-pulse rounded-2xl bg-white/70 lg:block" /></div>}
				{status === 'error' && <div className="mt-8 rounded-2xl border border-[#D8E1D2] bg-white px-6 py-10 text-center"><p className="text-sm text-[#59635A]">{t('landing.courtError')}</p><button type="button" onClick={loadCourts} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#CDF178] px-5 py-2.5 text-xs font-bold text-[#34410D] transition-colors hover:bg-[#B5DC52]"><RefreshCw size={14} />{t('landing.courtRetry')}</button></div>}
				{status === 'ready' && courts.length === 0 && <div className="mt-8 rounded-2xl border border-[#D8E1D2] bg-white px-6 py-10 text-center text-sm text-[#59635A]">{t('landing.courtEmpty')}</div>}
				{status === 'ready' && courts.length > 0 && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{courts.map((court) => <article key={court.id} className="group overflow-hidden rounded-2xl border border-[#DCE5D8] bg-white shadow-[0_8px_24px_rgba(47,76,39,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(47,76,39,0.14)]"><div className="relative aspect-[16/10] overflow-hidden bg-[#E8EDE3]"><CourtImage court={court} /><span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#405315]">{t('landing.courtAvailable')}</span></div><div className="flex min-h-[218px] flex-col p-5"><h3 className="font-heading text-lg font-bold text-[#263626]">{court.name}</h3><div className="mt-2 flex items-center gap-1.5 text-xs text-[#687269]"><MapPin size={14} className="shrink-0 text-[#617B28]" />{court.location ? `${court.location.name}, ${court.location.city}` : t('landing.courtLocationUnavailable')}</div><div className="mt-4 flex flex-wrap gap-1.5">{court.sportTypes.slice(0, 3).map((sport) => <span key={sport} className="rounded-md bg-[#F0F5E9] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#52681A]">{sport.replaceAll('_', ' ')}</span>)}</div><div className="mt-auto flex items-end justify-between gap-3 pt-5"><div><p className="text-[10px] uppercase tracking-wide text-[#899187]">{t('landing.courtStartingPrice')}</p><p className="mt-1 text-sm font-bold text-[#263626]">{formatCourtPrice(court.fromPrice, court.fromPriceFormatted, t('landing.courtPriceOnBooking'))}</p></div><Link to={`/lapangan/${encodeURIComponent(court.slug)}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#004000] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1A5B28]">{t('landing.courtDetails')}<ArrowRight size={14} /></Link></div></div></article>)}</div>}
			</div>
		</section>
	)
}
