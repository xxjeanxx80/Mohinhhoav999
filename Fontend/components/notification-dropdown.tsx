"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications, BookingNotification } from "@/hooks/use-notifications"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, loading, unreadCount } = useNotifications()
  const router = useRouter()
  const { user } = useUser()
  
  const isOwner = user?.role === "OWNER"

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: BookingNotification) => {
    if (notification.bookingId) {
      const bookingsPath = isOwner ? "/owner/bookings" : "/customer/bookings"
      router.push(bookingsPath)
      setIsOpen(false)
    } else {
      // For non-booking notifications (like report resolutions), just close the dropdown
      // or navigate to notifications page
      setIsOpen(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'warning':
        return '!'
      case 'error':
        return '×'
      default:
        return 'i'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-slate-100 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Thông báo</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                Đang tải...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                Không có thông báo
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 border-transparent hover:border-red-500"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      notification.type === 'success' && "bg-green-500 text-white",
                      notification.type === 'warning' && "bg-amber-500 text-white",
                      notification.type === 'error' && "bg-red-500 text-white",
                      notification.type === 'info' && "bg-blue-500 text-white"
                    )}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 border-t border-slate-200 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Navigate to appropriate notifications page based on user role
                  // For now, both customer and owner can use the same page or we can create owner notifications page later
                  const notificationsPath = isOwner ? "/owner/notifications" : "/customer/notifications"
                  router.push(notificationsPath)
                  setIsOpen(false)
                }}
                className="text-xs"
              >
                Xem tất cả thông báo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

