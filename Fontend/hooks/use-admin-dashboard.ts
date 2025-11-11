"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "./use-toast"

interface MonthlyRevenue {
  month: string
  revenue: number
  bookings: number
}

interface AdminMetrics {
  totalUsers: number
  totalBookings: number
  totalSpas: number
  totalRevenue: number
  totalProfit?: number
  commissionRate?: number
  newCustomers: number
  monthlyRevenue: MonthlyRevenue[]
}

export function useAdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      
      // Fetch metrics and commission rate in parallel
      const [metricsRes, commissionRes] = await Promise.all([
        adminAPI.getMetrics(),
        adminAPI.getSetting("commission_rate").catch(() => ({ data: { data: { value: "10" } } })) // Default 10% if error
      ])
      
      const data = metricsRes.data?.data || metricsRes.data
      const commissionRate = parseFloat(commissionRes.data?.data?.value || "10")
      
      // Calculate total profit from last 6 months revenue (same as owner dashboard)
      // Total profit = commission rate % * (sum of monthly revenue from last 6 months)
      const last6MonthsRevenue = data.monthlyRevenue 
        ? data.monthlyRevenue.reduce((sum: number, month: MonthlyRevenue) => sum + (month.revenue || 0), 0)
        : 0
      
      const totalProfit = last6MonthsRevenue ? (commissionRate / 100) * last6MonthsRevenue : 0
      
      setMetrics({
        ...data,
        totalProfit,
        commissionRate,
      })
    } catch (error: any) {
      console.error("Error fetching admin metrics:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch metrics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loading,
    refetch: fetchMetrics,
  }
}

