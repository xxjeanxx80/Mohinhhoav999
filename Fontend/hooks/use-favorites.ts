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

  const fetchFavorites = async () => {
    if (!isAuthenticated()) {
      setFavoriteIds([])
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await favoritesAPI.getAll()
      const data = response.data?.data || []
      setFavoriteIds(data.map((fav: any) => fav.spaId))
      setFavorites(data.map((fav: any) => fav.spa).filter(Boolean))
    } catch {
      setFavoriteIds([])
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  const addFavorite = async (spaId: number) => {
    if (!isAuthenticated()) return false
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

  const removeFavorite = async (spaId: number) => {
    if (!isAuthenticated()) return false
    try {
      await favoritesAPI.remove(spaId)
      setFavoriteIds(prev => prev.filter(id => id !== spaId))
      setFavorites(prev => prev.filter(spa => spa.id !== spaId))
      return true
    } catch {
      return false
    }
  }

  const toggleFavorite = async (spaId: number) => {
    return favoriteIds.includes(spaId) ? removeFavorite(spaId) : addFavorite(spaId)
  }

  const isFavorite = (spaId: number) => favoriteIds.includes(spaId)

  useEffect(() => {
    if (isAuthenticated()) fetchFavorites()
    else setLoading(false)
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
