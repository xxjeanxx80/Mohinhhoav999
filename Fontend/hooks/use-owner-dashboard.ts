"use client"

import { useEffect, useState } from "react"
import { useOwnerBookings } from "./use-owner-bookings"
import { useOwnerServices } from "./use-owner-services"
import { useOwnerStaff } from "./use-owner-staff"
import { adminAPI } from "@/lib/api-service"

export function useOwnerDashboard() {
  const { bookings } = useOwnerBookings()
  const { services } = useOwnerServices()
  const { staff } = useOwnerStaff()
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalRevenue: 0,
    totalProfit: 0,
    commissionRate: 10,
    staffCount: 0,
    servicesCount: 0,
    upcomingToday: [] as any[],
    monthlyRevenue: [] as any[],
  })

  useEffect(() => {
    const fetchCommissionRate = async () => {
      try {
        const res = await adminAPI.getSetting("commission_rate").catch(() => ({ data: { data: { value: "10" } } }))
        return parseFloat(res.data?.data?.value || "10")
      } catch {
        return 10 // Default 10%
      }
    }

    const calculateStats = async () => {
      const commissionRate = await fetchCommissionRate()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayBookings = bookings.filter((b: any) => {
        const scheduledAt = new Date(b.scheduledAt)
        return scheduledAt >= today && scheduledAt < tomorrow
      })

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const thisMonthBookings = bookings.filter((b: any) => {
        const scheduledAt = new Date(b.scheduledAt)
        // CHỈ TÍNH BOOKING ĐÃ COMPLETED
        return scheduledAt >= thisMonthStart && b.status === "COMPLETED"
      })

      const totalRevenue = thisMonthBookings.reduce((sum: number, b: any) => {
        return sum + (parseFloat(b.finalPrice ?? b.totalPrice ?? 0))
      }, 0)

      // Calculate total profit = total revenue × (1 - commission_rate/100)
      const totalProfit = totalRevenue * (1 - commissionRate / 100)

      // Get all bookings (not just today), sorted by most recent first
      const allBookings = bookings
        .filter((b: any) => b.status !== "CANCELLED")
        .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 10) // Show top 10 most recent bookings

      // Calculate monthly revenue (group by month/year) - CHỈ TÍNH COMPLETED
      const monthlyRevenueMap = new Map<string, { month: string, revenue: number, bookings: number }>()
      bookings.forEach((b: any) => {
        // CHỈ TÍNH BOOKING ĐÃ COMPLETED
        if (b.status !== "COMPLETED") return
        const date = new Date(b.scheduledAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        
        if (!monthlyRevenueMap.has(monthKey)) {
          monthlyRevenueMap.set(monthKey, { month: monthLabel, revenue: 0, bookings: 0 })
        }
        const entry = monthlyRevenueMap.get(monthKey)!
        entry.revenue += parseFloat(b.finalPrice ?? b.totalPrice ?? 0)
        entry.bookings += 1
      })

      // Sort by month (most recent first) and convert to array
      const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([_, data]) => data)
        .slice(0, 6) // Show last 6 months

      setStats({
        todayBookings: todayBookings.length,
        totalRevenue,
        totalProfit,
        commissionRate,
        staffCount: staff.length,
        servicesCount: services.length,
        upcomingToday: allBookings,
        monthlyRevenue,
      })
    }

    calculateStats()
  }, [bookings, services, staff])

  return stats
}

