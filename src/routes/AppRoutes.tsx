import { Route } from 'react-router-dom'
import LandingPage from '../pages/auth/LandingPage'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

import CheckoutPage from '../pages/orders/CheckoutPage'
import PaymentPage from '../pages/orders/PaymentPage'
import SettingPage from '../pages/account/SettingPage'
import HomePage from '../pages/HomePage'
import HelpPage from '../pages/HelpPage'
import MembershipPage from '../pages/MembershipPage'
import NotificationPage from '../pages/account/NotificationPage'
import HistoryPage from '../pages/HistoryPage'
import EventPage from '../pages/EventPage'


const AppRoutes = (
	<>
		<Route path="/register" element={<Register />} />
		<Route path="/login" element={<Login />} />
		<Route path="/" element={<LandingPage />} />
		<Route path="/pengaturan" element={<SettingPage />} />

		{/* main page */}
		<Route path="/home" element={<HomePage />} />
		<Route path="/notifikasi" element={<NotificationPage />} />
		<Route path="/event" element={<EventPage />} />
		<Route path="/membership" element={<MembershipPage />} />
		<Route path="/history" element={<HistoryPage />} />
		<Route path="/bantuan" element={<HelpPage />} />
		
		<Route path="/checkout" element={<CheckoutPage />} />
		<Route path="/payment" element={<PaymentPage />} />
	</>
)

export default AppRoutes
