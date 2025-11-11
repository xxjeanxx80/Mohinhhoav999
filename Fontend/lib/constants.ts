// Use direct URL if proxy is blocked, otherwise use proxy
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
// Direct backend URL for fallback when proxy is blocked
export const API_URL_DIRECT = process.env.NEXT_PUBLIC_API_URL_DIRECT || "http://localhost:3000"
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Beauty Booking Hub"

export const ROLES = {
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  CUSTOMER: "CUSTOMER",
}

export const ROLE_PATHS = {
  ADMIN: "/admin",
  OWNER: "/owner",
  CUSTOMER: "/customer",
}
