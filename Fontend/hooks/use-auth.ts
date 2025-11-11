"use client"

import { useState, useCallback } from "react"
import api from "@/lib/axios-client"
import { clearAuthData } from "@/lib/auth-utils"

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  password: string
  name: string
  role?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
}

interface LoginResponseData {
  user: AuthenticatedUser
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<ApiResponse<LoginResponseData>>("/auth/login", payload)
      
      const apiRes = response.data
      const user = apiRes.data?.user
      const accessToken = apiRes.data?.tokens.accessToken

      if (!user || !accessToken) {
        throw new Error("Invalid login response")
      }

      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("role", user.role)
      localStorage.setItem("user", JSON.stringify(user))
      
      // Set cookies with 7 days expiry (Next.js middleware needs this)
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `access_token=${accessToken}; Path=/; SameSite=Lax; Expires=${expires}`
      document.cookie = `role=${user.role}; Path=/; SameSite=Lax; Expires=${expires}`

      return { success: true, user, role: user.role }
    } catch (err: unknown) {
      // Type guard for AxiosError
      const isAxiosError = (error: unknown): error is { code?: string; message?: string; response?: { status?: number; data?: { message?: string } } } => {
        return typeof error === 'object' && error !== null
      }
      
      if (!isAxiosError(err)) {
        const message = "Đăng nhập thất bại"
        setError(message)
        return { success: false, error: message }
      }
      
      // Xử lý network error
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const message = "Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không."
        setError(message)
        return { success: false, error: message }
      }
      
      // Xử lý validation errors
      if (err.response?.status === 400) {
        const validationErrors = err.response?.data?.message || "Dữ liệu không hợp lệ"
        setError(validationErrors)
        return { success: false, error: validationErrors }
      }
      
      // Xử lý unauthorized
      if (err.response?.status === 401) {
        const message = err.response?.data?.message || "Email hoặc mật khẩu không đúng"
        setError(message)
        return { success: false, error: message }
      }
      
      const message = err.response?.data?.message || "Đăng nhập thất bại"
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true)
    setError(null)
    try {
      // Backend không nhận 'name', chỉ nhận email, password, role
      const registerPayload = {
        email: payload.email,
        password: payload.password,
        role: payload.role || "CUSTOMER",
      }
      
      const response = await api.post<ApiResponse<LoginResponseData>>("/auth/register", registerPayload)
      
      const apiRes = response.data
      const user = apiRes.data?.user
      const accessToken = apiRes.data?.tokens.accessToken

      if (!user || !accessToken) {
        throw new Error("Invalid register response")
      }

      localStorage.setItem("access_token", accessToken)
      localStorage.setItem("role", user.role)
      localStorage.setItem("user", JSON.stringify(user))
      
      // Set cookies with 7 days expiry (Next.js middleware needs this)
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `access_token=${accessToken}; Path=/; SameSite=Lax; Expires=${expires}`
      document.cookie = `role=${user.role}; Path=/; SameSite=Lax; Expires=${expires}`

      return { success: true, user, role: user.role }
    } catch (err: unknown) {
      // Type guard for AxiosError
      const isAxiosError = (error: unknown): error is { code?: string; message?: string; response?: { status?: number; data?: { message?: string } } } => {
        return typeof error === 'object' && error !== null
      }
      
      if (!isAxiosError(err)) {
        const message = "Đăng ký thất bại"
        setError(message)
        return { success: false, error: message }
      }
      
      // Xử lý network error
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const message = "Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không."
        setError(message)
        return { success: false, error: message }
      }
      
      // Xử lý conflict (email đã tồn tại)
      if (err.response?.status === 409) {
        const message = err.response?.data?.message || "Email này đã được đăng ký"
        setError(message)
        return { success: false, error: message }
      }
      
      // Xử lý validation errors
      if (err.response?.status === 400) {
        const validationErrors = err.response?.data?.message || "Dữ liệu không hợp lệ"
        setError(validationErrors)
        return { success: false, error: validationErrors }
      }
      
      const message = err.response?.data?.message || "Đăng ký thất bại"
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    // Use utility function to ensure all auth data is cleared properly
    clearAuthData()
  }, [])

  return { login, register, logout, loading, error }
}
