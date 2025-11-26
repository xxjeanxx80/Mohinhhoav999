"use client"

import { useState, useEffect } from "react"
import { couponsAPI } from "@/lib/api-service"

interface Voucher {
  id: number
  code: string
  discountPercent: number
  expiresAt: string | null
  spa: { id: number; name: string } | null
  isGlobal: boolean
}

export function useVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const response = await couponsAPI.getPublic()
      console.log("🎫 [useVouchers] API Response:", response.data)
      
      // Handle nested response structure
      const data = response.data?.data || response.data
      console.log("🎫 [useVouchers] Extracted data:", data)
      
      // Ensure data is always an array
      setVouchers(Array.isArray(data) ? data : [])
      console.log("🎫 [useVouchers] Vouchers set:", Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("❌ [useVouchers] Failed to fetch vouchers:", err)
      setVouchers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  return { vouchers, loading, refetch: fetchVouchers }
}
