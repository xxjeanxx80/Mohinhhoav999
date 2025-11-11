"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export interface Campaign {
  id: number
  name: string
  description?: string | null
  discountPercent: number
  spa?: {
    id: number
    name: string
  } | null
  startsAt: string
  endsAt?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useAdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getCampaigns()
      const data = response.data?.data || response.data || []
      setCampaigns(data)
      setError(null)
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch campaigns"
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async (data: any) => {
    try {
      const response = await adminAPI.createCampaign(data)
      await fetchCampaigns()
      toast({ title: "Success", description: "Campaign created successfully" })
      return response.data
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create campaign"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw err
    }
  }

  const updateCampaign = async (id: number, data: any) => {
    try {
      await adminAPI.updateCampaign(id, data)
      await fetchCampaigns()
      toast({ title: "Success", description: "Campaign updated successfully" })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update campaign"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw err
    }
  }

  const deleteCampaign = async (id: number) => {
    try {
      await adminAPI.deleteCampaign(id)
      await fetchCampaigns()
      toast({ title: "Success", description: "Campaign deleted successfully" })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to delete campaign"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw err
    }
  }

  const updateCampaignStatus = async (id: number, isActive: boolean) => {
    try {
      await adminAPI.updateCampaignStatus(id, { isActive })
      await fetchCampaigns()
      toast({ title: "Success", description: `Campaign ${isActive ? "activated" : "deactivated"} successfully` })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update campaign status"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw err
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const activeCampaigns = campaigns.filter(c => c.isActive)
  const totalCampaigns = campaigns.length

  return {
    campaigns,
    activeCampaigns,
    totalCampaigns,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignStatus,
    refetch: fetchCampaigns,
  }
}

