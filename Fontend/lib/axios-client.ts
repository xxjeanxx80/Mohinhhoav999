import axios, { AxiosError } from "axios"
import { getAPIBaseURL, setUseDirectURL } from "./api-config"
import { clearAuthData } from "./auth-utils"

// Dynamic base URL - will update if user switches to direct URL
let apiBaseURL = getAPIBaseURL()

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
})

// Update base URL dynamically if config changes
if (typeof window !== "undefined") {
  // Listen for storage changes to update base URL
  window.addEventListener("storage", () => {
    const newBaseURL = getAPIBaseURL()
    if (newBaseURL !== apiBaseURL) {
      apiBaseURL = newBaseURL
      api.defaults.baseURL = apiBaseURL
      // API base URL updated
    }
  })
}

// Add token to request headers
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// Handle response errors with retry logic for blocked requests
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as { _retried?: boolean; baseURL?: string } | undefined
    
    // Retry with direct URL if network error and using proxy
    if (
      (error.code === 'ERR_NETWORK' || error.message === 'Network Error') &&
      originalRequest &&
      !originalRequest._retried &&
      typeof window !== "undefined" &&
      apiBaseURL === "/api" // Only retry if using proxy
    ) {
      originalRequest._retried = true
      
      // Try direct URL as fallback
      const directURL = process.env.NEXT_PUBLIC_API_URL_DIRECT || "http://localhost:3000"
      originalRequest.baseURL = directURL
      
      try {
        const response = await axios(originalRequest)
        // If direct URL works, enable it for future requests
        setUseDirectURL(true)
        return response
      } catch (retryError: unknown) {
        // Return original error with helpful message
        return Promise.reject({
          ...error,
          message: "Không thể kết nối đến server. Có thể do ad blocker hoặc extension chặn request. Vui lòng tắt ad blocker và thử lại.",
          isBlockedByClient: true,
        })
      }
    }
    
    // Handle 401 Unauthorized - token invalid or expired
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearAuthData()
        // Redirect to homepage (where auth modal is)
        window.location.href = "/"
      }
    }
    
    // Handle 403 Forbidden - user doesn't have permission
    // Don't redirect automatically - let the component handle the error
    // Redirecting causes reload loops when owner/admin try to access each other's endpoints
    // Components should catch 403 errors and handle them gracefully
    
    // Handle 404 Not Found - if it's an auth-related endpoint, clear auth data
    if (error.response?.status === 404) {
      const url = error.config?.url || ""
      // If it's an auth endpoint returning 404, token might be invalid
      if (url.includes("/auth/") || url.includes("/me") || url.includes("/profile")) {
        if (typeof window !== "undefined") {
          clearAuthData()
          // Don't redirect on 404 for auth endpoints, let the app handle it
        }
      }
    }
    
    return Promise.reject(error)
  },
)

export default api
