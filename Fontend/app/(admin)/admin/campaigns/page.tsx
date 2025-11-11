"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api-service"
import { useAdminCampaigns } from "@/hooks/use-admin-campaigns"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Megaphone, Plus, Edit, Trash2, Power, PowerOff } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminCampaigns() {
  const {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateCampaignStatus,
    refetch,
  } = useAdminCampaigns()
  const [spas, setSpas] = useState<any[]>([])
  const [loadingSpas, setLoadingSpas] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    discountPercent: 10,
    startsAt: "",
    endsAt: "",
    spaId: "none",
    isActive: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchSpas = async () => {
      setLoadingSpas(true)
      try {
        const response = await adminAPI.getSpas()
        const spasData = response.data?.data || response.data || []
        setSpas(Array.isArray(spasData) ? spasData : [])
      } catch (error: any) {
        console.error("Failed to fetch spas:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách spa",
          variant: "destructive",
        })
      } finally {
        setLoadingSpas(false)
      }
    }
    fetchSpas()
  }, [])

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      discountPercent: 10,
      startsAt: "",
      endsAt: "",
      spaId: "none",
      isActive: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (campaign: any) => {
    setForm({
      name: campaign.name,
      description: campaign.description || "",
      discountPercent: campaign.discountPercent,
      startsAt: campaign.startsAt ? new Date(campaign.startsAt).toISOString().slice(0, 16) : "",
      endsAt: campaign.endsAt ? new Date(campaign.endsAt).toISOString().slice(0, 16) : "",
      spaId: campaign.spa?.id?.toString() || "none",
      isActive: campaign.isActive,
    })
    setEditingId(campaign.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên chiến dịch",
        variant: "destructive",
      })
      return
    }

    if (form.discountPercent < 0 || form.discountPercent > 100) {
      toast({
        title: "Lỗi",
        description: "Phần trăm giảm giá phải từ 0 đến 100",
        variant: "destructive",
      })
      return
    }

    try {
      const payload: any = {
        name: form.name,
        description: form.description || undefined,
        discountPercent: form.discountPercent,
        startsAt: new Date(form.startsAt).toISOString(),
        isActive: form.isActive,
      }

      if (form.endsAt) {
        payload.endsAt = new Date(form.endsAt).toISOString()
      }

      // Xử lý spaId: nếu là "none" thì gửi null để xóa spa, nếu có giá trị thì parse int
      if (form.spaId === "none") {
        payload.spaId = null
      } else if (form.spaId) {
        payload.spaId = parseInt(form.spaId)
      }

      if (editingId) {
        await updateCampaign(editingId, payload)
        toast({
          title: "Thành công",
          description: "Đã cập nhật chiến dịch",
        })
      } else {
        await createCampaign(payload)
        toast({
          title: "Thành công",
          description: "Đã tạo chiến dịch",
        })
      }
      resetForm()
      refetch()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Thao tác thất bại",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chiến dịch này?")) {
      return
    }

    try {
      await deleteCampaign(id)
      toast({
        title: "Thành công",
        description: "Đã xóa chiến dịch",
      })
      refetch()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Xóa chiến dịch thất bại",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await updateCampaignStatus(id, !currentStatus)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Cập nhật trạng thái thất bại",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (campaign: any) => {
    const now = new Date()
    const startDate = new Date(campaign.startsAt)
    const endDate = campaign.endsAt ? new Date(campaign.endsAt) : null

    if (!campaign.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">Tắt</Badge>
    }

    if (startDate > now) {
      return <Badge className="bg-blue-100 text-blue-800">Sắp diễn ra</Badge>
    }

    if (endDate && endDate < now) {
      return <Badge className="bg-red-100 text-red-800">Hết hạn</Badge>
    }

    return <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
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
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Chiến dịch</h1>
          <p className="mt-2 text-slate-600">Tạo và quản lý các chiến dịch khuyến mãi</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo Chiến dịch
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Chỉnh sửa Chiến dịch" : "Tạo Chiến dịch mới"}</CardTitle>
            <CardDescription>
              {editingId ? "Cập nhật thông tin chiến dịch" : "Điền thông tin để tạo chiến dịch khuyến mãi"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên chiến dịch *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Tháng Vàng Spa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Giảm giá (%) *</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    min={0}
                    max={100}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="VD: Ưu đãi 10%"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spa">Chọn Spa (để trống = áp dụng cho tất cả)</Label>
                  {loadingSpas ? (
                    <div className="text-sm text-slate-500">Đang tải danh sách spa...</div>
                  ) : (
                    <Select value={form.spaId || "none"} onValueChange={(value) => setForm({ ...form, spaId: value === "none" ? "" : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn spa (hoặc để trống cho tất cả)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tất cả Spa (Global)</SelectItem>
                        {spas.map((spa) => (
                          <SelectItem key={spa.id} value={spa.id.toString()}>
                            {spa.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Trạng thái</Label>
                  <Select
                    value={form.isActive ? "true" : "false"}
                    onValueChange={(value) => setForm({ ...form, isActive: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Bật</SelectItem>
                      <SelectItem value="false">Tắt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Ngày bắt đầu *</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">Ngày kết thúc (tùy chọn)</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingId ? "Cập nhật" : "Tạo Chiến dịch"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Tất cả Chiến dịch
          </CardTitle>
          <CardDescription>{campaigns.length} chiến dịch trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có chiến dịch nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Mô tả</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Giảm giá</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Spa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Thời gian</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{campaign.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {campaign.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <Badge className="bg-red-100 text-red-800">
                          {campaign.discountPercent}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {campaign.spa ? (
                          <span>{campaign.spa.name}</span>
                        ) : (
                          <Badge variant="outline">Tất cả Spa</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="space-y-1">
                          <div>Bắt đầu: {new Date(campaign.startsAt).toLocaleString("vi-VN")}</div>
                          {campaign.endsAt && (
                            <div>Kết thúc: {new Date(campaign.endsAt).toLocaleString("vi-VN")}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(campaign)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(campaign.id, campaign.isActive)}
                            title={campaign.isActive ? "Tắt chiến dịch" : "Bật chiến dịch"}
                          >
                            {campaign.isActive ? (
                              <PowerOff className="h-4 w-4 text-orange-600" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

