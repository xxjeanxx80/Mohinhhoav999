"use client"

import { useState, useEffect } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export interface Post {
  id: number
  title: string
  content: string
  isPublished: boolean
  spa?: {
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}

export function useOwnerPosts() {
  const [posts, setPosts] = useState<Post[]>([])
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

  const fetchPosts = async () => {
    if (!spaId) return
    
    setLoading(true)
    try {
      const response = await ownerAPI.getSpaPosts(spaId)
      const data = response.data?.data || response.data || []
      setPosts(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Failed to fetch posts:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (data: { title: string; content: string; isPublished?: boolean }) => {
    if (!spaId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy spa",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await ownerAPI.createPost({ ...data, spaId })
      toast({
        title: "Thành công",
        description: "Đã tạo bài viết",
      })
      await fetchPosts()
      return response.data?.data || response.data
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể tạo bài viết"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updatePost = async (id: number, data: { title?: string; content?: string; isPublished?: boolean }) => {
    try {
      await ownerAPI.updatePost(id, data)
      toast({
        title: "Thành công",
        description: "Đã cập nhật bài viết",
      })
      await fetchPosts()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể cập nhật bài viết"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deletePost = async (id: number) => {
    try {
      await ownerAPI.deletePost(id)
      toast({
        title: "Thành công",
        description: "Đã xóa bài viết",
      })
      await fetchPosts()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể xóa bài viết"
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
      if (spaId) fetchPosts()
    })
  }, [])

  useEffect(() => {
    if (spaId) {
      fetchPosts()
    }
  }, [spaId])

  return {
    posts,
    loading,
    spaId,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  }
}

