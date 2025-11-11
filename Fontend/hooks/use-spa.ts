"use client"

import { useState, useEffect } from "react"
import { spasAPI } from "@/lib/api-service"

export function useSpa(id: number) {
  const [spa, setSpa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpa = async () => {
      try {
        setLoading(true)
        const response = await spasAPI.getOne(id)
        setSpa(response.data?.data || response.data)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch spa:", err)
        setError(err.response?.data?.message || "Failed to load spa details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSpa()
    }
  }, [id])

  return { spa, loading, error }
}
