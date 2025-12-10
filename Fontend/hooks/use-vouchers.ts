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
      const data = response.data?.data || response.data
      setVouchers(Array.isArray(data) ? data : [])
    } catch {
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
