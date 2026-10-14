const ANNOUNCEMENT = 'Lapangan 1 booked for Inter-school Futsal Tournament on Sept 28'
const FONT_MONTSERRAT = "font-['Montserrat',sans-serif]"

function Information() {
	return (
		<section className="mt-4 rounded-2xl border border-[#D4D4D4] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] sm:mt-6 sm:rounded-3xl sm:p-6">
			<h2
				className={`${FONT_MONTSERRAT} break-words text-xl font-bold leading-tight text-[#404F14] min-[360px]:text-2xl sm:text-[28px] sm:leading-9`}
			>
				INFORMASI CEPAT
			</h2>
			<p className="mt-1 max-w-[540px] text-xs leading-relaxed text-[#343133] font-heading min-[360px]:text-sm">
				Temukan lapangan favoritmu dan mulai berolahraga hari ini. Pilih tanggal
				&amp; jam main untuk memulai booking.
			</p>

			<div className="mt-4 flex min-h-11 items-start gap-2 rounded-lg border border-[#C00000] bg-[#FDF2F2] px-3 py-2 sm:mt-5 sm:items-center sm:gap-3">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#C00000"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
					className="mt-px shrink-0 sm:mt-0"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 8v4" />
					<path d="M12 16h.01" />
				</svg>
				<span className="min-w-0 break-words text-xs font-medium leading-snug text-[#C00000] font-heading sm:text-[13px]">
					{ANNOUNCEMENT}
				</span>
			</div>
		</section>
	)
}

export default Information
