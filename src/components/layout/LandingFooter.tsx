import { Link } from 'react-router-dom'
import { ArrowUp, Globe, Headphones, Mail, MapPin } from 'lucide-react'
import logo from '../../assets/logo/obclogo.webp'
import lapangF1Image from '../../assets/layanan/Lapang F1.png'
import whatsappIcon from '../../assets/icon/whatsapp2.svg'

const NAVIGASI_LINKS = [        
	{ label: 'Beranda', to: '/' },
	{ label: 'Tentang Kami', to: '/tentang-kami' },
	{ label: 'Unit Bisnis', to: '/unit-bisnis' },
	{ label: 'OBC Sport Center', to: '/unit-bisnis/sport-center' },
	{ label: 'OBC Gedung Multifungsi', to: '/unit-bisnis/gedung-multifungsi' },
	{ label: 'Galeri', to: '/galeri' },
	{ label: 'Testimoni', to: '/testimoni' },
	{ label: 'Kontak', to: '#kontak' },
]

const UNIT_LINKS = [
	{ label: 'OBC Sport Center', to: '/unit-bisnis' },
	{ label: 'OBC Guest House', to: '/unit-bisnis/guest-house' },
	{ label: 'OBC Villa', to: '/unit-bisnis/villa' },
	{ label: 'OBC Laundry', to: '/unit-bisnis/laundry' },
	{ label: 'OBC Food Court', to: '/unit-bisnis/food-court' },
	{ label: 'OBC Coffee', to: '/unit-bisnis/coffee' },
	{ label: 'OBC Agribisnis', to: '/unit-bisnis/agribisnis' },
]

/* Data kontak — ganti dengan data resmi OBC kalau sudah tersedia dari admin/CMS. */
const CONTACT = {
	email: 'obc.managementbdg@gmail.com',
	whatsapp: 'https://wa.me/6288860709000',
	instagram: 'https://instagram.com/obcgroup.bdg',
	tiktok: 'https://www.tiktok.com/@obcgroup.bdg',
	address: 'Jl. Rancabentang, No.12, Ciumbuleuit, Kec. Cidadap, Kota Bandung, Jawa Barat 40142',
	maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Jl. Rancabentang, No.12, Ciumbuleuit, Kec. Cidadap, Kota Bandung, Jawa Barat 40142')}`,
}

function InstagramLogo({ className = 'h-[16px] w-[16px]' }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current stroke-[1.8]`}>
			<rect x="3" y="3" width="18" height="18" rx="5" />
			<circle cx="12" cy="12" r="4" />
			<circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
		</svg>
	)
}

function TikTokLogo({ className = 'h-[14px] w-[14px]' }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-current`}>
			<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
		</svg>
	)
}

function WhatsAppSocialIcon({ className = 'h-[16px] w-[16px]' }: { className?: string }) {
	return (
		<svg viewBox="0 0 33 33" aria-hidden="true" className={`${className} fill-current`}>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M25.8199 23.0456C25.4266 24.159 23.8631 25.08 22.6163 25.3494C21.7627 25.5306 20.6497 25.6739 16.8994 24.1199C12.6872 22.3747 6.83808 16.1584 6.83808 12.0217C6.83808 9.91575 8.05229 7.46353 10.1755 7.46353C11.1972 7.46353 11.4224 7.48345 11.7586 8.28989C12.1519 9.24 13.1115 11.5809 13.2257 11.8208C13.6974 12.8052 12.7459 13.3814 12.0556 14.2385C11.8353 14.4965 11.5856 14.7754 11.8647 15.2554C12.1421 15.7255 13.1017 17.2895 14.5117 18.5448C16.3331 20.1676 17.81 20.6856 18.3388 20.9061C18.7321 21.0693 19.2021 21.0312 19.4893 20.7244C19.8533 20.3309 20.3053 19.6781 20.7656 19.035C21.0903 18.5746 21.5032 18.5171 21.9357 18.6803C22.2278 18.7816 25.9406 20.5058 26.0973 20.7818C26.2132 20.9825 26.2132 21.9323 25.8199 23.0456ZM16.3233 0H16.3151C7.31787 0 0 7.32009 0 16.32C0 19.8886 1.15057 23.1994 3.10734 25.8849L1.07387 31.9491L7.34565 29.945C9.92584 31.6525 13.0054 32.64 16.3233 32.64C25.3205 32.64 32.64 25.3199 32.64 16.32C32.64 7.32009 25.3205 0 16.3233 0Z"
			/>
		</svg>
	)
}

/* Kelas bersama */
const headingClass =
	"font-['Montserrat'] text-[14px] font-bold uppercase leading-4 tracking-[0px] text-white md:h-4 md:w-[169px]"
const linkClass =
	"font-['Montserrat'] text-[13px] font-medium leading-4 tracking-[0px] text-white! transition-colors hover:text-[#CDF178]! md:text-[12px]"

/* Kelas tombol sosmed bulat di bagian atas (mobile lebih besar supaya mudah di-tap) */
const socialButtonClass =
	'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FFFFF7] text-black shadow-[0px_1px_1px_0px_#00000040] transition-transform hover:scale-110 md:h-8 md:w-8'

function LandingFooter() {
	const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

	return (
		<footer id="kontak" className="bg-white p-2 sm:px-[34px] sm:py-[20px]">
			<div
				className="relative mx-auto w-full overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat md:min-h-[550px] md:rounded-[25px]"
				style={{
					backgroundColor: 'rgba(1, 38, 3, 0.84)',
					backgroundImage: `linear-gradient(180deg, rgba(1, 38, 3, 0.84) 0%, rgba(1, 38, 3, 0.84) 100%), url(${lapangF1Image})`,
				}}
			>
				{/* ===== Konten utama ===== */}
				<div className="mx-auto w-full max-w-[1246px] px-4 md:px-10 md:pt-[60px] lg:px-12">
					<div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-[1.3fr_0.9fr_1fr_1.1fr] md:gap-8 lg:gap-12">
						{/* Logo + sosial media — di mobile dipusatkan penuh */}
						<div className="order-1 col-span-2 flex w-full flex-col items-center md:order-none md:col-span-1 md:items-start md:gap-3">
							<Link
								to="/"
								aria-label="Beranda"
								className="inline-flex h-auto w-full max-w-[400px] items-center justify-center px-[10px] md:h-[95px] md:w-auto md:max-w-none md:justify-start md:p-0"
							>
								{/* Tinggi otomatis mengikuti lebar logo, jadi tidak ada ruang kosong atas-bawah */}
								<img
									src={logo}
									alt="OBC"
									className="h-auto w-full object-contain object-center md:h-full md:w-auto md:object-left"
								/>
							</Link>
							<div className="flex items-center justify-center gap-5 md:justify-start md:gap-4 md:pt-1">
								<a
									href={CONTACT.whatsapp}
									target="_blank"
									rel="noreferrer"
									aria-label="WhatsApp OBC Group"
									className={`${socialButtonClass}`}
								>
								<img
									src={whatsappIcon}
									alt=""
									aria-hidden="true"
									className="h-5 w-5 md:h-4 md:w-4"
									style={{ filter: "brightness(0)" }} />								
								</a>
								<a
									href={CONTACT.instagram}
									target="_blank"
									rel="noreferrer"
									aria-label="Instagram OBC Group"
									className={socialButtonClass}
								>
									<InstagramLogo className="h-5 w-5 md:h-4 md:w-4" />
								</a>
								<a
									href={CONTACT.tiktok}
									target="_blank"
									rel="noreferrer"
									aria-label="TikTok OBC Group"
									className={socialButtonClass}
								>
									<TikTokLogo className="h-[18px] w-[18px] md:h-4 md:w-4" />
								</a>
							</div>
						</div>

						{/* Perusahaan */}
						<div className="order-3 px-2 md:order-none md:px-0">
							<h3 className={headingClass}>Perusahaan</h3>
							<ul className="mt-4 flex flex-col gap-[14px] font-['Montserrat'] text-[13px] font-medium leading-4 tracking-[0px] text-white md:mt-[15px] md:gap-[15px] md:text-[12px]">
								{NAVIGASI_LINKS.map((link) => (
									<li key={link.to}>
										{link.to.startsWith('#') ? (
											<a href={link.to} className={linkClass}>
												{link.label}
											</a>
										) : (
											<Link to={link.to} className={linkClass}>
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>

						{/* Unit bisnis */}
						<div className="order-4 px-2 md:order-none md:px-0">
							<h3 className={headingClass}>Unit Bisnis</h3>
							<ul className="mt-4 flex flex-col gap-[14px] font-['Montserrat'] text-[13px] font-medium leading-4 tracking-[0px] text-white md:mt-[15px] md:gap-[15px] md:text-[12px]">
								{UNIT_LINKS.map((unit) => (
									<li key={unit.to}>
										<Link to={unit.to} className={linkClass}>
											{unit.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Hubungi kami — padding mobile disamakan dengan kolom di bawahnya agar sejajar */}
						<div className="order-2 col-span-2 px-2 md:order-none md:col-span-1 md:px-0">
							<h3 className={`${headingClass} flex items-center gap-2 md:gap-1`}>
								<Headphones size={14} />
								Hubungi Kami
							</h3>
							<ul className="mt-4 flex flex-col gap-[14px] font-['Montserrat'] text-[13px] font-medium leading-5 tracking-[0px] text-white md:mt-[15px] md:text-[12px] md:leading-4">
								<li className="flex items-center gap-3 md:gap-2">
									<Mail size={15} className="shrink-0" />
									<a
										href={`mailto:${CONTACT.email}`}
										className="min-w-0 break-all transition-colors hover:text-[#CDF178]"
									>
										{CONTACT.email}
									</a>
								</li>
								<li className="flex items-start gap-3 md:gap-2">
									<MapPin size={15} className="mt-[3px] shrink-0" />
									<a
										href={CONTACT.maps}
										target="_blank"
										rel="noreferrer"
										className="text-left transition-colors hover:text-[#CDF178] md:text-justify"
									>
										{CONTACT.address}
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-4 flex justify-end px-6 md:absolute md:bottom-[105px] md:right-12 md:mt-0 md:px-0">
					<button
						type="button"
						onClick={scrollToTop}
										aria-label="Kembali ke atas"
						className="grid h-11 w-11 place-items-center rounded-full border-[0.5px] border-[#008C00] bg-[#004000] text-[#CDF178] shadow-lg transition-transform hover:-translate-y-1 md:h-[44px] md:w-[36px]"
					>
						<ArrowUp className="h-5 w-5 md:h-5 md:w-[15px]" />
					</button>
				</div>

				{/* ===== Teks besar "OBC GROUP" (memudar ke bawah) ===== */}
				<div className="mx-auto mt-2 flex h-[64px] w-full max-w-[1246px] justify-center overflow-hidden md:mt-[36px] md:h-[110px]">
					<span
						aria-hidden="true"
						className="mt-[4px] w-auto max-w-full select-none whitespace-nowrap bg-clip-text text-center font-['Montserrat'] text-[clamp(40px,12vw,56px)] font-black leading-[60px] text-transparent md:mt-[10px] md:h-[83px] md:text-[90px] md:leading-[83px] lg:text-[105px]"
						style={{
							backgroundImage:
								'linear-gradient(180deg, #FFFFFF 0.24%, rgba(31, 51, 32, 0) 90%)',
						}}
					>
						OBC GROUP
					</span>
				</div>

				{/* ===== Bar bawah ===== */}
				<div className="md:border-t md:border-white/10">
					<div className="mx-auto flex w-full max-w-[1246px] flex-col items-center gap-1 px-6 pb-5 pt-1 text-center font-['Montserrat'] text-[12px] font-normal leading-4 tracking-[0px] text-white md:h-[70px] md:min-h-[70px] md:flex-row md:justify-between md:gap-4 md:px-10 md:py-5 md:text-left lg:px-12">
										<p>© {new Date().getFullYear()} Onny Barber Center Group. Hak cipta dilindungi undang-undang.</p>

						<p>
											Dikembangkan oleh{' '}
							<a
								href="https://nexcube-digital.com/"
								target="_blank"
								rel="noreferrer"
								className="underline transition-colors hover:text-[#CDF178]"
							>
								Nexcube Digital
							</a>
						</p>

						{/* Bahasa + ikon sosial hanya di desktop; di mobile sudah ada di bagian atas */}
						<div className="hidden items-center gap-6 md:flex">
							<span className="flex items-center gap-2">
								<Globe width={15.5} height={15.5} className="text-white" />
												Bahasa Indonesia (ID)
							</span>
							<div className="flex items-center gap-5">
								<a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp OBC Group" className="text-white transition-colors hover:text-[#CDF178]">
									<WhatsAppSocialIcon className="h-[16.5px] w-[16.5px]" />
								</a>
								<a href={CONTACT.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok OBC Group" className="text-white transition-colors hover:text-[#CDF178]">
									<TikTokLogo className="h-[14px] w-[14px] bg-white text-black" />
								</a>
								<a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Instagram OBC Group" className="text-white transition-colors hover:text-[#CDF178]">
									<InstagramLogo className="h-[16.5px] w-[16.5px]" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default LandingFooter