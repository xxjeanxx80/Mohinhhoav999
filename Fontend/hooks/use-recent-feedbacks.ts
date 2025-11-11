"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

export function useRecentFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get("/feedbacks/public/recent")
        setFeedbacks(response.data?.data || [])
        setError(null)
      } catch (err: any) {
        // Chỉ log error, không hiển thị error nếu là network error (backend không chạy)
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          console.warn("Backend không khả dụng hoặc network error:", err)
        } else {
          console.error("Failed to fetch feedbacks:", err)
        }
        setError(null) // Không set error để UI vẫn hiển thị bình thường
        setFeedbacks([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  return { feedbacks, loading, error }
}

