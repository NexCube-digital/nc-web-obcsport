import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBookingDetails, type BookingDetails } from '../../../services/bookingService'
import { getApiErrorMessage } from '../../../services/apiService'
import CreditCardPaymentForm from '../payment/CreditCardPaymentForm'

interface CreditCardPaymentState {
	bookingId?: string
}

function CreditCardPaymentPage() {
	const location = useLocation()
	const navigate = useNavigate()
	const state = (location.state as CreditCardPaymentState | null) ?? {}
	const bookingId = state.bookingId ?? new URLSearchParams(location.search).get('bookingId') ?? ''
	const [booking, setBooking] = useState<BookingDetails | null>(null)
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		if (!bookingId) {
			navigate('/home', { replace: true })
			return
		}

		let active = true
		getBookingDetails(bookingId)
			.then((details) => {
				if (!active) return
				if (details.status === 'fully_paid' || details.status === 'completed') {
					navigate(`/success-order?bookingId=${encodeURIComponent(bookingId)}`, {
						replace: true,
						state: { bookingId },
					})
					return
				}
				if (['cancelled', 'expired', 'refunded'].includes(details.status)) {
					navigate(`/failed-order?bookingId=${encodeURIComponent(bookingId)}`, {
						replace: true,
						state: { bookingId },
					})
					return
				}
				if (details.payments[0]?.method !== 'credit_card') {
					navigate(`/finalisasi-order?bookingId=${encodeURIComponent(bookingId)}`, {
						replace: true,
						state: { bookingId },
					})
					return
				}
				setBooking(details)
			})
			.catch((error: unknown) => {
				if (active) setErrorMessage(getApiErrorMessage(error, 'Detail booking tidak dapat dimuat.'))
			})

		return () => { active = false }
	}, [bookingId, navigate])

	const openInformationOrder = () => {
		navigate(`/finalisasi-order?bookingId=${encodeURIComponent(bookingId)}`, {
			replace: true,
			state: { bookingId },
		})
	}

	return (
		<div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
			<main className="mx-auto w-full max-w-[560px] flex-1 px-4 pt-6 pb-16">
				{errorMessage ? (
					<p role="alert" className="rounded-lg border border-[#F1B4B4] bg-[#FDF2F2] px-4 py-3 text-sm text-[#C00000]">
						{errorMessage}
					</p>
				) : booking ? (
					<CreditCardPaymentForm
						bookingId={booking.id}
						amount={booking.payments[0]?.amount ?? booking.pricing.totalPrice}
						onPaymentStarted={openInformationOrder}
					/>
				) : (
					<p role="status" className="text-center text-sm text-[#6F6B6E]">Memuat detail pembayaran...</p>
				)}
			</main>
		</div>
	)
}

export default CreditCardPaymentPage