"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { FileText, Activity } from "lucide-react"

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getLogs()
      setLogs(response.data?.data || [])
    } catch (error: any) {
      console.error("Failed to fetch logs:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải audit logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      APPROVE: "bg-red-100 text-red-800",
      REJECT: "bg-orange-100 text-orange-800",
    }
    return colors[action] || "bg-gray-100 text-gray-800"
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
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="mt-2 text-slate-600">Lịch sử hoạt động của Admin trong hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            Nhật ký hoạt động
          </CardTitle>
          <CardDescription>{logs.length} hoạt động được ghi nhận</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Chưa có hoạt động nào được ghi nhận</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Chi tiết</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Admin</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">#{log.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={getActionBadge(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {log.details ? JSON.stringify(log.details) : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        Admin #{log.adminId || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
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
