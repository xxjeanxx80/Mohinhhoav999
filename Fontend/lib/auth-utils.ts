/**
 * Utility functions for authentication management
 * These functions can be called from anywhere, including error pages
 */

/**
 * Clears all authentication data from localStorage and cookies
 * This function is safe to call from any context, including error pages
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") {
    return
  }

  // Clear localStorage
  localStorage.removeItem("access_token")
  localStorage.removeItem("role")
  localStorage.removeItem("user")

  // Clear cookies - multiple methods to ensure they're cleared
  const cookieOptions = [
    "Max-Age=0",
    "Path=/",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ].join("; ")

  document.cookie = `access_token=; ${cookieOptions}`
  document.cookie = `role=; ${cookieOptions}`
  
  // Also try with different domain/path combinations
  document.cookie = `access_token=; Path=/; Max-Age=0; Domain=${window.location.hostname}`
  document.cookie = `role=; Path=/; Max-Age=0; Domain=${window.location.hostname}`
}

/**
 * Checks if user is authenticated by checking both localStorage and cookies
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const token = localStorage.getItem("access_token")
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1]

  return !!(token || cookieToken)
}

/**
 * Gets the current user role from localStorage or cookies
 */
export function getUserRole(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const role = localStorage.getItem("role")
  if (role) {
    return role
  }

  const cookieRole = document.cookie
    .split("; ")
    .find((row) => row.startsWith("role="))
    ?.split("=")[1]

  return cookieRole || null
}

