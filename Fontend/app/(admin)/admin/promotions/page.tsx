"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Tag, Plus } from "lucide-react"

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: "",
    discountPercent: 10,
    expiresAt: "",
    maxRedemptions: 100,
  })
  const { toast } = useToast()

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getCoupons()
      setCoupons(response.data?.data || [])
    } catch (error: any) {
      console.error("Failed to fetch coupons:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách coupon",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã coupon",
        variant: "destructive",
      })
      return
    }

    // Admin max 70%
    if (form.discountPercent > 70) {
      toast({
        title: "Lỗi",
        description: "Admin chỉ có thể tạo mã giảm giá tối đa 70%",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      // Chuẩn bị payload
      const payload = {
        code: form.code,
        discountPercent: form.discountPercent,
        expiresAt: form.expiresAt || undefined,
        ...(form.maxRedemptions ? { maxRedemptions: form.maxRedemptions } : {})
      }
      
      await adminAPI.createCoupon(payload)
      toast({
        title: "Thành công",
        description: "Đã tạo coupon",
      })
      setForm({ code: "", discountPercent: 10, expiresAt: "", maxRedemptions: 100 })
      setShowForm(false)
      await fetchCoupons()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Tạo coupon thất bại",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteCoupon(id)
      toast({
        title: "Thành công",
        description: "Đã xóa coupon",
      })
      await fetchCoupons()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Xóa coupon thất bại",
        variant: "destructive",
      })
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
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Mã khuyến mãi</h1>
          <p className="mt-2 text-slate-600">Tạo và quản lý các mã coupon hệ thống</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo Coupon
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo Coupon mới</CardTitle>
            <CardDescription>Điền thông tin để tạo mã khuyến mãi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Mã Coupon *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="VD: SUMMER2025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Giảm giá (%) - Admin max 70%</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    min={0}
                    max={70}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max">Số lần sử dụng tối đa</Label>
                  <Input
                    id="max"
                    type="number"
                    value={form.maxRedemptions}
                    onChange={(e) => setForm({ ...form, maxRedemptions: Number(e.target.value) })}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Ngày hết hạn (tuỳ chọn)</Label>
                  <Input
                    id="expires"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Đang tạo..." : "Tạo Coupon"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tất cả Coupon
          </CardTitle>
          <CardDescription>{coupons.length} coupon trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có coupon nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Mã</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Giảm giá</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Đã dùng/Tối đa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hết hạn</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{coupon.code}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{coupon.discountPercent}%</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {coupon.currentRedemptions || 0} / {coupon.maxRedemptions || "∞"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("vi-VN") : "Không"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={coupon.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {coupon.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          Xóa
                        </Button>
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
