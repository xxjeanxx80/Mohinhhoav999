"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/use-notifications"
import { Bell, Mail, Smartphone, MessageCircle } from "lucide-react"

export default function CustomerNotifications() {
  const { notifications, loading } = useNotifications()

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "EMAIL":
        return <Mail className="h-4 w-4 text-blue-600" />
      case "SMS":
        return <MessageCircle className="h-4 w-4 text-green-600" />
      case "PUSH":
        return <Smartphone className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-slate-600" />
    }
  }

  const getChannelBadge = (channel: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      EMAIL: { label: "Email", className: "bg-blue-100 text-blue-800" },
      SMS: { label: "SMS", className: "bg-green-100 text-green-800" },
      PUSH: { label: "Push", className: "bg-red-100 text-red-800" },
    }
    const badge = badges[channel] || { label: channel, className: "bg-gray-100 text-gray-800" }
    return <Badge className={badge.className}>{badge.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      SENT: { label: "Đã gửi", className: "bg-green-100 text-green-800" },
      QUEUED: { label: "Chờ gửi", className: "bg-yellow-100 text-yellow-800" },
      FAILED: { label: "Thất bại", className: "bg-red-100 text-red-800" },
    }
    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800" }
    return <Badge className={badge.className}>{badge.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Thông báo</h1>
        <p className="mt-2 text-slate-600">Xem tất cả thông báo của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Danh sách Thông báo
          </CardTitle>
          <CardDescription>{notifications.length} thông báo</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Bạn chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(notification.channel)}
                      {getChannelBadge(notification.channel)}
                      {getStatusBadge(notification.status)}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(notification.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900">{notification.payload?.message || "Không có nội dung"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

