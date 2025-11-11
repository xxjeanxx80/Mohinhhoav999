"use client"

import type React from "react"
import { useRoleRedirect } from "@/hooks/use-role-redirect"
import { useUser } from "@/hooks/use-user"
import { OwnerSidebar } from "@/components/owner-sidebar"
import { NotificationDropdown } from "@/components/notification-dropdown"

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useRoleRedirect()
  const { user } = useUser()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <OwnerSidebar />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">Spa Owner Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <NotificationDropdown />
              <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline truncate max-w-[120px] lg:max-w-none">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
