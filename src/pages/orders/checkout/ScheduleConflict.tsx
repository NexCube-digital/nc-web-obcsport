import { AlertTriangle } from 'lucide-react'

interface ScheduleConflictProps {
	message: string | null
	onDismiss: () => void
	onReturnHome: () => void
}

function ScheduleConflict({ message, onDismiss, onReturnHome }: ScheduleConflictProps) {
	if (!message) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-[#343133]/30 px-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="schedule-conflict-title"
		>
			<div className="flex min-h-[484px] w-full max-w-[563px] flex-col justify-center rounded-2xl bg-white px-6 shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF2F2] text-[#C41717]">
					<AlertTriangle size={26} />
				</div>
				<h2
					id="schedule-conflict-title"
					className="mt-5 text-center font-heading text-base font-bold text-[#121212]"
				>
					Jadwal Tidak Tersedia
				</h2>
				<p className="mt-1 text-center text-sm text-[#6F6B6E]">{message}</p>

				<button
					type="button"
					onClick={onDismiss}
					className="mt-4 h-12 w-full cursor-pointer rounded-xl bg-[#C41717] text-sm font-heading font-semibold text-white transition-colors hover:bg-[#A31212]"
				>
					Ganti Tanggal / Jam
				</button>
				<button
					type="button"
					onClick={onReturnHome}
					className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-[#E5E5E5] bg-white text-xs font-heading font-semibold text-[#6F6B6E] transition-colors hover:bg-[#FDFCF7]"
				>
					Kembali ke Beranda
				</button>
			</div>
		</div>
	)
}

export default ScheduleConflict
