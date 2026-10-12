import { ChevronRight, CircleHelp, Clock3, Settings, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import MobileHeader from '../../components/layout/MobileHeader'

interface ProfileLink {
	label: string
	description: string
	href: string
	icon: LucideIcon
}

const PROFILE_LINKS: ProfileLink[] = [
	{ label: 'Pengaturan Profil', description: 'Ubah informasi dan keamanan akun', href: '/pengaturan', icon: Settings },
	{ label: 'Riwayat', description: 'Lihat transaksi dan pemesanan', href: '/history', icon: Clock3 },
	{ label: 'Bantuan', description: 'Temukan jawaban dan dukungan', href: '/bantuan', icon: CircleHelp },
]

function ProfileMobile() {
	// TODO: ganti dengan nama user dari auth context / API
	const userName = 'Budiman Santoso'
	const initials = userName
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')

	return (
		<div className="min-h-[100dvh] bg-[#FDFCF7] pb-28 font-body text-[#343133] md:flex md:flex-col md:justify-center md:pb-0">
			<MobileHeader variant="title" title="Profil" />

			<main className="mx-auto w-full max-w-md px-4 pt-5 sm:max-w-xl sm:px-6 sm:pt-8 md:max-w-5xl md:px-8 md:py-12">
				<div className="md:grid md:grid-cols-[minmax(300px,380px)_1fr] md:items-start md:gap-10 lg:gap-14">
					{/* ================= Kartu profil ================= */}
					<section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004000] to-[#404F14] px-5 py-6 text-white shadow-[0_8px_24px_rgba(0,64,0,0.18)] sm:px-7 sm:py-8 md:sticky md:top-8 md:flex md:flex-col md:items-center md:px-8 md:py-12 md:text-center">
						<span
							aria-hidden="true"
							className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#CDF178]/10"
						/>
						<span
							aria-hidden="true"
							className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/5"
						/>

						<div className="relative flex items-center gap-4 md:flex-col md:gap-5">
							<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#CDF178] font-heading text-xl font-bold text-[#404F14] ring-4 ring-white/20 sm:h-[72px] sm:w-[72px] sm:text-2xl md:h-28 md:w-28 md:text-4xl">
								{initials || <UserRound size={32} aria-hidden="true" />}
							</div>
							<div className="min-w-0">
								<h1 className="truncate font-heading text-lg font-bold leading-tight sm:text-xl md:whitespace-normal md:text-2xl">
									{userName}
								</h1>
								<p className="mt-1 text-xs text-white/75 sm:text-sm">Kelola akun dan aktivitas Anda</p>
							</div>
						</div>
					</section>

					{/* ================= Menu ================= */}
					<nav aria-label="Menu profil" className="mt-5 md:mt-0">
						<ul className="space-y-3 md:space-y-4">
							{PROFILE_LINKS.map(({ label, description, href, icon: Icon }) => (
								<li key={href}>
									<Link
										to={href}
										className="group flex min-h-[76px] items-center gap-3.5 rounded-2xl border border-[#E2DFD2] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(52,49,51,0.06)] transition-all hover:border-[#9AAD3E] hover:bg-[#FDFCF7] hover:shadow-[0_6px_20px_rgba(64,79,20,0.14)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004000] md:min-h-[92px] md:gap-5 md:px-6 md:py-4"
									>
										<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#CDF178]/50 text-[#404F14] transition-colors group-hover:bg-[#CDF178] md:h-14 md:w-14 md:rounded-2xl">
											<Icon size={22} strokeWidth={1.8} aria-hidden="true" className="md:h-6 md:w-6" />
										</span>
										<span className="min-w-0 flex-1">
											<span className="block font-heading text-sm font-semibold text-[#343133] sm:text-base md:text-lg">
												{label}
											</span>
											<span className="mt-0.5 block text-xs text-[#6F6B6E] sm:text-sm">
												{description}
											</span>
										</span>
										<ChevronRight
											size={20}
											aria-hidden="true"
											className="shrink-0 text-[#9A9A9A] transition-all group-hover:translate-x-0.5 group-hover:text-[#004000]"
										/>
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</main>
		</div>
	)
}

export default ProfileMobile