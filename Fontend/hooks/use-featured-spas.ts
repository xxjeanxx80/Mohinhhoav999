"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

export function useFeaturedSpas() {
  const [spas, setSpas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpas = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get("/spas/public/featured")
        setSpas(response.data?.data || [])
        setError(null)
      } catch (err: any) {
        // Chỉ log error, không hiển thị error nếu là network error (backend không chạy)
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          console.warn("Backend không khả dụng hoặc network error:", err)
        } else {
          console.error("Failed to fetch spas:", err)
        }
        setError(null) // Không set error để UI vẫn hiển thị bình thường
        setSpas([])
      } finally {
        setLoading(false)
      }
    }

    fetchSpas()
  }, [])

  return { spas, loading, error }
}

