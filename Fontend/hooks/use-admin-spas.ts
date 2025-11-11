"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function useAdminSpas() {
  const [spas, setSpas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPendingSpas = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getPendingSpas()
      setSpas(response.data)
      setError(null)
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể tải danh sách spa"
      setError(message)
      toast({ title: "Lỗi", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const approveSpa = async (id: number, data: any) => {
    try {
      await adminAPI.approveSpa(id, data)
      setSpas(spas.filter((s: any) => s.id !== id))
      toast({ title: "Thành công", description: "Đã phê duyệt spa thành công" })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to approve spa"
      toast({ title: "Lỗi", description: message, variant: "destructive" })
      throw err
    }
  }

  const rejectSpa = async (id: number, data: any) => {
    try {
      await adminAPI.rejectSpa(id, data)
      setSpas(spas.filter((s: any) => s.id !== id))
      toast({ title: "Thành công", description: "Đã từ chối spa thành công" })
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể từ chối spa"
      toast({ title: "Lỗi", description: message, variant: "destructive" })
      throw err
    }
  }

  useEffect(() => {
    fetchPendingSpas()
  }, [])

  return { spas, loading, error, approveSpa, rejectSpa, refetch: fetchPendingSpas }
}
