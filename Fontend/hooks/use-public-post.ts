"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"
import { PublicPost } from "./use-public-posts"

export function usePublicPost(id: number | string) {
  const [post, setPost] = useState<PublicPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get(`/posts/public/${id}`)
        const data = response.data?.data || response.data
        setPost(data)
        setError(null)
      } catch (err: any) {
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          console.warn("Backend không khả dụng hoặc network error:", err)
        } else {
          console.error("Failed to fetch post:", err)
        }
        setError(err.response?.data?.message || "Không thể tải bài viết")
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  return { post, loading, error }
}

