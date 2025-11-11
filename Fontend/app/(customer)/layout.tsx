"use client"

import type React from "react"
import { useRoleRedirect } from "@/hooks/use-role-redirect"
import { MainHeader } from "@/components/main-header"
import { Heart, Calendar, Ticket, User } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useRoleRedirect()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { t } = useLanguage()

  const menuItems = [
    { label: t.accountInfo, icon: User, href: "/customer/account" },
    { label: t.yourBookings, icon: Calendar, href: "/customer/bookings" },
    { label: t.vouchers, icon: Ticket, href: "/customer/vouchers" },
    { label: t.favorites, icon: Heart, href: "/customer/favorites" },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <MainHeader showAuthButtons={false} />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} border-r border-slate-200 bg-white transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
