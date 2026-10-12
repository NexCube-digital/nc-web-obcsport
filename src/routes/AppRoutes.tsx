import { lazy } from 'react'
import { Route } from 'react-router-dom'

const LandingPage = lazy(() => import('../pages/auth/LandingPage'))
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const CheckoutPage = lazy(() => import('../pages/orders/CheckoutPage'))
const PaymentPage = lazy(() => import('../pages/orders/PaymentPage'))
const SettingPage = lazy(() => import('../pages/account/SettingPage'))
const ProfileMobile = lazy(() => import('../pages/account/ProfileMobile'))
const HomePage = lazy(() => import('../pages/HomePage'))
const HelpPage = lazy(() => import('../pages/HelpPage'))
const MembershipPage = lazy(() => import('../pages/MembershipPage'))
const NotificationPage = lazy(() => import('../pages/account/NotificationPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const EventPage = lazy(() => import('../pages/EventPage'))
const FailedOrder = lazy(() => import('../pages/orders/FailedOrder'))
const SuccesOrder = lazy(() => import('../pages/orders/SuccessOrder'))
const InformationOrder = lazy(() => import('../pages/orders/InformationOrder'))
const Profil = lazy(() => import('../pages/SettingPage'))


const AppRoutes = (
	<>
		<Route path="/register" element={<Register />} />
		<Route path="/login" element={<Login />} />
		<Route path="/" element={<LandingPage />} />
		<Route path="/pengaturan" element={<SettingPage />} />
		<Route path="/profil-mobile" element={<ProfileMobile />} />

		{/* main page */}
		<Route path="/home" element={<HomePage />} />
		<Route path="/notifikasi" element={<NotificationPage />} />
		<Route path="/event" element={<EventPage />} />
		<Route path="/membership" element={<MembershipPage />} />
		<Route path="/history" element={<HistoryPage />} />
		<Route path="/bantuan" element={<HelpPage />} />
		
		<Route path="/checkout" element={<CheckoutPage />} />
		<Route path="/payment" element={<PaymentPage />} />

		{/* cek notification */}
		<Route path="/failed-order" element={<FailedOrder />} />
		<Route path="/success-order" element={<SuccesOrder />} />
		<Route path="/information-order" element={<InformationOrder />} />
		<Route path="/profil" element={<Profil />} />
	</>
)

export default AppRoutes
