"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import { usersAPI } from "@/lib/api-service"

export default function OwnerProfile() {
  const { user, loading: userLoading, refetch } = useUser()
  const { toast } = useToast()
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
        title: "Success",
        description: "Profile updated successfully",
      })
      
      // Refetch user data to update UI immediately
      if (refetch) {
        await refetch()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
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
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
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
        title: "Success",
        description: "Password changed successfully",
      })
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
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
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must not exceed 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingAvatar(true)
      await usersAPI.uploadAvatar(user.id, file)
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
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
        title: "Error",
        description: error.response?.data?.message || "Failed to upload avatar",
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600">Please log in</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Profile</h1>
        <p className="mt-2 text-slate-600">Manage your personal information</p>
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
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() || "O"}
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
              <p className="font-semibold text-slate-900 mb-4">{formData.name || user.name || "No name"}</p>
              <p className="text-sm text-slate-500 mb-4">{user.email}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading..." : "Change Avatar"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <Input 
                  name="currentPassword"
                  placeholder="Current Password" 
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
                <Input 
                  name="newPassword"
                  placeholder="New Password" 
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
                <Input 
                  name="confirmPassword"
                  placeholder="Confirm Password" 
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
                <Button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <div className="md:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Email <span className="text-slate-500 text-xs">(Cannot be changed)</span>
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
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Phone</label>
                  <Input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="Enter your phone number"
                    type="tel"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Address</label>
                  <Input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="Enter your address"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update Profile"}
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
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Bank Account Information */}
          <Card className="border-0 shadow-sm mt-6">
            <CardHeader>
              <CardTitle>Bank Account Information</CardTitle>
              <CardDescription>Link your bank account for payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Bank Name</label>
                <Input 
                  type="text" 
                  placeholder="e.g., Vietcombank, Techcombank"
                  value={bankData.bankName} 
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Account Number</label>
                <Input 
                  type="text" 
                  placeholder="Enter your bank account number"
                  value={bankData.bankAccountNumber} 
                  onChange={(e) => setBankData({ ...bankData, bankAccountNumber: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Account Holder Name</label>
                <Input 
                  type="text" 
                  placeholder="Enter account holder name"
                  value={bankData.bankAccountHolder} 
                  onChange={(e) => setBankData({ ...bankData, bankAccountHolder: e.target.value })} 
                />
              </div>
              <Button 
                className="bg-red-600 hover:bg-red-700" 
                disabled={savingBank} 
                onClick={async () => {
                  if (!user?.id) {
                    toast({
                      title: "Error",
                      description: "User not found",
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
                      title: "Success",
                      description: "Bank account information saved successfully!",
                    })
                    if (refetch) {
                      await refetch()
                    }
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.response?.data?.message || "Failed to save bank account information",
                      variant: "destructive",
                    })
                  } finally {
                    setSavingBank(false)
                  }
                }}
              >
                {savingBank ? "Saving..." : "Save Bank Account"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-sm mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">Irreversible actions. Please be careful.</p>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 bg-transparent">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

