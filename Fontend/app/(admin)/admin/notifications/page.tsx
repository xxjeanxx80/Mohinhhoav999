"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Bell, Send, Mail, Smartphone, MessageCircle, Plus } from "lucide-react"
import { adminAPI } from "@/lib/api-service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    channel: "EMAIL",
    userId: "",
    message: "",
  })
  const { toast } = useToast()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllNotifications()
      const data = response.data?.data || response.data || []
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thông báo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung thông báo",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await adminAPI.sendNotification({
        channel: form.channel,
        userId: form.userId ? parseInt(form.userId) : undefined,
        message: form.message,
      })
      toast({
        title: "Thành công",
        description: "Đã gửi thông báo",
      })
      setForm({ channel: "EMAIL", userId: "", message: "" })
      setShowForm(false)
      await fetchNotifications()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể gửi thông báo"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

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

  useEffect(() => {
    fetchNotifications()
  }, [])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Thông báo</h1>
          <p className="mt-2 text-slate-600">Gửi và quản lý thông báo đến người dùng</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Gửi Thông báo
        </Button>
      </div>

      {/* Send Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Gửi Thông báo mới
            </CardTitle>
            <CardDescription>Gửi thông báo đến một người dùng cụ thể hoặc tất cả</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Kênh *</Label>
                <Select
                  value={form.channel}
                  onValueChange={(value) => setForm({ ...form, channel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="PUSH">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">User ID (tùy chọn - để trống để gửi đến tất cả)</Label>
                <Input
                  id="userId"
                  type="number"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  placeholder="VD: 1, 2, 3..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nội dung *</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Nhập nội dung thông báo..."
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  setForm({ channel: "EMAIL", userId: "", message: "" })
                }}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                  {submitting ? "Đang gửi..." : "Gửi Thông báo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tất cả Thông báo
          </CardTitle>
          <CardDescription>{notifications.length} thông báo</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Chưa có thông báo nào</p>
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
                  <p className="text-sm text-slate-900 mb-2">
                    {notification.payload?.message || "Không có nội dung"}
                  </p>
                  {notification.user && (
                    <p className="text-xs text-slate-500">
                      Gửi đến: User #{notification.user.id || "N/A"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

