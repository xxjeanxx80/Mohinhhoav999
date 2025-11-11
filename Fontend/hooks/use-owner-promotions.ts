"use client"

import { useEffect, useState } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function useOwnerPromotions() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await ownerAPI.getPromotions()
      setPromotions(res.data?.data || res.data || [])
      setError(null)
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to load promotions"
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createPromotion = async (data: any) => {
    try {
      // Owner max 40%
      if (data.discountPercent > 40) {
        toast({ 
          title: "Error", 
          description: "Owner chỉ có thể tạo mã giảm giá tối đa 40%", 
          variant: "destructive" 
        })
        throw new Error("Discount exceeds 40%")
      }

      // Chuẩn bị payload: loại bỏ empty string cho maxRedemptions
      const payload = {
        code: data.code,
        discountPercent: data.discountPercent,
        expiresAt: data.expiresAt || undefined,
        // Chỉ gửi maxRedemptions nếu có giá trị hợp lệ
        ...(data.maxRedemptions && data.maxRedemptions !== "" 
          ? { maxRedemptions: parseInt(data.maxRedemptions) } 
          : {})
      }
      
      const res = await ownerAPI.createPromotion(payload)
      const created = res.data?.data || res.data
      setPromotions((prev) => [...prev, created])
      toast({ title: "Success", description: "Promotion created" })
      return created
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to create promotion"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw e
    }
  }

  const deletePromotion = async (id: number) => {
    try {
      await ownerAPI.deletePromotion(id)
      setPromotions((prev) => prev.filter((p) => p.id !== id))
      toast({ title: "Success", description: "Promotion deleted" })
    } catch (e: any) {
      const message = e.response?.data?.message || "Failed to delete promotion"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw e
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  return { promotions, loading, error, refetch: fetchPromotions, createPromotion, deletePromotion }
}

