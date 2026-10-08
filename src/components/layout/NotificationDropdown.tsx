import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { INITIAL_NOTIFICATIONS } from '../../data/notificationsData'

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const unreadCount = INITIAL_NOTIFICATIONS.filter((notification) => notification.isUnread).length

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={unreadCount ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-obc-olive transition-colors hover:bg-[#F1F4EA]"
      >
        <Bell size={19} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C41E1E]" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Notifikasi terbaru"
          aria-modal={false}
          className="absolute right-0 top-full z-60 mt-2 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-4 py-3">
            <h2 className="font-heading text-sm font-bold text-obc-charcoal">Notifikasi</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#E8EDE3] px-2 py-1 text-[10px] font-heading font-bold text-obc-olive">
                {unreadCount} baru
              </span>
            )}
          </div>

          <ul className="max-h-[min(60vh,360px)] overflow-y-auto">
            {INITIAL_NOTIFICATIONS.map((notification) => (
              <li
                key={notification.id}
                className={`border-b border-[#F0F0F0] px-4 py-3 last:border-b-0 ${
                  notification.isUnread ? 'bg-[#F7F9F4]' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-xs font-bold text-obc-charcoal">
                    {notification.title}
                  </h3>
                  <span className="shrink-0 text-[10px] text-obc-muted">{notification.time}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-obc-muted">
                  {notification.description}
                </p>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#E5E5E5] px-4 py-3">
            <Link
              to="/notifikasi"
              onClick={() => setIsOpen(false)}
              className="block text-center font-heading text-xs font-bold text-obc-green hover:underline"
            >
              Lihat selengkapnya
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default NotificationDropdown