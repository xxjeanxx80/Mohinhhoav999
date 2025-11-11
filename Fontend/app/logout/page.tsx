"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearAuthData } from "@/lib/auth-utils"

/**
 * Logout page - Force logout from anywhere, including 404 pages
 * This page clears all auth data and redirects to homepage
 */
export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all authentication data
    clearAuthData()

    // Force redirect to homepage
    // Use window.location for hard redirect to ensure cookies are cleared
    window.location.href = "/"
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Đang đăng xuất...</p>
      </div>
    </div>
  )
}

