import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { INITIAL_NOTIFICATIONS, type PromoNotification } from '../../data/notificationsData'
import { sportApi } from '../../services/api'

function NotificationPage() {
  const [notifications, setNotifications] = useState<PromoNotification[]>(INITIAL_NOTIFICATIONS)
  const [userName, setUserName] = useState('Pengguna')

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        const [profileRes, notifRes] = await Promise.allSettled([
          sportApi.getProfile(),
          sportApi.getNotifications(),
        ])

        if (isMounted && profileRes.status === 'fulfilled') {
          const profile = profileRes.value.data?.data || profileRes.value.data
          if (profile?.name) setUserName(profile.name)
        }

        if (isMounted && notifRes.status === 'fulfilled') {
          const apiNotifs = notifRes.value.data?.data || notifRes.value.data
          if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
            const mapped: PromoNotification[] = apiNotifs.map((n: any) => ({
              id: n.id,
              title: n.title,
              description: n.message,
              time: new Date(n.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),
              isUnread: !n.isRead,
            }))
            setNotifications(mapped)
          }
        }
      } catch (err: any) {
        console.error('Failed to load notifications:', err)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleMarkAllAsRead = async () => {
    try {
      await sportApi.markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isUnread: false })))
      toast.success('Semua notifikasi telah ditandai sebagai dibaca.')
    } catch {
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isUnread: false })))
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await sportApi.markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isUnread: false } : notif)),
      )
    } catch {
      // Local fallback
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isUnread: false } : notif)),
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] font-body text-[#343133]">
      <NavbarDashboard userName={userName} />

      {/* Lebar konten 1240px sesuai desain */}
      <main className="max-w-[1288px] mx-auto px-6 pt-6 pb-10">
        <h1 className="font-heading font-bold text-2xl text-[#343133]">Notifikasi Anda</h1>

        {/* ================= Promosi & Diskon ================= */}
        <section className="mt-6 min-h-[570px] rounded-2xl border border-[#D4D4D4] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#D4D4D4] pb-4">
            <h2 className="font-heading font-bold text-lg text-[#404F14]">
              Promosi &amp; Diskon
            </h2>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-heading font-bold text-[#343133] underline underline-offset-2 cursor-pointer"
            >
              Tandai semua dibaca
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => notif.isUnread && handleMarkAsRead(notif.id)}
                className={`rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  notif.isUnread
                    ? 'bg-[#E8EBE4] border-[#E8EBE4] hover:bg-[#dfe4d8]'
                    : 'bg-white border-[#E5E5E5] hover:bg-[#F9FAF8]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`font-heading font-bold text-sm ${
                      notif.isUnread ? 'text-[#404F14]' : 'text-[#121212]'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <span className="shrink-0 text-xs text-[#343133]">{notif.time}</span>
                </div>
                <p className="mt-2 text-sm text-[#343133]">{notif.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default NotificationPage
