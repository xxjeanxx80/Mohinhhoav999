"use client"

import { useState, useEffect } from "react"
import axiosClient from "@/lib/axios-client"

export function useHomepageImages() {
  const [card1Url, setCard1Url] = useState<string | null>(null)
  const [card2Url, setCard2Url] = useState<string | null>(null)
  const [serviceImages, setServiceImages] = useState<Record<number, string | null>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true)
      try {
        // Fetch card images
        const [card1Res, card2Res] = await Promise.all([
          axiosClient.get("/media/homepage/homepage_card_1").catch(() => ({ data: { data: null } })),
          axiosClient.get("/media/homepage/homepage_card_2").catch(() => ({ data: { data: null } })),
        ])

        const card1 = card1Res.data?.data
        const card2 = card2Res.data?.data

        if (card1?.url) {
          setCard1Url(card1.url.startsWith('http') ? card1.url : `http://localhost:3000${card1.url}`)
        }
        if (card2?.url) {
          setCard2Url(card2.url.startsWith('http') ? card2.url : `http://localhost:3000${card2.url}`)
        }

        // Fetch service images
        const servicePromises = Array.from({ length: 6 }, (_, i) =>
          axiosClient.get(`/media/homepage/homepage_service_${i + 1}`).catch(() => ({ data: { data: null } }))
        )

        const serviceResults = await Promise.all(servicePromises)
        const serviceUrls: Record<number, string | null> = {}

        serviceResults.forEach((res, index) => {
          const media = res.data?.data
          if (media?.url) {
            serviceUrls[index] = media.url.startsWith('http') ? media.url : `http://localhost:3000${media.url}`
          } else {
            serviceUrls[index] = null
          }
        })

        setServiceImages(serviceUrls)
      } catch (error) {
        console.error("Failed to fetch homepage images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  return { card1Url, card2Url, serviceImages, loading }
}

