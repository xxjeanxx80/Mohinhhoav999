"use client"

import { useEffect, useState } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function useOwnerSpa() {
  const [spa, setSpa] = useState<any | null>(null)
  const [currentSpaId, setCurrentSpaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSpa = async (specificSpaId?: number) => {
    setLoading(true)
    try {
      const res = await ownerAPI.getMySpas()
      const list = res.data?.data || res.data || []
      
      if (Array.isArray(list) && list.length > 0) {
        // If we have a specific spa ID, find it; otherwise use the first one
        const targetSpa = specificSpaId 
          ? list.find((s: any) => s.id === specificSpaId) || list[0]
          : list[0]
        
        setSpa(targetSpa)
        setCurrentSpaId(targetSpa.id)
      } else {
        setSpa(null)
        setCurrentSpaId(null)
      }
      
      setError(null)
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to load spa info"
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const updateSpa = async (data: any) => {
    if (!spa?.id) throw new Error("No spa to update")
    const spaIdToUpdate = spa.id
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const res = await fetch(`http://localhost:3000/spas/${spaIdToUpdate}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to update spa")
      }
      // Re-fetch and keep the same spa selected
      await fetchSpa(spaIdToUpdate)
      // Toast will be shown in component, not here
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message || "Không thể cập nhật thông tin spa", variant: "destructive" })
      throw e
    }
  }

  useEffect(() => {
    fetchSpa()
  }, [])

  return { spa, loading, error, refetch: fetchSpa, updateSpa }
}


