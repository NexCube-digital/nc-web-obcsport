import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CircleCheck } from 'lucide-react'
import { toast } from 'sonner'
import loginIllustration from '../../assets/figma/login.jpg'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import { forgotPasswordCustomer } from '../../services/authService'

function ForgetPassword() {
	const { t } = useTranslation()
	const [email, setEmail] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!email.trim()) {
			toast.error(t('recovery.missingEmail'))
			return
		}

		setIsLoading(true)
		try {
			await forgotPasswordCustomer(email.trim())
			setIsSubmitted(true)
			toast.success(t('recovery.success'))
		} catch (err: any) {
			const msg = err.response?.data?.error?.message || err.message || t('recovery.failed')
			toast.error(msg)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-[100dvh] bg-[#FDFCF7] font-body text-[#343133] md:grid md:grid-cols-[minmax(0,1fr)_minmax(420px,42%)] md:bg-white">
			<aside className="hidden min-h-[100dvh] flex-col justify-center bg-[#FDFCF7] px-12 lg:px-20 md:flex">
				<Link to="/" className="flex items-center gap-3">
					<img src={logo} alt="OBC Sport Center" className="h-12 w-12 rounded-full object-contain" />
					<span className="font-['Montserrat',sans-serif] text-lg font-extrabold italic text-[#121212]">
						OBC SPORT Center
					</span>
				</Link>

				<div className="mt-12">
					<span className="font-heading text-xs font-bold uppercase tracking-wide text-[#404F14]">
						{t('recovery.eyebrow')}
					</span>
					<h1 className="mt-3 max-w-xl font-heading text-4xl font-bold leading-tight text-[#343133]">
						{t('recovery.title')}
					</h1>
					<p className="mt-4 max-w-lg text-base leading-relaxed text-[#6F6B6E]">
						{t('recovery.description')}
					</p>
					<div className="mt-8 h-[clamp(220px,42vh,400px)] overflow-hidden rounded-2xl bg-[#A9AD86]">
						<img
							src={loginIllustration}
							alt="Fasilitas OBC Sport Center"
							className="h-full w-full object-cover"
						/>
					</div>
				</div>
			</aside>

			<main className="flex min-h-[100dvh] items-center justify-center px-6 py-10 md:px-10 lg:px-16">
				<div className="w-full max-w-[440px]">
					<Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-3 md:hidden">
						<img src={logo} alt="OBC Sport Center" className="h-14 w-14 rounded-full object-contain" />
						<span className="font-['Montserrat',sans-serif] text-lg font-extrabold italic text-[#121212]">
							OBC SPORT Center
						</span>
					</Link>

					<h2 className="font-heading text-2xl font-bold text-[#343133] md:text-3xl">
						{t('recovery.pageTitle')}
					</h2>
					<p className="mt-2 text-sm leading-relaxed text-[#6F6B6E] md:text-base">
						{t('recovery.pageDescription')}
					</p>

					{isSubmitted ? (
						<div role="status" className="mt-8 rounded-xl border border-[#D4D4D4] bg-white p-5">
							<CircleCheck size={28} className="text-[#404F14]" aria-hidden="true" />
							<p className="mt-3 font-heading font-bold text-[#343133]">{t('recovery.sentTitle')}</p>
							<p className="mt-1 break-all text-sm leading-relaxed text-[#6F6B6E]">
								{t('recovery.sentDescription', { email })}
							</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="mt-8">
							<label htmlFor="recovery-email" className="mb-2 block text-sm font-heading font-bold text-[#343133]">
								{t('recovery.email')}
							</label>
							<input
								id="recovery-email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="nama@email.com"
								autoComplete="email"
								required
								disabled={isLoading}
								className="h-12 w-full rounded-lg border border-[#D4D4D4] bg-white px-4 text-sm text-[#343133] placeholder:text-[#8A8688] focus:border-[#404F14] focus:outline-none"
							/>
							<button
								type="submit"
								disabled={isLoading}
								className="mt-5 h-12 w-full cursor-pointer rounded-lg bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#BDE35F] disabled:opacity-50"
							>
								{isLoading ? t('recovery.sending') : t('recovery.submit')}
							</button>
						</form>
					)}

					<Link
						to="/login"
						className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-bold text-[#404F14] hover:underline"
					>
						<ArrowLeft size={16} aria-hidden="true" />
						{t('recovery.backToLogin')}
					</Link>
				</div>
			</main>
		</div>
	)
}

export default ForgetPassword
