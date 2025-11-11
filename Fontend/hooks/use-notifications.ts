"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

export interface BookingNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  bookingId?: number
  spaId?: number
  spaName?: string
  serviceName?: string
  status?: string
  scheduledAt?: string
  createdAt: string
  updatedAt?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<BookingNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Fetch both booking notifications and general notifications
      const [bookingsResponse, generalResponse] = await Promise.allSettled([
        axiosClient.get("/notifications/bookings"),
        axiosClient.get("/notifications/me"),
      ])

      // Process booking notifications
      const bookingNotifications: BookingNotification[] = bookingsResponse.status === 'fulfilled'
        ? (bookingsResponse.value.data?.data || bookingsResponse.value.data || [])
        : []

      // Process general notifications (from database)
      const generalNotifications: any[] = generalResponse.status === 'fulfilled'
        ? (generalResponse.value.data?.data || generalResponse.value.data || [])
        : []

      // Convert general notifications to BookingNotification format
      const convertedGeneralNotifications: BookingNotification[] = generalNotifications
        .filter((n: any) => {
          // Only include PUSH notifications with message
          return n.channel === 'PUSH' && n.payload?.message
        })
        .map((n: any) => {
          // Determine type based on message content or default to 'info'
          let type: 'info' | 'success' | 'warning' | 'error' = 'info'
          const message = n.payload?.message || ''
          
          if (message.includes('đã được xử lý') || message.includes('thành công')) {
            type = 'success'
          } else if (message.includes('cảnh báo') || message.includes('vui lòng')) {
            type = 'warning'
          } else if (message.includes('lỗi') || message.includes('thất bại')) {
            type = 'error'
          }

          return {
            id: `notification-${n.id}`,
            type,
            message,
            createdAt: n.createdAt || new Date().toISOString(),
            updatedAt: n.updatedAt || new Date().toISOString(),
            // Include metadata if available
            ...(n.payload?.meta?.reportId && { bookingId: n.payload.meta.reportId }),
          }
        })

      // Merge and sort by createdAt (newest first)
      const allNotifications = [...bookingNotifications, ...convertedGeneralNotifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setNotifications(allNotifications)
      setError(null)
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err)
      setError(err.response?.data?.message || "Không thể tải thông báo")
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => {
    // Consider notifications from last 7 days as potentially unread
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(n.createdAt) > sevenDaysAgo
  }).length

  return { 
    notifications, 
    loading, 
    error, 
    unreadCount,
    refetch: fetchNotifications 
  }
}
