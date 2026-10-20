import { lazy } from 'react'
import { Navigate, Outlet, Route, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LandingPage = lazy(() => import('../pages/auth/LandingPage'))
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const ForgetPassword = lazy(() => import('../pages/auth/ForgetPassword'))
const CheckoutPage = lazy(() => import('../pages/orders/CheckoutPage'))
const PaymentPage = lazy(() => import('../pages/orders/PaymentPage'))
const CreditCardPaymentPage = lazy(() => import('../pages/orders/CreditCardPaymentPage'))
const SettingPage = lazy(() => import('../pages/account/SettingPage'))
const ProfileMobile = lazy(() => import('../pages/account/ProfileMobile'))
const HomePage = lazy(() => import('../pages/main/HomePage'))
const HelpPage = lazy(() => import('../pages/main/HelpPage'))
const MembershipPage = lazy(() => import('../pages/main/MembershipPage'))
const NotificationPage = lazy(() => import('../pages/account/NotificationPage'))
const HistoryPage = lazy(() => import('../pages/main/HistoryPage'))
const EventPage = lazy(() => import('../pages/main/EventPage'))
const FailedOrder = lazy(() => import('../pages/orders/FailedOrder'))
const SuccesOrder = lazy(() => import('../pages/orders/SuccessOrder'))
const InformationOrder = lazy(() => import('../pages/orders/InformationOrder'))
const Profil = lazy(() => import('../pages/main/ProfilPage'))

function RequireAuth() {
	const { isLoggedIn } = useAuth()
	const location = useLocation()

	if (!isLoggedIn) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	return <Outlet />
}

const AppRoutes = (
	<>
		<Route path="/register" element={<Register />} />
		<Route path="/login" element={<Login />} />
		<Route path="/forgot-password" element={<ForgetPassword />} />
		<Route path="/" element={<LandingPage />} />

		<Route element={<RequireAuth />}>
			{/* main page */}
			<Route path="/profil-mobile" element={<ProfileMobile />} />
			<Route path="/pengaturan" element={<SettingPage />} />
			<Route path="/home" element={<HomePage />} />
			<Route path="/notifikasi" element={<NotificationPage />} />
			<Route path="/event" element={<EventPage />} />
			<Route path="/membership" element={<MembershipPage />} />
			<Route path="/history" element={<HistoryPage />} />
			<Route path="/bantuan" element={<HelpPage />} />

			<Route path="/checkout" element={<CheckoutPage />} />
			<Route path="/payment" element={<PaymentPage />} />
			<Route path="/credit-card-payment" element={<CreditCardPaymentPage />} />

			{/* cek notification */}
			<Route path="/failed-order" element={<FailedOrder />} />
			<Route path="/success-order" element={<SuccesOrder />} />
			<Route path="/information-order" element={<InformationOrder />} />
			<Route path="/profil" element={<Profil />} />
		</Route>
	</>
)

export default AppRoutes
