"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Shield, User, Store } from "lucide-react"

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getUsers()
      // Backend returns { data: { users: [...] } }
      const usersData = response.data?.data?.users || response.data?.users || []
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (error: any) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])


  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />
      case "OWNER":
        return <Store className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          {getRoleIcon(role)} Admin
        </Badge>
      case "OWNER":
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          {getRoleIcon(role)} Owner
        </Badge>
      default:
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          {getRoleIcon(role)} Customer
        </Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý người dùng</h1>
        <p className="mt-2 text-slate-600">Quản lý tất cả người dùng trong hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả người dùng</CardTitle>
          <CardDescription>{users.length} người dùng trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có người dùng nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Vai trò</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">#{user.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{user.phone || "N/A"}</td>
                      <td className="px-4 py-3 text-sm">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
