import { useState, useEffect } from "react"
import { usersAPI } from "@/lib/api-service"

export function useLoyalty(userId?: number) {
  const [loyalty, setLoyalty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchLoyalty = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await usersAPI.getLoyaltyRank(userId)
        setLoyalty(response.data?.data || response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load loyalty info")
      } finally {
        setLoading(false)
      }
    }

    fetchLoyalty()
  }, [userId])

  return { loyalty, loading, error }
}

