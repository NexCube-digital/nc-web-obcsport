import { useNavigate } from 'react-router-dom'
import lapangF1 from '../../../assets/layanan/Lapang F1.png'
import futsalF2 from '../../../assets/layanan/Futsal F2.png'
import lapangF2 from '../../../assets/layanan/Lapang F2.png'
import mejaBilliard from '../../../assets/layanan/Meja Billiard.png'

const COLLAGE_IMG =
	'w-full rounded-lg sm:rounded-xl object-cover shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)]'

function Booking() {
	const navigate = useNavigate()

	return (
		<section className="border-y border-[#D4D4D4] bg-white lg:flex lg:min-h-[calc(100svh-6.25rem)] lg:items-center">
			<div className="mx-auto grid max-w-[1248px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
				<div className="flex h-full flex-col lg:min-h-[480px]">
					<span className="inline-block self-start rounded-full bg-[#E8EDE3] px-4 py-2 font-heading text-xs font-medium text-[#404F14]">
						OBC Sport
					</span>
					<h2 className="mt-3 max-w-[480px] font-heading text-xl font-semibold leading-snug text-[#343133] sm:text-2xl">
						Booking Lapangan Instan untuk Harian, Rutin, hingga Event Skala Besar
					</h2>
					<p className="mt-3 max-w-[460px] text-sm leading-relaxed text-[#343133]">
						Nikmati kemudahan sewa lapangan olahraga premium di OBC Sport Center secara
						cepat dan praktis. Mulai dari pemesanan harian, membership rutin, hingga
						sewa eksklusif untuk turnamen dan gathering komunitas—semuanya diatur
						secara transparan tanpa ribet.
					</p>
					<button
						type="button"
						onClick={() => navigate('/schedule')}
						className="mt-5 cursor-pointer self-start py-2 font-heading text-sm text-[#004000] underline underline-offset-2 lg:mt-auto lg:pt-16"
					>
						Mulai Booking Sekarang -&gt;
					</button>
				</div>

				<div className="mx-auto flex w-full max-w-[520px] gap-3 sm:gap-4 lg:mr-0 lg:justify-end">
					<div className="flex min-w-0 flex-[259] flex-col gap-3 pt-8 sm:gap-5 sm:pt-14">
						<img
							src={lapangF1}
							alt="Lapangan F1"
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[259/194]`}
						/>
						<img
							src={lapangF2}
							alt="Lapangan F2"
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[259/133]`}
						/>
					</div>
					<div className="flex min-w-0 flex-[193] flex-col gap-3 sm:gap-5">
						<img
							src={futsalF2}
							alt="Ruang tenis meja"
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[193/112]`}
						/>
						<img
							src={mejaBilliard}
							alt="Ruang billiard"
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[193/194]`}
						/>
						<img
							src={futsalF2}
							alt="Lapang sepak bola"
							loading="lazy"
							decoding="async"
							className={`${COLLAGE_IMG} aspect-[193/111]`}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Booking
