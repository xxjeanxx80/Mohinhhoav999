"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ROLE_PATHS } from "@/lib/constants"

export function useRoleRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip if pathname is not ready
    if (!pathname) return

    const token = localStorage.getItem("access_token")
    const role = localStorage.getItem("role") as keyof typeof ROLE_PATHS | null

    if (!token) {
      // Only redirect if not already on homepage or logout page
      if (pathname !== "/" && pathname !== "/logout") {
        router.push("/")
      }
      return
    }

    if (role && ROLE_PATHS[role]) {
      const rolePath = ROLE_PATHS[role]

      // Only redirect if current path doesn't start with role path
      // Allow sub-paths like /owner/spa/register, /owner/bookings, etc.
      if (pathname && !pathname.startsWith(rolePath)) {
        router.push(rolePath)
      }
    }
  }, [router, pathname])
}
