"use client"

import { useEffect, useState } from "react"
import { bookingsAPI, ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function useOwnerBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchBookings = async () => {
    setLoading(true)
    try {
      // Use /bookings/owner endpoint to get all bookings for owner's spa
      const res = await fetch("http://localhost:3000/bookings/owner", {
        headers: {
          Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("access_token") : ""}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setBookings(data.data || [])
      setError(null)
    } catch (e: any) {
      const message = e.response?.data?.message || e.message || "Failed to fetch bookings"
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      setUpdating(id)
      await ownerAPI.updateBookingStatus(id, { status })
      toast({
        title: "Thành công",
        description: `Booking đã được ${status === "CONFIRMED" ? "chấp nhận" : status === "CANCELLED" ? "hủy" : status === "COMPLETED" ? "hoàn thành" : "cập nhật"}`,
      })
      await fetchBookings()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Cập nhật thất bại",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const acceptBooking = async (id: number) => {
    await updateStatus(id, "CONFIRMED")
  }

  const rejectBooking = async (id: number) => {
    await updateStatus(id, "CANCELLED")
  }

  const completeBooking = async (id: number) => {
    await updateStatus(id, "COMPLETED")
  }

  const cancelBooking = async (id: number) => {
    await bookingsAPI.cancel(id, { reason: "Owner cancellation" })
    toast({ title: "Success", description: "Booking cancelled" })
    fetchBookings()
  }

  const rescheduleBooking = async (id: number, scheduledAt: string) => {
    await bookingsAPI.reschedule(id, { scheduledAt })
    toast({ title: "Success", description: "Booking rescheduled" })
    fetchBookings()
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return {
    bookings,
    loading,
    error,
    updating,
    acceptBooking,
    rejectBooking,
    completeBooking,
    cancelBooking,
    rescheduleBooking,
    refetch: fetchBookings,
  }
}


