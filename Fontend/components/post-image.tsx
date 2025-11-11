"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

interface PostImageProps {
  postId: number
  spaId?: number
  className?: string
}

export function PostImage({ postId, spaId, className = "" }: PostImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPostImage = async () => {
      try {
        setLoading(true)
        // Try to get media for this post (returns array of media)
        const response = await axiosClient.get(`/media/post/${postId}`).catch(() => null)
        const mediaArray = response?.data?.data || []
        if (Array.isArray(mediaArray) && mediaArray.length > 0 && mediaArray[0]?.url) {
          const url = mediaArray[0].url
          // Check if URL is absolute or relative
          if (url.startsWith('http')) {
            setImageUrl(url)
          } else {
            setImageUrl(`http://localhost:3000${url}`)
          }
        } else {
          // Fallback to spa background if post has no image
          if (spaId) {
            const spaBgResponse = await axiosClient.get(`/media/spa/${spaId}/background`).catch(() => null)
            if (spaBgResponse?.data?.data?.url) {
              const url = spaBgResponse.data.data.url
              if (url.startsWith('http')) {
                setImageUrl(url)
              } else {
                setImageUrl(`http://localhost:3000${url}`)
              }
            }
          }
        }
      } catch (error) {
        // No image found
        setImageUrl(null)
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPostImage()
    } else {
      setLoading(false)
    }
  }, [postId, spaId])

  if (loading) {
    return (
      <div className={`h-48 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse ${className}`} />
    )
  }

  if (imageUrl) {
    return (
      <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Post" 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
      </div>
    )
  }

  return (
    <div className={`h-48 bg-gradient-to-br from-slate-200 to-slate-300 ${className}`} />
  )
}

