"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useUserState } from "@/hooks/use-user-state"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/brand/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"

interface MainHeaderProps {
  showAuthButtons?: boolean
  currentPath?: string
}

export function MainHeader({ showAuthButtons = true, currentPath }: MainHeaderProps) {
  const router = useRouter()
  const { user, loading: userLoading, clearUser } = useUserState()
  const { logout } = useAuth()
  const { toast } = useToast()
  const { t, isHydrated } = useLanguage()

  const handleLogout = () => {
    logout()
    clearUser()
    toast({
      title: t.loggedOut,
      description: t.loggedOutSuccess,
    })
    router.push("/")
    router.refresh()
  }

  const handleDashboard = () => {
    if (user?.role === "ADMIN") {
      router.push("/admin")
    } else if (user?.role === "OWNER") {
      router.push("/owner")
    } else {
      router.push("/customer")
    }
  }

  const getActiveLinkClass = (path: string) => {
    return currentPath === path
      ? "text-sm font-medium text-red-600"
      : "text-sm text-slate-600 hover:text-red-600 transition"
  }

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo size="lg" showLink={true} variant="default" className="md:text-3xl" />

          <div className="flex items-center gap-4">
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center gap-6 border-r border-slate-200 pr-4">
              <Link href="/" className={getActiveLinkClass("/")} suppressHydrationWarning>
                {t.home}
              </Link>
              <Link href="/spas" className={getActiveLinkClass("/spas")} suppressHydrationWarning>
                {t.services}
              </Link>
              <Link href="/blog" className={getActiveLinkClass("/blog")} suppressHydrationWarning>
                {t.blog}
              </Link>
              <Link href="/about" className={getActiveLinkClass("/about")} suppressHydrationWarning>
                {t.about}
              </Link>
            </div>

            {!userLoading && (
              <>
                {user ? (
                  <>
                    <NotificationDropdown />
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                      <button 
                        onClick={handleDashboard} 
                        className="flex items-center gap-2 hover:opacity-80"
                      >
                        <UserAvatar userId={user.id} userName={user.name} size="sm" />
                        <span className="hidden sm:inline text-sm text-slate-600">{user.name}</span>
                      </button>
                      <Button variant="ghost" size="sm" onClick={handleLogout} suppressHydrationWarning>
                        {t.logout}
                      </Button>
                    </div>
                  </>
                ) : showAuthButtons ? (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => router.push("/signin")} suppressHydrationWarning>
                      {t.login}
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push("/signup")} suppressHydrationWarning>
                      {t.signup}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
            {/* Only show language switcher for customer/public pages */}
            {(!user || user.role === "CUSTOMER") && <LanguageSwitcher />}
          </div>
        </div>
      </div>
    </header>
  )
}

