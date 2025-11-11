"use client"

import { useState, useEffect } from "react"

export function useUserState() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for user
    const userStr = localStorage.getItem("user")
    const accessToken = localStorage.getItem("access_token")

    if (userStr && accessToken) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error("Failed to parse user", e)
      }
    }
    setLoading(false)
  }, [])

  const clearUser = () => {
    setUser(null)
  }

  return { user, loading, clearUser }
}

