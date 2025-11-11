"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "./use-toast"

interface Booking {
  id: number
  spa: {
    id: number
    name: string
  }
  service: {
    id: number
    name: string
    price: number
  }
  customer: {
    id: number
    name: string
    email: string
  }
  staff?: {
    id: number
    name: string
  } | null
  scheduledAt: string
  status: string
  totalPrice: number
  finalPrice: number
  couponCode?: string | null
  createdAt: string
}

export function useAdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getAllBookings()
      const data = res.data?.data || res.data || []
      setBookings(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return {
    bookings,
    loading,
    refetch: fetchBookings,
  }
}

