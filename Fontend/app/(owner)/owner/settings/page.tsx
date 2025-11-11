"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Upload } from "lucide-react"
import { useOwnerSpa } from "@/hooks/use-owner-spa"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { ownerAPI, usersAPI } from "@/lib/api-service"

export default function OwnerSettings() {
  const { spa, loading, updateSpa, refetch } = useOwnerSpa()
  const { user } = useUser()
  const [form, setForm] = useState({ 
    name: "", 
    address: "", 
    phone: "", 
    email: "",
  })
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBackground, setUploadingBackground] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (spa) {
      setForm(prev => ({
        ...prev,
        name: spa.name ?? "",
        address: spa.address ?? "",
        phone: spa.phone ?? "",
        email: spa.email ?? "",
      }))
      // Fetch avatar and background from media API
      if (spa.id) {
        fetchSpaImages()
      }
    }
  }, [spa])


  const fetchSpaImages = async () => {
    if (!spa?.id) return
    try {
      const [avatarRes, backgroundRes] = await Promise.all([
        ownerAPI.getSpaAvatar(spa.id).catch(() => ({ data: { data: null } })),
        ownerAPI.getSpaBackground(spa.id).catch(() => ({ data: { data: null } })),
      ])
      
      const avatar = avatarRes.data?.data
      const background = backgroundRes.data?.data
      
      setAvatarUrl(avatar?.url ? `http://localhost:3000${avatar.url}` : null)
      setBackgroundUrl(background?.url ? `http://localhost:3000${background.url}` : null)
    } catch (error) {
      setAvatarUrl(null)
      setBackgroundUrl(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Spa Settings</h1>
        <p className="mt-2 text-slate-600">Manage your spa information and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spa Information</CardTitle>
          <CardDescription>Update your spa details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Spa Name</label>
            <Input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Address</label>
            <Input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700" 
            disabled={loading || saving} 
            onClick={async () => {
              try {
                setSaving(true)
                await updateSpa(form)
                await refetch()
                toast({
                  title: "Thành công",
                  description: "Đã lưu thay đổi thông tin spa thành công!",
                })
              } catch (error) {
                // Error already handled in hook
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardContent>
      </Card>

      {/* Spa Images */}
      <Card>
        <CardHeader>
          <CardTitle>Spa Images</CardTitle>
          <CardDescription>Upload spa avatar and background image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Spa Avatar</label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Spa Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-400 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {spa?.name?.charAt(0).toUpperCase() || "S"}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file || !spa?.id) return

                    if (!file.type.startsWith('image/')) {
                      toast({
                        title: "Lỗi",
                        description: "Chỉ chấp nhận file hình ảnh",
                        variant: "destructive",
                      })
                      return
                    }

                    try {
                      setUploadingAvatar(true)
                      await ownerAPI.uploadSpaAvatar(spa.id, file)
                      toast({
                        title: "Thành công",
                        description: "Đã cập nhật ảnh đại diện spa thành công",
                      })
                      await fetchSpaImages()
                      await refetch()
                      // Trigger refresh for all spa components
                      window.dispatchEvent(new CustomEvent('spa-media-updated', { detail: { spaId: spa.id } }))
                    } catch (error: any) {
                      toast({
                        title: "Lỗi",
                        description: error.response?.data?.message || "Không thể tải lên ảnh đại diện",
                        variant: "destructive",
                      })
                    } finally {
                      setUploadingAvatar(false)
                      if (avatarInputRef.current) avatarInputRef.current.value = ''
                    }
                  }}
                  disabled={uploadingAvatar}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar || loading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploadingAvatar ? "Đang tải..." : "Chọn ảnh đại diện"}
                </Button>
              </div>
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Background Image</label>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-100">
              {backgroundUrl ? (
                <img 
                  src={backgroundUrl} 
                  alt="Spa Background" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-100">
                  <span className="text-slate-400">Chưa có ảnh nền</span>
                </div>
              )}
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file || !spa?.id) return

                  if (!file.type.startsWith('image/')) {
                    toast({
                      title: "Lỗi",
                      description: "Chỉ chấp nhận file hình ảnh",
                      variant: "destructive",
                    })
                    return
                  }

                  try {
                    setUploadingBackground(true)
                    await ownerAPI.uploadSpaBackground(spa.id, file)
                      toast({
                        title: "Thành công",
                        description: "Đã cập nhật ảnh nền spa thành công",
                      })
                      await fetchSpaImages()
                      await refetch()
                      // Trigger refresh for all spa components
                      window.dispatchEvent(new CustomEvent('spa-media-updated', { detail: { spaId: spa.id } }))
                  } catch (error: any) {
                    toast({
                      title: "Lỗi",
                      description: error.response?.data?.message || "Không thể tải lên ảnh nền",
                      variant: "destructive",
                    })
                  } finally {
                    setUploadingBackground(false)
                    if (backgroundInputRef.current) backgroundInputRef.current.value = ''
                  }
                }}
                disabled={uploadingBackground}
              />
              <Button
                type="button"
                variant="outline"
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white"
                onClick={() => backgroundInputRef.current?.click()}
                disabled={uploadingBackground || loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingBackground ? "Đang tải..." : "Chọn ảnh nền"}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Ảnh nền sẽ hiển thị với kích thước w-full h-full object-cover</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>Set your operating hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Opening Time</label>
              <input
                type="time"
                defaultValue="10:00"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Closing Time</label>
              <input
                type="time"
                defaultValue="22:30"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">Save Hours</Button>
        </CardContent>
      </Card>
    </div>
  )
}
