"use client"

import { useState, useEffect } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export interface Media {
  id: number
  relatedType: string
  relatedId: number
  url: string
  createdAt: string
}

export function useOwnerMedia() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [spaId, setSpaId] = useState<number | null>(null)
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

  const fetchMedia = async () => {
    if (!spaId) return
    
    setLoading(true)
    try {
      const response = await ownerAPI.getSpaMedia(spaId)
      const data = response.data?.data || response.data || []
      setMedia(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Failed to fetch media:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách media",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadMedia = async (file: File, relatedType: string, relatedId: number) => {
    try {
      await ownerAPI.uploadMedia(file, relatedType, relatedId)
      toast({
        title: "Thành công",
        description: "Đã tải lên hình ảnh",
      })
      await fetchMedia()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể tải lên hình ảnh"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteMedia = async (id: number) => {
    try {
      await ownerAPI.deleteMedia(id)
      toast({
        title: "Thành công",
        description: "Đã xóa hình ảnh",
      })
      await fetchMedia()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể xóa hình ảnh"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchSpaId().then(() => {
      if (spaId) fetchMedia()
    })
  }, [])

  useEffect(() => {
    if (spaId) {
      fetchMedia()
    }
  }, [spaId])

  return {
    media,
    loading,
    spaId,
    uploadMedia,
    deleteMedia,
    refetch: fetchMedia,
  }
}

