"use client"

import { useState, useEffect } from "react"
import { favoritesAPI } from "@/lib/api-service"

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  if (typeof window === "undefined") return false
  const token = localStorage.getItem("access_token") || 
                sessionStorage.getItem("access_token")
  return !!token
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false) // Start with false, only load when authenticated

  // Fetch favorites từ API
  const fetchFavorites = async () => {
    if (!isAuthenticated()) {
      console.log("🔒 [useFavorites] User not authenticated, skipping API call")
      setFavoriteIds([])
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await favoritesAPI.getAll()
      const data = response.data?.data || []
      
      const ids = data.map((fav: any) => fav.spaId)
      const spas = data.map((fav: any) => fav.spa).filter(Boolean)
      
      setFavoriteIds(ids)
      setFavorites(spas)
    } catch (err: any) {
      console.error("Failed to fetch favorites:", err)
      // If 401, user not authenticated - don't treat as error
      if (err.response?.status === 401) {
        console.log("🔒 [useFavorites] 401 Unauthorized - user not logged in")
      }
      setFavoriteIds([])
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  // Thêm spa vào yêu thích
  const addFavorite = async (spaId: number) => {
    if (!isAuthenticated()) {
      console.log("🔒 [useFavorites] User not authenticated, cannot add favorite")
      return false
    }

    try {
      await favoritesAPI.create(spaId)
      setFavoriteIds(prev => [...prev, spaId])
      return true
    } catch (err: any) {
      if (err.response?.status === 409) {
        setFavoriteIds(prev => prev.includes(spaId) ? prev : [...prev, spaId])
        return true
      }
      return false
    }
  }

  // Xóa spa khỏi yêu thích
  const removeFavorite = async (spaId: number) => {
    if (!isAuthenticated()) {
      console.log("🔒 [useFavorites] User not authenticated, cannot remove favorite")
      return false
    }

    try {
      await favoritesAPI.remove(spaId)
      setFavoriteIds(prev => prev.filter(id => id !== spaId))
      setFavorites(prev => prev.filter(spa => spa.id !== spaId))
      return true
    } catch (err: any) {
      return false
    }
  }

  // Toggle yêu thích - bật/tắt
  const toggleFavorite = async (spaId: number) => {
    if (favoriteIds.includes(spaId)) {
      return await removeFavorite(spaId)
    } else {
      return await addFavorite(spaId)
    }
  }

  // Check spa có trong yêu thích không
  const isFavorite = (spaId: number) => {
    return favoriteIds.includes(spaId)
  }

  // Fetch khi mount - chỉ khi user authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchFavorites()
    } else {
      console.log("🔒 [useFavorites] User not authenticated, skipping initial fetch")
      setLoading(false)
    }
  }, [])

  return {
    favorites,
    favoriteIds,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  }
}
