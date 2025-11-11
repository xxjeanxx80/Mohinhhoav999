"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function useAdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data)
      setError(null)
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch users"
      setError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const banUser = async (id: number, data: any) => {
    try {
      await adminAPI.banUser(id, data)
      setUsers(users.map((u: any) => (u.id === id ? { ...u, status: "banned" } : u)))
      toast({ title: "Success", description: "User banned successfully" })
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to ban user"
      toast({ title: "Error", description: message, variant: "destructive" })
      throw err
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return { users, loading, error, banUser, refetch: fetchUsers }
}
