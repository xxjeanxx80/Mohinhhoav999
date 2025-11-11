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
        console.log("Loyalty response:", response.data)
        // Response format: { success: true, data: { rank: 'BRONZE', points: 70 } }
        const loyaltyData = response.data?.data || response.data
        setLoyalty(loyaltyData)
      } catch (err: any) {
        console.error("Failed to fetch loyalty:", err)
        setError(err.response?.data?.message || "Không thể tải thông tin loyalty")
      } finally {
        setLoading(false)
      }
    }

    fetchLoyalty()
  }, [userId])

  return { loyalty, loading, error }
}

