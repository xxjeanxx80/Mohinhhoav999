"use client"

import { useState, useEffect } from "react"
import { bookingsAPI } from "@/lib/api-service"

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

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingsAPI.getAll()
      setBookings(response.data?.data || response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Failed to load bookings"
      setError(errorMessage || "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return { bookings, loading, error, refetch: fetchBookings }
}
