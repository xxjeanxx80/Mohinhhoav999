"use client"

import { useState, useEffect } from "react"
import { adminAPI, ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"

export interface Payout {
  id: number
  owner: {
    id: number
    name: string
    email: string
  }
  amount: number
  status: string
  requestedAt: string
  approvedAt?: string | null
  completedAt?: string | null
  notes?: string | null
}

export function useAdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [myPayouts, setMyPayouts] = useState<Payout[]>([]) // Admin's own payouts
  const [availableProfit, setAvailableProfit] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  const fetchAllPayouts = async () => {
    setLoading(true)
    try {
      // Get all payouts from admin endpoint
      const allPayoutsRes = await adminAPI.getAllPayouts()
      const allPayoutsData = allPayoutsRes.data?.data?.payouts || allPayoutsRes.data?.data || []
      
      // Format payouts with owner info
      const formattedPayouts: Payout[] = (Array.isArray(allPayoutsData) ? allPayoutsData : []).map((p: any) => ({
        id: p.id,
        owner: {
          id: p.owner?.id || p.ownerId,
          name: p.owner?.name || p.owner?.email || `User ${p.owner?.id || p.ownerId}`,
          email: p.owner?.email || "",
        },
        amount: p.amount,
        status: p.status,
        requestedAt: p.requestedAt,
        approvedAt: p.approvedAt,
        completedAt: p.completedAt,
        notes: p.notes,
      }))
      
      setPayouts(formattedPayouts)

      // Fetch admin's own payouts
      if (user?.id) {
        try {
          const myPayoutsRes = await adminAPI.getPayouts(user.id)
          const adminPayouts = myPayoutsRes.data?.data?.payouts || myPayoutsRes.data?.data || []
          setMyPayouts(Array.isArray(adminPayouts) ? adminPayouts : [])
        } catch (error) {
          // Admin may not have payouts yet
          setMyPayouts([])
        }

        // Fetch available profit
        try {
          const profitRes = await adminAPI.getAvailableProfit()
          const profit = profitRes.data?.data?.availableProfit ?? 0
          setAvailableProfit(Number(profit))
        } catch (error) {
          setAvailableProfit(0)
        }
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
      await adminAPI.requestPayout({ ownerId: user.id, amount, notes })
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu thanh toán",
      })
      // Refresh payouts and available profit
      await fetchAllPayouts()
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

  const reviewPayout = async (payoutId: number, approved: boolean, notes?: string) => {
    try {
      await adminAPI.reviewPayout({ payoutId, approved, notes })
      toast({
        title: "Thành công",
        description: `Đã ${approved ? "phê duyệt" : "từ chối"} yêu cầu thanh toán`,
      })
      await fetchAllPayouts()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể cập nhật trạng thái"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const completePayout = async (payoutId: number, notes?: string) => {
    try {
      await adminAPI.completePayout({ payoutId, notes })
      toast({
        title: "Thành công",
        description: "Đã hoàn thành thanh toán",
      })
      await fetchAllPayouts()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể hoàn thành thanh toán"
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
      fetchAllPayouts()
    }
  }, [user?.id])

  return {
    payouts, // All owners' payouts
    myPayouts, // Admin's own payouts
    availableProfit, // Available profit for current user
    loading,
    requestPayout,
    reviewPayout,
    completePayout,
    refetch: fetchAllPayouts,
  }
}

