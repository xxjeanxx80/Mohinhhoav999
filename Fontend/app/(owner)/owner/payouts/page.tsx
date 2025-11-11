"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useOwnerPayouts } from "@/hooks/use-owner-payouts"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { DollarSign, Plus, CheckCircle, XCircle, Clock } from "lucide-react"

export default function OwnerPayouts() {
  const { payouts, availableProfit, loading, requestPayout } = useOwnerPayouts()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: "",
    notes: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    
    if (!amount || amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await requestPayout(amount, form.notes || undefined)
      setForm({ amount: "", notes: "" })
      setShowForm(false)
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      REQUESTED: { 
        label: "Đã yêu cầu", 
        className: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-4 w-4" />
      },
      APPROVED: { 
        label: "Đã phê duyệt", 
        className: "bg-blue-100 text-blue-800",
        icon: <CheckCircle className="h-4 w-4" />
      },
      COMPLETED: { 
        label: "Đã hoàn thành", 
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4" />
      },
      REJECTED: { 
        label: "Đã từ chối", 
        className: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4" />
      },
    }
    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800", icon: null }
    return (
      <Badge className={badge.className}>
        <div className="flex items-center gap-1">
          {badge.icon}
          {badge.label}
        </div>
      </Badge>
    )
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Thanh toán</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600">Yêu cầu và xem lịch sử thanh toán</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Yêu cầu thanh toán</span>
          <span className="sm:hidden">Yêu cầu</span>
        </Button>
      </div>

      {/* Available Profit Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Số tiền hiện có (Available Profit)
          </CardTitle>
          <CardDescription className="text-green-700">
            Tổng số tiền bạn có thể rút hiện tại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-800">
            {new Intl.NumberFormat('vi-VN').format(availableProfit)} VND
          </div>
          <p className="text-sm text-green-600 mt-2">
            Số tiền này sẽ tự động giảm khi bạn thực hiện payout
          </p>
        </CardContent>
      </Card>

      {/* Request Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu Thanh toán</CardTitle>
            <CardDescription>Điền thông tin để yêu cầu thanh toán</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền (VND) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="VD: 1000000"
                  min="0"
                  step="1000"
                  max={availableProfit}
                  required
                />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    Số tiền: {form.amount ? new Intl.NumberFormat('vi-VN').format(parseFloat(form.amount) || 0) : "0"} VND
                  </p>
                  <p className="text-xs text-slate-500">
                    Số tiền còn lại sau payout: {form.amount ? new Intl.NumberFormat('vi-VN').format(Math.max(0, availableProfit - parseFloat(form.amount) || 0)) : new Intl.NumberFormat('vi-VN').format(availableProfit)} VND
                  </p>
                  {form.amount && parseFloat(form.amount) > availableProfit && (
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Số tiền vượt quá số tiền hiện có!
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="VD: Thanh toán tháng 10/2025"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  setForm({ amount: "", notes: "" })
                }}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payouts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Lịch sử Thanh toán
          </CardTitle>
          <CardDescription>{payouts.length} yêu cầu thanh toán</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Chưa có yêu cầu thanh toán nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Số tiền</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày yêu cầu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày phê duyệt</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày hoàn thành</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">#{payout.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {new Intl.NumberFormat('vi-VN').format(payout.amount)} VND
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(payout.requestedAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {payout.approvedAt ? new Date(payout.approvedAt).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {payout.completedAt ? new Date(payout.completedAt).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {payout.notes || "—"}
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

