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
        const message = "Login failed"
        setError(message)
        return { success: false, error: message }
      }
      
      // Handle network error
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const message = "Cannot connect to server. Please check if the backend is running."
        setError(message)
        return { success: false, error: message }
      }
      
      // Handle validation errors
      if (err.response?.status === 400) {
        const validationErrors = err.response?.data?.message || "Invalid data"
        setError(validationErrors)
        return { success: false, error: validationErrors }
      }
      
      // Handle unauthorized
      if (err.response?.status === 401) {
        const message = err.response?.data?.message || "Email or password is incorrect"
        setError(message)
        return { success: false, error: message }
      }
      
      const message = err.response?.data?.message || "Login failed"
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
      // Backend doesn't receive 'name', only email, password, role
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
        const message = "Registration failed"
        setError(message)
        return { success: false, error: message }
      }
      
      // Handle network error
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const message = "Cannot connect to server. Please check if the backend is running."
        setError(message)
        return { success: false, error: message }
      }
      
      // Handle conflict (email already exists)
      if (err.response?.status === 409) {
        const message = err.response?.data?.message || "This email is already registered"
        setError(message)
        return { success: false, error: message }
      }
      
      // Handle validation errors
      if (err.response?.status === 400) {
        const validationErrors = err.response?.data?.message || "Invalid data"
        setError(validationErrors)
        return { success: false, error: validationErrors }
      }
      
      const message = err.response?.data?.message || "Registration failed"
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

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post<ApiResponse<undefined>>("/auth/forgot-password", { email })
      return { success: true, message: response.data.message }
    } catch (err: unknown) {
      const isAxiosError = (error: unknown): error is { code?: string; message?: string; response?: { status?: number; data?: { message?: string } } } => {
        return typeof error === 'object' && error !== null
      }
      
      if (!isAxiosError(err)) {
        const message = "Cannot send password reset email"
        setError(message)
        return { success: false, error: message }
      }
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const message = "Cannot connect to server"
        setError(message)
        return { success: false, error: message }
      }
      
      const message = err.response?.data?.message || "Cannot send password reset email"
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  return { login, register, logout, forgotPassword, loading, error }
}
