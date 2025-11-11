"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

interface SpaAvatarProps {
  spaId: number
  spaName?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
  fillContainer?: boolean // If true, fill entire container (for homepage cards)
  rounded?: "none" | "lg" | "full" // Border radius style
}

export function SpaAvatar({ spaId, spaName, className = "", size = "md", fillContainer = false, rounded = "lg" }: SpaAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const roundedClass = rounded === "none" ? "rounded-none" : rounded === "full" ? "rounded-full" : "rounded-lg"

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!spaId) {
        setLoading(false)
        return
      }
      
      try {
        // Use public API endpoint (no auth required)
        const response = await axiosClient.get(`/media/spa/${spaId}/avatar`)
        const media = response.data?.data
        if (media?.url) {
          setAvatarUrl(`http://localhost:3000${media.url}?t=${Date.now()}`)
        } else {
          setAvatarUrl(null)
        }
      } catch (error) {
        // Avatar not found, use default
        setAvatarUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAvatar()

    // Listen for spa media update events
    const handleMediaUpdate = (e: CustomEvent) => {
      if (e.detail?.spaId === spaId) {
        fetchAvatar()
      }
    }

    window.addEventListener('spa-media-updated', handleMediaUpdate as EventListener)
    return () => {
      window.removeEventListener('spa-media-updated', handleMediaUpdate as EventListener)
    }
  }, [spaId])

  const initial = spaName?.charAt(0).toUpperCase() || "S"

  if (fillContainer) {
    // Fill entire container (for homepage cards)
    if (loading) {
      return (
        <div className={`w-full h-full ${roundedClass} bg-slate-200 animate-pulse ${className}`} />
      )
    }

    if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt={spaName || "Spa Avatar"} 
          className={`w-full h-full ${roundedClass} object-cover ${className}`}
        />
      )
    }

    return (
      <div className={`w-full h-full ${roundedClass} bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-semibold text-white ${className}`}>
        <span className="text-4xl">{initial}</span>
      </div>
    )
  }

  // Original size-based display (for smaller avatars)
  const sizeClass = size === "sm" ? "w-16 h-16 text-lg" : size === "md" ? "w-24 h-24 text-2xl" : "w-32 h-32 text-3xl"

  if (loading) {
    return (
      <div className={`${sizeClass} ${roundedClass} bg-slate-200 animate-pulse ${className}`} />
    )
  }

  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={spaName || "Spa Avatar"} 
        className={`${sizeClass} ${roundedClass} object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClass} ${roundedClass} bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center font-semibold text-white ${className}`}>
      {initial}
    </div>
  )
}

