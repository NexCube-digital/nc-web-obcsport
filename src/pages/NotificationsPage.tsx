import { useEffect, useState } from 'react'
import { ChevronLeft, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NavbarDashboard from '../components/layout/Navbar'
import DeferredFooter from '../components/layout/DeferredFooter'
import MobileHeader from '../components/layout/MobileHeader'
import { useIsMobile } from '../hooks/useIsMobile'
import { useNotifications } from '../hooks/useNotifications'

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'

function NotificationsPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [currentPage, setCurrentPage] = useState(1)
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    pagination,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(1, 20)

  useEffect(() => {
    console.log('NotificationsPage mounted, currentPage:', currentPage)
    loadNotifications(currentPage, 20)
  }, [currentPage, loadNotifications])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {isMobile && <MobileHeader variant="title" title="Notifikasi" />}
      {!isMobile && <NavbarDashboard />}

      <main className={`${isMobile ? 'pb-20' : ''}`}>
        {!isMobile && (
          <div className="max-w-[1248px] mx-auto px-6 pt-8 pb-16">
            <div className="flex items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Kembali"
                className={`p-1 text-[#004000] hover:bg-[#F1F4EA] rounded transition-colors duration-200 ${EASE}`}
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="font-heading font-bold text-3xl text-[#121212]">Notifikasi</h1>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="mb-4 inline-flex items-center gap-2 rounded-lg bg-[#CDF178] px-4 py-2 text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors"
              >
                <CheckCheck size={16} />
                Tandai semua sebagai dibaca
              </button>
            )}
          </div>
        )}

        {isMobile && (
          <div className="px-4 pt-4">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="mb-3 w-full flex items-center justify-center gap-2 rounded-lg bg-[#CDF178] px-4 py-2 text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors"
              >
                <CheckCheck size={16} />
                Tandai semua dibaca
              </button>
            )}
          </div>
        )}

        <div className={`${isMobile ? 'px-4' : 'max-w-[1248px] mx-auto px-6'}`}>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E5E5] border-t-[#004000]" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-[#FFE5E5] bg-[#FEF3F2] px-4 py-3 text-sm text-[#C41E1E]">
              {error}
            </div>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 h-16 w-16 rounded-full bg-[#F1F4EA] flex items-center justify-center">
                <CheckCheck size={32} className="text-[#9AAD3E]" />
              </div>
              <p className="text-sm font-heading font-semibold text-[#121212]">Tidak ada notifikasi</p>
              <p className="mt-1 text-xs text-[#6F6B6E]">Anda sudah menangani semua notifikasi</p>
            </div>
          )}

          {!isLoading && notifications.length > 0 && (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`cursor-pointer rounded-lg border transition-all duration-200 ${EASE} p-4 ${
                    !notification.read
                      ? 'border-[#9AAD3E] bg-[#F7F9F4] hover:shadow-sm'
                      : 'border-[#E5E5E5] bg-white hover:border-[#D4D4D4]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#004000]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-semibold text-sm text-[#121212]">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#6F6B6E]">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-[#9CA3AF]">
                        {new Date(notification.createdAt).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="mt-1 shrink-0 text-xs font-heading font-semibold text-[#004000] hover:underline"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm font-heading disabled:opacity-50 hover:bg-[#F1F4EA] transition-colors"
              >
                Sebelumnya
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 rounded text-xs font-heading font-semibold transition-colors ${
                      page === currentPage
                        ? 'bg-[#004000] text-white'
                        : 'bg-[#F1F4EA] text-[#121212] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-sm font-heading disabled:opacity-50 hover:bg-[#F1F4EA] transition-colors"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </main>

      <DeferredFooter />
    </div>
  )
}

export default NotificationsPage
