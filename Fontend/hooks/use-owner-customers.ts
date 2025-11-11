"use client"

import { useEffect, useState } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function useOwnerCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await ownerAPI.getCustomers()
      
      // Handle nested data structure
      const data = response.data?.data?.customers || response.data?.data || response.data?.customers || response.data || []
      
      setCustomers(Array.isArray(data) ? data : [])
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to load customers"
      toast({ title: "Error", description: message, variant: "destructive" })
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const updateLoyalty = async (id: number, loyaltyRank: string) => {
    try {
      await ownerAPI.updateCustomerLoyalty(id, loyaltyRank)
      toast({ title: "Success", description: "Loyalty rank updated successfully" })
      // Update local state
      setCustomers(customers.map(c => c.id === id ? { ...c, loyaltyRank } : c))
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to update loyalty"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw e
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return { customers, loading, refetch: fetchCustomers, updateLoyalty }
}
