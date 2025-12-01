/**
 * API Configuration
 * Handles switching between proxy and direct URL based on environment or fallback
 */

// Check if we should use direct URL (bypass proxy)
// This can be set via environment variable or localStorage flag
export function shouldUseDirectURL(): boolean {
  if (typeof window === "undefined") return false
  
  // Check localStorage flag (can be set by user if proxy is blocked)
  const useDirect = localStorage.getItem("useDirectAPI")
  if (useDirect === "true") return true
  
  // Check environment variable
  if (process.env.NEXT_PUBLIC_USE_DIRECT_API === "true") return true
  
  // FORCE DIRECT URL for deployed environments (Vercel, etc.)
  if (process.env.NEXT_PUBLIC_API_URL_DIRECT && process.env.NEXT_PUBLIC_API_URL_DIRECT !== "http://localhost:3000") {
    return true
  }
  
  return false
}

export function getAPIBaseURL(): string {
  // DEBUG: Log environment variables to check if they're baked into build
  if (typeof window !== "undefined") {
    console.log('🔍 DEBUG - API_URL_DIRECT:', process.env.NEXT_PUBLIC_API_URL_DIRECT)
    console.log('🔍 DEBUG - API_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('🔍 DEBUG - shouldUseDirectURL:', shouldUseDirectURL())
  }
  
  if (shouldUseDirectURL()) {
    return process.env.NEXT_PUBLIC_API_URL_DIRECT || "http://localhost:3000"
  }
  return process.env.NEXT_PUBLIC_API_URL || "/api"
}

export function setUseDirectURL(enabled: boolean) {
  if (typeof window !== "undefined") {
    if (enabled) {
      localStorage.setItem("useDirectAPI", "true")
    } else {
      localStorage.removeItem("useDirectAPI")
    }
  }
}

