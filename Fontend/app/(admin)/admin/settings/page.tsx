"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Settings, Plus, Save, Trash2 } from "lucide-react"

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newSetting, setNewSetting] = useState({ key: "", value: "", description: "" })
  const { toast } = useToast()

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getSettings()
      setSettings(response.data?.data || [])
    } catch (error: any) {
      console.error("Failed to fetch settings:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải system settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key)
    try {
      await adminAPI.updateSetting(key, { value })
      toast({
        title: "Thành công",
        description: "Đã cập nhật setting",
      })
      await fetchSettings()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Cập nhật setting thất bại",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  const handleCreate = async () => {
    if (!newSetting.key.trim() || !newSetting.value.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ key và value",
        variant: "destructive",
      })
      return
    }

    try {
      await adminAPI.createSetting(newSetting)
      toast({
        title: "Thành công",
        description: "Đã tạo setting mới",
      })
      setNewSetting({ key: "", value: "", description: "" })
      setShowForm(false)
      await fetchSettings()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Tạo setting thất bại",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (key: string) => {
    try {
      await adminAPI.deleteSetting(key)
      toast({
        title: "Thành công",
        description: "Đã xóa setting",
      })
      await fetchSettings()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Xóa setting thất bại",
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
          <h1 className="text-3xl font-bold text-slate-900">Cài đặt hệ thống</h1>
          <p className="mt-2 text-slate-600">Quản lý các thiết lập cấu hình hệ thống</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Setting
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm Setting mới</CardTitle>
            <CardDescription>Tạo một cấu hình hệ thống mới</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Key *</Label>
                  <Input
                    id="key"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                    placeholder="VD: app_name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                    placeholder="VD: Beauty Hub"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
                <Input
                  id="description"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  placeholder="Mô tả cho setting này..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreate}>
                  Tạo Setting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-red-600" />
            Tất cả Settings
          </CardTitle>
          <CardDescription>{settings.length} setting(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có setting nào</p>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {setting.key}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={setting.value}
                          onChange={(e) => {
                            const updated = [...settings]
                            const index = updated.findIndex((s) => s.id === setting.id)
                            updated[index].value = e.target.value
                            setSettings(updated)
                          }}
                          className="max-w-md"
                        />
                        {setting.description && (
                          <p className="text-sm text-slate-500">{setting.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(setting.key, setting.value)}
                        disabled={saving === setting.key}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {saving === setting.key ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(setting.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
