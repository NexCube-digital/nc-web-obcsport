import { useState } from 'react'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
import { INITIAL_NOTIFICATIONS, type PromoNotification } from '../../data/notificationsData'

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
   Data (ganti dengan data dari API / services/notificationService.js)
   ------------------------------------------------------------------------- */
function NotificationPage() {
  const [notifications, setNotifications] = useState<PromoNotification[]>(INITIAL_NOTIFICATIONS)

  const handleMarkAllAsRead = () => {
    // TODO: sambungkan juga ke services/notificationService.js (mark-all-read)
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isUnread: false })))
  }

  return (
    <div className="min-h-screen bg-[#FDFCF7] font-body text-[#343133]">
      <NavbarDashboard />

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
                className={`rounded-lg border px-4 py-3 ${
                  notif.isUnread
                    ? 'bg-[#E8EBE4] border-[#E8EBE4]'
                    : 'bg-white border-[#E5E5E5]'
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

      <DeferredFooter />
    </div>
  )
}

export default NotificationPage