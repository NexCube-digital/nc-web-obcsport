import { Hand } from 'lucide-react'

interface HeroProps {
	userName: string
	searchQuery: string
	onSearchQueryChange: (value: string) => void
	onSearch: () => void
}

const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

function Hero({ userName, searchQuery, onSearchQueryChange, onSearch }: HeroProps) {
	return (
		<section className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-[#265021] to-[#404F14] px-3 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:rounded-3xl sm:gap-4 sm:px-5 sm:py-4 lg:min-h-[180px] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-0">
			<div className="min-w-0">
				<h1
					className={`${FONT_MONTSERRAT} break-words text-lg font-bold leading-tight text-white min-[360px]:text-xl sm:text-2xl sm:leading-8 lg:text-[28px] lg:leading-9`}
				>
					Halo, {userName}! <Hand className="inline-block h-4 w-4 align-[-2px] min-[360px]:h-5 min-[360px]:w-5 sm:h-5 sm:w-5" aria-hidden="true" />
				</h1>
				<p className="mt-1 max-w-[540px] text-[11px] leading-snug text-white font-heading min-[360px]:text-xs sm:text-sm sm:leading-relaxed">
					Temukan lapangan favoritmu dan mulai berolahraga hari ini. Pilih tanggal
					&amp; jam main untuk memulai booking.
				</p>
			</div>

			<div className="flex w-full flex-col items-stretch gap-2 min-[300px]:flex-row min-[300px]:items-center sm:gap-2.5 lg:w-auto lg:shrink-0">
				<input
					type="text"
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					onKeyDown={(event) => event.key === 'Enter' && onSearch()}
					placeholder="Cari lapangan olahraga..."
					className="h-10 w-full min-w-0 rounded-lg border border-[#D4D4D4] bg-white px-3 text-xs text-[#343133] placeholder:text-[#6F6B6E] focus:outline-none font-heading min-[300px]:flex-1 sm:h-11 sm:text-sm lg:h-[46px] lg:w-[300px] lg:flex-none"
				/>
				<button
					type="button"
					onClick={onSearch}
					className="h-10 w-full shrink-0 cursor-pointer rounded-lg bg-[#CDF178] text-xs font-semibold text-[#404F14] transition-colors hover:bg-[#9AAD3E] font-heading min-[300px]:w-[60px] sm:h-11 sm:w-[70px] sm:text-sm lg:h-[46px] lg:w-[78px]"
				>
					Cari
				</button>
			</div>
		</section>
	)
}

export default Hero
