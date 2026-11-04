import { Trophy, Users, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HighlightItem {
	id: string
	icon: React.ReactNode
	title: string
	description: string
}

function Highlight() {
	const { t } = useTranslation()
	const highlights = t('landing.highlights', { returnObjects: true }) as Array<{ title: string; description: string }>
	const icons = [<Zap key="booking" size={20} className="text-[#404F14]" />, <Trophy key="facilities" size={20} className="text-[#404F14]" />, <Users key="membership" size={20} className="text-[#404F14]" />]
	return (
		<section className="mx-auto max-w-[1248px] px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:pb-12 lg:pt-20">
			<div className="grid gap-4 md:grid-cols-3 md:gap-6">
				{highlights.map((item, index) => (
					<div
						key={item.title}
						className="flex flex-col gap-1.5 rounded-xl border border-[#D4D4D4] bg-white px-4 py-4 sm:flex-row sm:items-center sm:gap-3 md:flex-col md:items-start md:gap-1.5 lg:flex-row lg:items-center lg:gap-3"
					>
						<div className="flex shrink-0 items-center gap-2">
							{icons[index]}
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
