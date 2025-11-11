"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Upload, Camera } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import { usersAPI } from "@/lib/api-service"
import { useLanguage } from "@/contexts/language-context"

export default function CustomerAccount() {
  const { user, loading: userLoading, refetch } = useUser()
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })

  const [bankData, setBankData] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
  })
  const [savingBank, setSavingBank] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      })
      setBankData({
        bankName: user.bankName || "",
        bankAccountNumber: user.bankAccountNumber || "",
        bankAccountHolder: user.bankAccountHolder || "",
      })
      // Fetch avatar from media API
      if (user.id) {
        fetchUserAvatar()
      }
    }
  }, [user])

  const fetchUserAvatar = async () => {
    if (!user?.id) return
    try {
      const response = await usersAPI.getAvatar(Number(user.id))
      const media = response.data?.data
      if (media?.url) {
        setAvatarUrl(`http://localhost:3000${media.url}`)
      } else {
        setAvatarUrl(null)
      }
    } catch (error) {
      // Avatar not found, use default
      setAvatarUrl(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setUpdating(true)
      const response = await usersAPI.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      })
      
      // Update localStorage immediately
      if (response.data?.data?.user) {
        const updatedUser = response.data.data.user
        localStorage.setItem("user", JSON.stringify(updatedUser))
        // Update form data
        setFormData({
          name: updatedUser.name || "",
          phone: updatedUser.phone || "",
          address: updatedUser.address || "",
        })
      }
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cá nhân thành công",
      })
      
      // Refetch user data to update UI immediately
      if (refetch) {
        await refetch()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới không khớp",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      })
      return
    }

    if (!user) return

    try {
      setChangingPassword(true)
      await usersAPI.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      
      toast({
        title: "Thành công",
        description: "Đã đổi mật khẩu thành công",
      })
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể đổi mật khẩu",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file hình ảnh",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingAvatar(true)
      await usersAPI.uploadAvatar(user.id, file)
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật ảnh đại diện thành công",
      })
      
      // Refresh avatar
      await fetchUserAvatar()
      
      // Trigger refresh for all UserAvatar components
      window.dispatchEvent(new CustomEvent('avatar-uploaded'))
      
      if (refetch) {
        await refetch()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tải lên ảnh đại diện",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600">Vui lòng đăng nhập</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Thông tin tài khoản</h1>
        <p className="mt-2 text-slate-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-400 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-2 cursor-pointer hover:bg-red-700 transition"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>
              <p className="font-semibold text-slate-900 mb-4">{formData.name || user.name || "Chưa có tên"}</p>
              <p className="text-sm text-slate-500 mb-4">{user.email}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? "Đang tải..." : "Thay ảnh đại diện"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <Input 
                  name="currentPassword"
                  placeholder="Mật khẩu hiện tại" 
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
                <Input 
                  name="newPassword"
                  placeholder="Mật khẩu mới" 
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
                <Input 
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu" 
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
                <Button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={changingPassword}
                >
                  {changingPassword ? t.updating : t.update}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <div className="md:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle suppressHydrationWarning>{t.accountInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block" suppressHydrationWarning>
                    {t.name} <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder={t.enterName}
                    required
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block" suppressHydrationWarning>
                    Email <span className="text-slate-500 text-xs" suppressHydrationWarning>({language === "VN" ? "Không thể thay đổi" : "Cannot be changed"})</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-slate-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block" suppressHydrationWarning>{t.phone}</label>
                  <Input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder={t.enterPhone}
                    type="tel"
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block" suppressHydrationWarning>{t.address}</label>
                  <Input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder={t.enterAddress}
                    suppressHydrationWarning
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={updating}
                    suppressHydrationWarning
                  >
                    {updating ? t.updating : t.update}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: user.name || "",
                        phone: user.phone || "",
                        address: user.address || "",
                      })
                    }}
                    suppressHydrationWarning
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Bank Account Information */}
          <Card className="border-0 shadow-sm mt-6">
            <CardHeader>
              <CardTitle suppressHydrationWarning>
                {language === "VN" ? "Thông tin tài khoản ngân hàng" : "Bank Account Information"}
              </CardTitle>
              <CardDescription suppressHydrationWarning>
                {language === "VN" ? "Liên kết tài khoản ngân hàng của bạn" : "Link your bank account for payouts"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block" suppressHydrationWarning>
                  {language === "VN" ? "Tên ngân hàng" : "Bank Name"}
                </label>
                <Input 
                  type="text" 
                  placeholder={language === "VN" ? "Ví dụ: Vietcombank, Techcombank" : "e.g., Vietcombank, Techcombank"}
                  value={bankData.bankName} 
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })} 
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block" suppressHydrationWarning>
                  {language === "VN" ? "Số tài khoản" : "Account Number"}
                </label>
                <Input 
                  type="text" 
                  placeholder={language === "VN" ? "Nhập số tài khoản ngân hàng" : "Enter your bank account number"}
                  value={bankData.bankAccountNumber} 
                  onChange={(e) => setBankData({ ...bankData, bankAccountNumber: e.target.value })} 
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block" suppressHydrationWarning>
                  {language === "VN" ? "Tên chủ tài khoản" : "Account Holder Name"}
                </label>
                <Input 
                  type="text" 
                  placeholder={language === "VN" ? "Nhập tên chủ tài khoản" : "Enter account holder name"}
                  value={bankData.bankAccountHolder} 
                  onChange={(e) => setBankData({ ...bankData, bankAccountHolder: e.target.value })} 
                  suppressHydrationWarning
                />
              </div>
              <Button 
                className="bg-red-600 hover:bg-red-700" 
                disabled={savingBank} 
                onClick={async () => {
                  if (!user?.id) {
                    toast({
                      title: language === "VN" ? "Lỗi" : "Error",
                      description: language === "VN" ? "Không tìm thấy người dùng" : "User not found",
                      variant: "destructive",
                    })
                    return
                  }
                  try {
                    setSavingBank(true)
                    await usersAPI.update(user.id, {
                      bankName: bankData.bankName,
                      bankAccountNumber: bankData.bankAccountNumber,
                      bankAccountHolder: bankData.bankAccountHolder,
                    })
                    toast({
                      title: language === "VN" ? "Thành công" : "Success",
                      description: language === "VN" ? "Đã lưu thông tin tài khoản ngân hàng thành công!" : "Bank account information saved successfully!",
                    })
                    if (refetch) {
                      await refetch()
                    }
                  } catch (error: any) {
                    toast({
                      title: language === "VN" ? "Lỗi" : "Error",
                      description: error.response?.data?.message || (language === "VN" ? "Không thể lưu thông tin tài khoản ngân hàng" : "Failed to save bank account information"),
                      variant: "destructive",
                    })
                  } finally {
                    setSavingBank(false)
                  }
                }}
                suppressHydrationWarning
              >
                {savingBank ? (language === "VN" ? "Đang lưu..." : "Saving...") : (language === "VN" ? "Lưu thông tin ngân hàng" : "Save Bank Account")}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-sm mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600" suppressHydrationWarning>{t.dangerZone}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600" suppressHydrationWarning>{t.irreversibleActions}</p>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 bg-transparent" suppressHydrationWarning>
                {t.deleteAccount}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
