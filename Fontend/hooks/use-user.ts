"use client"

import { useState, useEffect } from "react"
import { usersAPI } from "@/lib/api-service"

interface User {
  id: string | number
  email: string
  name: string
  role: string
  phone?: string
  address?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.me()
      const userData = response.data?.data?.user || response.data?.user || response.data
      if (userData) {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load from localStorage first
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (err) {
        console.error("Failed to parse user:", err)
      }
    }
    
    // Then fetch from API
    fetchUser()
  }, [])

  return { user, loading, refetch: fetchUser }
}
