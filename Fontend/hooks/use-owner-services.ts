"use client"

import { useState, useEffect } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface Service {
  id: number
  name: string
  description?: string
  price: number
  durationMinutes?: number
  duration?: number
  serviceType: string
  spaId: number
  isActive: boolean
  [key: string]: any
}

export function useOwnerServices() {
  const [services, setServices] = useState<Service[]>([])
  const [spaId, setSpaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSpaId = async () => {
    try {
      const res = await ownerAPI.getMySpas()
      const spas = res.data?.data || res.data || []
      const first = Array.isArray(spas) ? spas[0] : null
      setSpaId(first?.id ?? null)
    } catch (e) {
      // ignore; spaId stays null
    }
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await ownerAPI.getServices()
      setServices(response.data?.data || response.data || [])
      setError(null)
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch services"
      setError(message)
      toast({ title: "Lỗi", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createService = async (data: any) => {
    try {
      const payload = {
        ...data,
        durationMinutes: data.durationMinutes ?? data.duration ?? 60,
        spaId: data.spaId ?? spaId,
      }
      if (!payload.spaId) {
        throw new Error("No spa found for this owner. Please create/approve a spa first.")
      }
      // ✅ FIX: Send payload (with injected spaId), not original data!
      const response = await ownerAPI.createService(payload)
      const created = (response.data?.data || response.data) as Service
      setServices([...services, created])
      toast({ title: "Thành công", description: "Đã tạo dịch vụ thành công" })
      return created
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể tạo dịch vụ"
      toast({ title: "Lỗi", description: message, variant: "destructive" })
      throw err
    }
  }

  const updateService = async (id: number, data: any) => {
    try {
      const response = await ownerAPI.updateService(id, data)
      const updated = (response.data?.data || response.data) as Service
      setServices(services.map((s) => (s.id === id ? updated : s)))
      toast({ title: "Thành công", description: "Đã cập nhật dịch vụ thành công" })
      return updated
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể cập nhật dịch vụ"
      toast({ title: "Lỗi", description: message, variant: "destructive" })
      throw err
    }
  }

  const deleteService = async (id: number) => {
    try {
      await ownerAPI.deleteService(id)
      setServices(services.filter((s: any) => s.id !== id))
      toast({ title: "Thành công", description: "Đã xóa dịch vụ thành công" })
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể xóa dịch vụ"
      toast({ title: "Lỗi", description: message, variant: "destructive" })
      throw err
    }
  }

  useEffect(() => {
    fetchSpaId().then(fetchServices)
  }, [])

  return { services, loading, error, createService, updateService, deleteService, refetch: fetchServices, spaId }
}
