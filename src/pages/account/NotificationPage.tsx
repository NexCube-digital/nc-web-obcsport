import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
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
                    ? 'border-[#CDF178] bg-[#F8FEE6]'
                    : 'border-[#D4D4D4] bg-[#FDFCF7] hover:bg-[#F5F4EE]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-sm text-[#343133]">
                        {notif.title}
                      </p>
                      {notif.isUnread && (
                        <span className="h-2 w-2 rounded-full bg-[#404F14] shrink-0" />
                      )}
                    </div>
                    <p className="mt-1 font-body text-xs text-[#343133] leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                  <span className="font-body text-[11px] text-[#404F14] shrink-0 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <DeferredFooter />
    </div>
  )
}

export default NotificationPage
