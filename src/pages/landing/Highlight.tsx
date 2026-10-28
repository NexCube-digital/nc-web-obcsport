import { Trophy, Users, Zap } from 'lucide-react'

interface HighlightItem {
	id: string
	icon: React.ReactNode
	title: string
	description: string
}

const HIGHLIGHTS: HighlightItem[] = [
	{
		id: 'booking',
		icon: <Zap size={20} className="text-[#404F14]" />,
		title: 'Booking Real-Time',
		description: 'Konfirmasi instan tanpa harus chat admin manual.',
	},
	{
		id: 'fasilitas',
		icon: <Trophy size={20} className="text-[#404F14]" />,
		title: 'Fasilitas Premium',
		description: 'Sistem pencahayaan LED standar turnamen internasional.',
	},
	{
		id: 'membership',
		icon: <Users size={20} className="text-[#404F14]" />,
		title: 'Sistem Membership',
		description: 'Akses latihan eksklusif & program akademi terstruktur.',
	},
]

function Highlight() {
	return (
		<section className="mx-auto max-w-[1248px] px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:pb-12 lg:pt-20">
			<div className="grid gap-4 md:grid-cols-3 md:gap-6">
				{HIGHLIGHTS.map((item) => (
					<div
						key={item.id}
						className="flex flex-col gap-1.5 rounded-xl border border-[#D4D4D4] bg-white px-4 py-4 sm:flex-row sm:items-center sm:gap-3 md:flex-col md:items-start md:gap-1.5 lg:flex-row lg:items-center lg:gap-3"
					>
						<div className="flex shrink-0 items-center gap-2">
							{item.icon}
							<h3 className="font-heading text-base font-bold text-[#404F14]">
								{item.title}
							</h3>
						</div>
						<p className="text-sm leading-snug text-[#6F6B6E]">{item.description}</p>
					</div>
				))}
			</div>
		</section>
	)
}

export default Highlight
