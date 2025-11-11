"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

export interface PublicPost {
  id: number
  title: string
  content: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  spa?: {
    id: number
    name: string
  }
}

export function usePublicPosts() {
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get("/posts/public")
        const data = response.data?.data || response.data || []
        setPosts(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err: unknown) {
        // Silently handle network errors (backend may not be running)
        setError(null) // Không set error để UI vẫn hiển thị bình thường
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return { posts, loading, error }
}

