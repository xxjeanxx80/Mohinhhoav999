"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { User, Store } from "lucide-react"
import { setUseDirectURL } from "@/lib/api-config"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectAfterLogin?: boolean // If false, stay on current page
}

export function AuthModal({ open, onOpenChange, redirectAfterLogin = true }: AuthModalProps) {
  const router = useRouter()
  const { login, register, loading, error } = useAuth()
  const { toast } = useToast()
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(loginForm)
    if (result.success) {
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng bạn trở lại!`,
      })
      onOpenChange(false)
      
      // Only redirect if redirectAfterLogin is true
      if (redirectAfterLogin) {
        if (result.role === "ADMIN") {
          router.push("/admin")
        } else if (result.role === "OWNER") {
          router.push("/owner")
        } else {
          router.push("/customer")
        }
      }
      
      router.refresh()
    } else {
      toast({
        title: "Đăng nhập thất bại",
        description: result.error || "Email hoặc mật khẩu không đúng",
        variant: "destructive",
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await register(registerForm)
    if (result.success) {
      toast({
        title: "Đăng ký thành công",
        description: registerForm.role === "OWNER" 
          ? "Vui lòng đăng ký spa và chờ admin phê duyệt" 
          : "Chào mừng bạn đến với BeautyHub!",
      })
      onOpenChange(false)
      
      // Only redirect if redirectAfterLogin is true
      if (redirectAfterLogin) {
        if (registerForm.role === "OWNER") {
          router.push("/owner")
        } else {
          router.push("/customer")
        }
      }
      
      router.refresh()
    } else {
      toast({
        title: "Đăng ký thất bại",
        description: result.error || "Có lỗi xảy ra khi đăng ký",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chào mừng đến BeautyHub</DialogTitle>
          <DialogDescription>Đăng nhập hoặc tạo tài khoản để tiếp tục</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                    {error.includes("Không thể kết nối") && (
                      <div className="mt-2 text-xs space-y-2">
                        <p>💡 Gợi ý:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Kiểm tra backend có đang chạy trên localhost:3000</li>
                          <li>Tắt ad blocker hoặc extension chặn request</li>
                          <li>Kiểm tra console để xem chi tiết lỗi</li>
                        </ul>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setUseDirectURL(true)
                            toast({
                              title: "Đã chuyển sang kết nối trực tiếp",
                              description: "Đang reload trang...",
                            })
                            setTimeout(() => window.location.reload(), 500)
                          }}
                          className="mt-2 w-full text-xs"
                        >
                          🔄 Thử kết nối trực tiếp (Bypass proxy)
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                    {error.includes("Không thể kết nối") && (
                      <div className="mt-2 text-xs space-y-2">
                        <p>💡 Gợi ý:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Kiểm tra backend có đang chạy trên localhost:3000</li>
                          <li>Tắt ad blocker hoặc extension chặn request</li>
                          <li>Kiểm tra console để xem chi tiết lỗi</li>
                        </ul>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setUseDirectURL(true)
                            toast({
                              title: "Đã chuyển sang kết nối trực tiếp",
                              description: "Đang reload trang...",
                            })
                            setTimeout(() => window.location.reload(), 500)
                          }}
                          className="mt-2 w-full text-xs"
                        >
                          🔄 Thử kết nối trực tiếp (Bypass proxy)
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="register-name">Họ và tên</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="example@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Mật khẩu</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-role">Loại tài khoản</Label>
                <Select
                  value={registerForm.role}
                  onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}
                >
                  <SelectTrigger id="register-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Khách hàng</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OWNER">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>Chủ Spa</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {registerForm.role === "OWNER" 
                    ? "Sau khi đăng ký, bạn cần đăng ký spa và chờ admin phê duyệt"
                    : "Tài khoản khách hàng để đặt lịch dịch vụ"}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

