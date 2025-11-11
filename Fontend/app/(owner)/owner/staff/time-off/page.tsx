"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useOwnerStaffTimeOff } from "@/hooks/use-owner-staff-timeoff"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Calendar, Plus, Trash2, Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OwnerStaffTimeOff() {
  const { timeOffs, loading, staff, requestTimeOff, refetch } = useOwnerStaffTimeOff()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    staffId: "",
    startAt: "",
    endAt: "",
    reason: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staffId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn nhân viên",
        variant: "destructive",
      })
      return
    }

    if (!form.startAt || !form.endAt) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày bắt đầu và kết thúc",
        variant: "destructive",
      })
      return
    }

    const startDate = new Date(form.startAt)
    const endDate = new Date(form.endAt)

    if (endDate < startDate) {
      toast({
        title: "Lỗi",
        description: "Ngày kết thúc phải sau ngày bắt đầu",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await requestTimeOff(parseInt(form.staffId), {
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        reason: form.reason || undefined,
      })
      setForm({ staffId: "", startAt: "", endAt: "", reason: "" })
      setShowForm(false)
      refetch()
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (timeOff: any) => {
    const now = new Date()
    const startDate = new Date(timeOff.startAt)
    const endDate = new Date(timeOff.endAt)

    if (endDate < now) {
      return <Badge className="bg-gray-100 text-gray-800">Đã kết thúc</Badge>
    } else if (startDate <= now && endDate >= now) {
      return <Badge className="bg-yellow-100 text-yellow-800">Đang nghỉ</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Sắp nghỉ</Badge>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Nghỉ phép</h1>
          <p className="mt-2 text-slate-600">Quản lý đơn nghỉ phép của nhân viên</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ghi nhận nghỉ phép
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi nhận Nghỉ phép</CardTitle>
            <CardDescription>Điền thông tin để ghi nhận nghỉ phép cho nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff">Nhân viên *</Label>
                <Select value={form.staffId} onValueChange={(value) => setForm({ ...form, staffId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Ngày bắt đầu *</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt">Ngày kết thúc *</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Lý do (tùy chọn)</Label>
                <Textarea
                  id="reason"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="VD: Nghỉ ốm, Nghỉ phép..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  setForm({ staffId: "", startAt: "", endAt: "", reason: "" })
                }}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                  {submitting ? "Đang lưu..." : "Ghi nhận"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Time Offs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Danh sách Nghỉ phép
          </CardTitle>
          <CardDescription>{timeOffs.length} bản ghi nghỉ phép</CardDescription>
        </CardHeader>
        <CardContent>
          {timeOffs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Chưa có bản ghi nghỉ phép nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Nhân viên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày bắt đầu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày kết thúc</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Thời gian</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Lý do</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {timeOffs.map((timeOff) => {
                    const startDate = new Date(timeOff.startAt)
                    const endDate = new Date(timeOff.endAt)
                    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

                    return (
                      <tr key={timeOff.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{timeOff.staff.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {startDate.toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {endDate.toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {daysDiff} {daysDiff === 1 ? "ngày" : "ngày"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {timeOff.reason || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(timeOff)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

