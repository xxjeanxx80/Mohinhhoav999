"use client"

import { useState, useEffect, useRef } from "react"
import { usersAPI } from "@/lib/api-service"

interface UserAvatarProps {
  userId: number | string
  userName?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
  refreshKey?: number | string // Key để force refresh
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-24 h-24 text-3xl",
}

export function UserAvatar({ userId, userName, className = "", size = "md", refreshKey }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const prevRefreshKey = useRef(refreshKey)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      
      try {
        const response = await usersAPI.getAvatar(Number(userId))
        const media = response.data?.data
        if (media?.url) {
          // Thêm timestamp để bypass cache
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

    // Refresh nếu refreshKey thay đổi
    if (refreshKey !== prevRefreshKey.current) {
      prevRefreshKey.current = refreshKey
      setLoading(true)
    }

    fetchAvatar()
  }, [userId, refreshKey, refreshTrigger])

  // Listen for avatar upload events
  useEffect(() => {
    const handleAvatarUploaded = () => {
      // Chỉ refresh nếu là cùng user
      if (userId) {
        setRefreshTrigger(prev => prev + 1)
      }
    }

    window.addEventListener('avatar-uploaded', handleAvatarUploaded)
    return () => {
      window.removeEventListener('avatar-uploaded', handleAvatarUploaded)
    }
  }, [userId])

  const sizeClass = sizeClasses[size]
  const initial = userName?.charAt(0).toUpperCase() || "U"

  if (loading) {
    return (
      <div className={`${sizeClass} rounded-full bg-slate-200 animate-pulse ${className}`} />
    )
  }

  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={userName || "Avatar"} 
        className={`${sizeClass} rounded-full object-cover border-2 border-slate-200 ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-amber-400 to-amber-400 flex items-center justify-center font-semibold text-white ${className}`}>
      {initial}
    </div>
  )
}

