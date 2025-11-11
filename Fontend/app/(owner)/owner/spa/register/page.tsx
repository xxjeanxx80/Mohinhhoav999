"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { spasAPI, ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Clock, Mail, MapPin, Phone, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RegisterSpaPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    openingTime: "08:00:00",
    closingTime: "22:00:00",
  })
  const [loading, setLoading] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [alreadyHasSpa, setAlreadyHasSpa] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Check if owner already has a spa
  useEffect(() => {
    const checkExistingSpa = async () => {
      try {
        const res = await ownerAPI.getMySpas()
        const spas = res.data?.data || res.data || []
        if (Array.isArray(spas) && spas.length > 0) {
          setAlreadyHasSpa(true)
          // Redirect về owner page (sẽ hiện màn chờ phê duyệt)
          setTimeout(() => {
            window.location.href = "/owner"
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking existing spa:", error)
      } finally {
        setCheckingExisting(false)
      }
    }
    checkExistingSpa()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên spa",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await spasAPI.create(formData)
      console.log("✅ Spa created:", response)

      toast({
        title: "Thành công",
        description: "Đã đăng ký spa thành công! Vui lòng chờ admin phê duyệt.",
      })

      // Force reload để layout check lại spa status
      setTimeout(() => {
        window.location.href = "/owner"
      }, 1500)
    } catch (error: any) {
      console.error("❌ Register spa error:", error)
      console.error("Error response:", error.response?.data)
      
      toast({
        title: "Lỗi", 
        description: error.response?.data?.message || "Đăng ký spa thất bại",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  // Show loading while checking
  if (checkingExisting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking spa status...</p>
        </div>
      </div>
    )
  }

  // Show message if already has spa
  if (alreadyHasSpa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle>Spa đã được đăng ký</CardTitle>
            <CardDescription>
              Bạn đã đăng ký spa rồi. Đang chuyển hướng...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/owner">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Đăng ký Spa mới</h1>
          <p className="mt-2 text-slate-600">Điền thông tin để đăng ký spa của bạn</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            Thông tin Spa
          </CardTitle>
          <CardDescription>
            Spa sẽ được gửi đến admin để phê duyệt sau khi đăng ký
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên Spa */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên Spa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Beauty Spa & Wellness"
                required
              />
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả về spa của bạn..."
                rows={4}
              />
            </div>

            {/* Địa chỉ */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa chỉ
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="spa@email.com"
                  type="email"
                />
              </div>
            </div>

            {/* Opening & Closing Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Giờ mở cửa
                </Label>
                <Input
                  id="openingTime"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  type="time"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Giờ đóng cửa
                </Label>
                <Input
                  id="closingTime"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  type="time"
                  step="1"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📝 Lưu ý</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Spa sẽ được gửi đến admin để phê duyệt</li>
                <li>• Sau khi được phê duyệt, spa sẽ hiển thị công khai</li>
                <li>• Bạn có thể chỉnh sửa thông tin spa sau khi đăng ký</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Link href="/owner">
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký Spa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

