/**
 * Utility functions for mapping spa names to image paths
 */

const spaImageMap: Record<string, string> = {
  "natural beauty spa": "/images/spas/Natural Beauty Spa.jpg",
  "natural beauty": "/images/spas/natural spa background.jpg",
  "aki beauty spa": "/images/spas/akii.jpg",
  "akii": "/images/spas/akii.jpg",
  "aki": "/images/spas/akii.jpg",
  "amadora wellness & spa": "/images/spas/Amadora background.jpg",
  "amadora wellness": "/images/spas/Amadora background.jpg",
  "amadora": "/images/spas/Amadora background.jpg",
}

const serviceImageMap: Record<string, string> = {
  "chăm sóc da": "/images/services/skincare.jpg",
  "skincare": "/images/services/skincare.jpg",
  "làm móng": "/images/services/nail.webp",
  "nail": "/images/services/nail.webp",
  "ngâm chân": "/images/services/ngam-chan.jpg",
  "massage": "/images/services/massage.webp",
  "massage trị liệu": "/images/services/massage tri lieu.jpg",
  "trị liệu": "/images/services/massage tri lieu.jpg",
  "điêu khắc": "/images/services/dieu_khac_chan_may_nam_1_d865fc82ae.jpg",
}

/**
 * Get spa image path based on spa name
 * Falls back to placeholder if no match found
 */
export function getSpaImage(spa: { name?: string; id?: number }): string {
  if (!spa.name) {
    return "/placeholder.jpg"
  }

  const normalizedName = spa.name.toLowerCase().trim()
  
  // Try exact match first
  if (spaImageMap[normalizedName]) {
    return spaImageMap[normalizedName]
  }

  // Try partial match
  for (const [key, imagePath] of Object.entries(spaImageMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return imagePath
    }
  }

  // Fallback to placeholder
  return "/placeholder.jpg"
}

/**
 * Get service image path based on service name
 */
export function getServiceImage(serviceName: string): string {
  if (!serviceName) {
    return "/placeholder.svg"
  }

  const normalizedName = serviceName.toLowerCase().trim()
  
  // Try exact match first
  if (serviceImageMap[normalizedName]) {
    return serviceImageMap[normalizedName]
  }

  // Try partial match
  for (const [key, imagePath] of Object.entries(serviceImageMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return imagePath
    }
  }

  // Fallback to placeholder
  return "/placeholder.svg"
}

