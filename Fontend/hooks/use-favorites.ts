import { useState, useEffect } from "react"
import { spasAPI } from "@/lib/api-service"

const FAVORITES_KEY = "spa_favorites"

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load favorite IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (stored) {
      try {
        setFavoriteIds(JSON.parse(stored))
      } catch (err) {
        console.error("Failed to parse favorites:", err)
      }
    }
    setLoading(false)
  }, [])

  // Load spa details for favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (favoriteIds.length === 0) {
        setFavorites([])
        return
      }

      try {
        const promises = favoriteIds.map((id) =>
          spasAPI.getOne(id).catch(() => null)
        )
        const results = await Promise.all(promises)
        const validSpas = results
          .filter((r) => r !== null)
          .map((r) => r.data?.data)
          .filter(Boolean)
        setFavorites(validSpas)
      } catch (err) {
        console.error("Failed to load favorite spas:", err)
      }
    }

    loadFavorites()
  }, [favoriteIds])

  const addFavorite = (spaId: number) => {
    const newIds = [...favoriteIds, spaId]
    setFavoriteIds(newIds)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds))
  }

  const removeFavorite = (spaId: number) => {
    const newIds = favoriteIds.filter((id) => id !== spaId)
    setFavoriteIds(newIds)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds))
  }

  const isFavorite = (spaId: number) => {
    return favoriteIds.includes(spaId)
  }

  const toggleFavorite = (spaId: number) => {
    if (isFavorite(spaId)) {
      removeFavorite(spaId)
    } else {
      addFavorite(spaId)
    }
  }

  return {
    favorites,
    favoriteIds,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  }
}

