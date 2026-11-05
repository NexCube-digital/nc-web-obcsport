import { useState, type FormEvent } from 'react'
import { LoaderCircle, ShieldCheck } from 'lucide-react'
import creditCardImage from '../../../assets/images/payment/creditcard.webp'
import { chargeBookingByCreditCard } from '../../../services/bookingService'
import { getApiErrorMessage } from '../../../services/apiService'
import { authenticateMidtransCard, tokenizeMidtransCard } from '../../../services/paymentService'
import { useTranslation } from 'react-i18next'

interface CreditCardPaymentFormProps {
	bookingId: string
	amount: number
	onPaymentStarted: () => void
}

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

function CreditCardPaymentForm({ bookingId, amount, onPaymentStarted }: CreditCardPaymentFormProps) {
	const { t } = useTranslation()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [authenticationUrl, setAuthenticationUrl] = useState('')
	const retryStorageKey = `obc-card-retry:${bookingId}`
	const [retryCurrentCharge, setRetryCurrentCharge] = useState(() => sessionStorage.getItem(retryStorageKey) === 'true')
	const currentYear = new Date().getFullYear()

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSubmitting(true)
		setErrorMessage('')

		const formData = new FormData(event.currentTarget)
		try {
			const tokenId = await tokenizeMidtransCard({
				card_number: String(formData.get('cardNumber')).replace(/\D/g, ''),
				card_exp_month: String(formData.get('expiryMonth')),
				card_exp_year: String(formData.get('expiryYear')),
				card_cvv: String(formData.get('cvv')),
			})
			const charge = await chargeBookingByCreditCard(bookingId, tokenId, retryCurrentCharge)
			setRetryCurrentCharge(false)
			sessionStorage.removeItem(retryStorageKey)
			if (['deny', 'failure', 'cancel', 'expire'].includes(charge.transactionStatus.toLowerCase())) {
				setRetryCurrentCharge(true)
				sessionStorage.setItem(retryStorageKey, 'true')
				setErrorMessage(t('payment.card.declined'))
				return
			}
			if (charge.redirectUrl) {
				await authenticateMidtransCard(charge.redirectUrl, {
					performAuthentication: (redirectUrl) => setAuthenticationUrl(redirectUrl),
					onSuccess: () => {
						setAuthenticationUrl('')
						onPaymentStarted()
					},
					onPending: () => {
						setAuthenticationUrl('')
						onPaymentStarted()
					},
					onFailure: () => {
						setAuthenticationUrl('')
						setRetryCurrentCharge(true)
						sessionStorage.setItem(retryStorageKey, 'true')
						setErrorMessage(t('payment.card.authenticationFailed'))
					},
				})
				return
			}
			onPaymentStarted()
		} catch (error: unknown) {
			setErrorMessage(getApiErrorMessage(error, error instanceof Error ? error.message : t('payment.card.failed')))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section className="rounded-xl border border-[#D4D4D4] bg-white p-4 md:p-5">
			<div className="flex items-start gap-3">
				<span className="flex h-10 w-14 shrink-0 items-center justify-center">
					<img src={creditCardImage} alt="" aria-hidden="true" className="h-10 w-14 object-contain" />
				</span>
				<div>
					<h2 className="font-heading text-base font-bold text-[#343133]">{t('payment.card.title')}</h2>
					<p className="mt-1 font-heading text-xs text-[#6F6B6E]">{t('payment.card.description')}</p>
				</div>
			</div>

			{authenticationUrl ? (
				<div className="mt-5 overflow-hidden rounded-lg border border-[#D4D4D4]">
					<p className="bg-[#F5FAF0] px-3 py-2 font-heading text-xs font-semibold text-[#404F14]">{t('payment.card.bankAuth')}</p>
					<iframe title={t('payment.card.secureAuth')} src={authenticationUrl} className="h-[520px] w-full bg-white" />
				</div>
			) : (
			<form className="mt-5 space-y-4" onSubmit={(event) => { void handleSubmit(event) }}>
				<label className="block font-heading text-xs font-semibold text-[#343133]">
					{t('payment.card.number')}
					<input
						name="cardNumber"
						type="text"
						inputMode="numeric"
						autoComplete="cc-number"
						placeholder="1234 5678 9012 3456"
						maxLength={23}
						pattern="[0-9 ]{13,23}"
						required
						className="mt-1.5 h-11 w-full rounded-lg border border-[#D4D4D4] bg-white px-3 font-body text-sm text-[#343133] outline-none transition focus:border-[#404F14] focus:ring-2 focus:ring-[#E6F0E0]"
					/>
				</label>

				<div className="grid grid-cols-2 gap-3">
					<label className="block font-heading text-xs font-semibold text-[#343133]">
						{t('payment.card.expiryMonth')}
						<select
							name="expiryMonth"
							autoComplete="cc-exp-month"
							defaultValue=""
							required
							className="mt-1.5 h-11 w-full rounded-lg border border-[#D4D4D4] bg-white px-3 font-body text-sm text-[#343133] outline-none focus:border-[#404F14] focus:ring-2 focus:ring-[#E6F0E0]"
						>
							<option value="" disabled>MM</option>
							{Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((month) => (
								<option key={month} value={month}>{month}</option>
							))}
						</select>
					</label>
					<label className="block font-heading text-xs font-semibold text-[#343133]">
						{t('payment.card.expiryYear')}
						<select
							name="expiryYear"
							autoComplete="cc-exp-year"
							defaultValue=""
							required
							className="mt-1.5 h-11 w-full rounded-lg border border-[#D4D4D4] bg-white px-3 font-body text-sm text-[#343133] outline-none focus:border-[#404F14] focus:ring-2 focus:ring-[#E6F0E0]"
						>
							<option value="" disabled>YYYY</option>
							{Array.from({ length: 15 }, (_, index) => String(currentYear + index)).map((year) => (
								<option key={year} value={year}>{year}</option>
							))}
						</select>
					</label>
				</div>

				<label className="block max-w-[180px] font-heading text-xs font-semibold text-[#343133]">
					{t('payment.card.cvv')}
					<input
						name="cvv"
						type="password"
						inputMode="numeric"
						autoComplete="cc-csc"
						placeholder="123"
						maxLength={4}
						pattern="[0-9]{3,4}"
						required
						className="mt-1.5 h-11 w-full rounded-lg border border-[#D4D4D4] bg-white px-3 font-body text-sm text-[#343133] outline-none transition focus:border-[#404F14] focus:ring-2 focus:ring-[#E6F0E0]"
					/>
				</label>

				{errorMessage && <p role="alert" className="rounded-lg border border-[#F1B4B4] bg-[#FDF2F2] px-3 py-2 font-heading text-xs text-[#C00000]">{errorMessage}</p>}

				<div className="border-t border-[#E5E5E5] pt-4">
					<div className="mb-3 flex items-center justify-between gap-3">
						<span className="font-heading text-sm font-semibold text-[#343133]">{t('payment.totalPayment')}</span>
						<strong className="font-heading text-base text-[#404F14]">{formatRupiah(amount)}</strong>
					</div>
					<button
						type="submit"
						disabled={isSubmitting}
						className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] transition-colors hover:bg-[#B8E35B] disabled:cursor-wait disabled:opacity-60"
					>
						{isSubmitting ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}
						{isSubmitting ? t('payment.card.processing') : t('payment.payNow')}
					</button>
					<p className="mt-2 text-center font-heading text-[10px] text-[#6F6B6E]">{t('payment.card.securityNote')}</p>
				</div>
			</form>
			)}
		</section>
	)
}

export default CreditCardPaymentForm