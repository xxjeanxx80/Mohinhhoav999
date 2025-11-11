"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

export function useSpaMedia(spaId: number) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedia = async () => {
      if (!spaId) {
        setLoading(false)
        return
      }
      
      try {
        // Use public API endpoints (no auth required)
        const [avatarRes, backgroundRes] = await Promise.all([
          axiosClient.get(`/media/spa/${spaId}/avatar`).catch(() => ({ data: { data: null } })),
          axiosClient.get(`/media/spa/${spaId}/background`).catch(() => ({ data: { data: null } })),
        ])
        
        const avatar = avatarRes.data?.data
        const background = backgroundRes.data?.data
        
        setAvatarUrl(avatar?.url ? `http://localhost:3000${avatar.url}` : null)
        setBackgroundUrl(background?.url ? `http://localhost:3000${background.url}` : null)
      } catch (error) {
        setAvatarUrl(null)
        setBackgroundUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()

    // Listen for spa media update events
    const handleMediaUpdate = (e: CustomEvent) => {
      if (e.detail?.spaId === spaId) {
        fetchMedia()
      }
    }

    window.addEventListener('spa-media-updated', handleMediaUpdate as EventListener)
    return () => {
      window.removeEventListener('spa-media-updated', handleMediaUpdate as EventListener)
    }
  }, [spaId])

  const refresh = async () => {
    setLoading(true)
    try {
      const [avatarRes, backgroundRes] = await Promise.all([
        axiosClient.get(`/media/spa/${spaId}/avatar`).catch(() => ({ data: { data: null } })),
        axiosClient.get(`/media/spa/${spaId}/background`).catch(() => ({ data: { data: null } })),
      ])
      
      const avatar = avatarRes.data?.data
      const background = backgroundRes.data?.data
      
      setAvatarUrl(avatar?.url ? `http://localhost:3000${avatar.url}?t=${Date.now()}` : null)
      setBackgroundUrl(background?.url ? `http://localhost:3000${background.url}?t=${Date.now()}` : null)
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  return { avatarUrl, backgroundUrl, loading, refresh }
}

