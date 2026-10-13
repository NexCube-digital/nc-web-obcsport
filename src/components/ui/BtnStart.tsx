import { useNavigate } from 'react-router-dom'

function BtnStart({ isVisible }: { isVisible: boolean }) {
	const navigate = useNavigate()

	return (
		<div
			className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-5 pt-6 pb-4 transition-all duration-300 md:hidden ${
				isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
			}`}
			style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
		>
			<button
				type="button"
				disabled={!isVisible}
				onClick={() => navigate('/register')}
				className="pointer-events-auto h-12 w-full cursor-pointer rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] shadow-[0_4px_14px_rgba(64,79,20,0.25)] transition-colors hover:bg-[#BDE35F]"
			>
				Mulai Sewa Sekarang
			</button>
		</div>
	)
}

export default BtnStart
