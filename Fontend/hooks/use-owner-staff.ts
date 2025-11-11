"use client"

import { useEffect, useState } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function useOwnerStaff() {
  const [staff, setStaff] = useState<any[]>([])
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
    } catch {
      setSpaId(null)
    }
  }

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await ownerAPI.getStaff()
      setStaff(res.data?.data || res.data || [])
      setError(null)
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to fetch staff"
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createStaff = async (data: any) => {
    try {
      const payload: any = {
        name: (data.name || "").trim(),
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        spaId: data.spaId ?? spaId,
        skills: Array.isArray(data.skills) ? data.skills : [],
      }
      if (!payload.spaId) throw new Error("No spa found for this owner.")
      if (!payload.name) throw new Error("Name is required")
      const res = await ownerAPI.createStaff(payload)
      const created = res.data?.data || res.data
      setStaff((prev) => [...prev, created])
      toast({ title: "Success", description: "Staff member created." })
      return created
    } catch (e: any) {
      const message = e.response?.data?.message || e.message || "Failed to create staff"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw e
    }
  }

  const deleteStaff = async (id: number) => {
    try {
      await ownerAPI.deleteStaff(id)
      setStaff((prev) => prev.filter((s) => s.id !== id))
      toast({ title: "Success", description: "Staff member deleted." })
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to delete staff (referenced by other records?)"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw e
    }
  }

  useEffect(() => {
    fetchSpaId().then(fetchStaff)
  }, [])

  return { staff, loading, error, spaId, refetch: fetchStaff, createStaff, deleteStaff }
}


