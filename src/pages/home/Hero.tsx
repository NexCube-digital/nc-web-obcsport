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
		<section className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#265021] to-[#404F14] px-4 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:rounded-3xl sm:px-6 lg:min-h-[180px] lg:flex-row lg:items-center lg:justify-between lg:py-0">
			<div className="min-w-0">
				<h1
					className={`${FONT_MONTSERRAT} break-words text-xl font-bold leading-tight text-white min-[360px]:text-2xl sm:text-[28px] sm:leading-9`}
				>
					Halo, {userName}! <Hand className="inline-block h-5 w-5 align-[-2px] sm:h-6 sm:w-6" aria-hidden="true" />
				</h1>
				<p className="mt-1 max-w-[540px] text-xs leading-relaxed text-white font-heading min-[360px]:text-sm">
					Temukan lapangan favoritmu dan mulai berolahraga hari ini. Pilih tanggal
					&amp; jam main untuk memulai booking.
				</p>
			</div>

			<div className="flex w-full flex-col items-stretch gap-2 min-[300px]:flex-row min-[300px]:items-center sm:gap-3 lg:w-auto lg:shrink-0">
				<input
					type="text"
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					onKeyDown={(event) => event.key === 'Enter' && onSearch()}
					placeholder="Cari lapangan olahraga..."
					className="h-11 w-full min-w-0 rounded-lg border border-[#D4D4D4] bg-white px-3 text-sm text-[#343133] placeholder:text-[#6F6B6E] focus:outline-none font-heading min-[300px]:flex-1 sm:h-[46px] lg:w-[300px] lg:flex-none"
				/>
				<button
					type="button"
					onClick={onSearch}
					className="h-11 w-full shrink-0 cursor-pointer rounded-lg bg-[#CDF178] text-sm font-semibold text-[#404F14] transition-colors hover:bg-[#9AAD3E] font-heading min-[300px]:w-[64px] sm:h-[46px] sm:w-[78px]"
				>
					Cari
				</button>
			</div>
		</section>
	)
}

export default Hero
