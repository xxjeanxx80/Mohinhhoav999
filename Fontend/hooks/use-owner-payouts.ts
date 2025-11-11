"use client"

import { useState, useEffect } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "./use-user"

export interface Payout {
  id: number
  amount: number
  status: string
  requestedAt: string
  approvedAt?: string | null
  completedAt?: string | null
  notes?: string | null
}

export function useOwnerPayouts() {
  const { user } = useUser()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [availableProfit, setAvailableProfit] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchPayouts = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const response = await ownerAPI.getPayouts(user.id)
      const data = response.data?.data?.payouts || response.data?.data || []
      setPayouts(Array.isArray(data) ? data : [])

      // Fetch available profit
      try {
        const profitRes = await ownerAPI.getAvailableProfit()
        const profit = profitRes.data?.data?.availableProfit ?? 0
        setAvailableProfit(Number(profit))
      } catch (error) {
        setAvailableProfit(0)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thanh toán",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const requestPayout = async (amount: number, notes?: string) => {
    if (!user?.id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin người dùng",
        variant: "destructive",
      })
      return
    }

    try {
      await ownerAPI.requestPayout({ ownerId: user.id, amount, notes })
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu thanh toán",
      })
      // Refresh payouts and available profit
      await fetchPayouts()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể gửi yêu cầu thanh toán"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchPayouts()
    }
  }, [user?.id])

  return {
    payouts,
    availableProfit,
    loading,
    requestPayout,
    refetch: fetchPayouts,
  }
}

