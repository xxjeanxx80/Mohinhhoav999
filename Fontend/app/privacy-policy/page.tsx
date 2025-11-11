"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, FileText, CheckCircle } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/privacy-policy" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Chính sách bảo mật</h1>
            <p className="text-lg text-slate-600">
              Cam kết bảo vệ thông tin cá nhân của khách hàng
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  Thông tin chúng tôi thu thập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  BeautyHub thu thập các thông tin sau để cung cấp dịch vụ tốt nhất cho bạn:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Thông tin cá nhân: Họ tên, email, số điện thoại, địa chỉ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Thông tin đặt lịch: Lịch sử đặt lịch, dịch vụ đã sử dụng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Thông tin thanh toán: Phương thức thanh toán (được mã hóa)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-500" />
                  Cách chúng tôi sử dụng thông tin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Cung cấp và quản lý dịch vụ đặt lịch</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Gửi thông báo về lịch hẹn và cập nhật dịch vụ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Gửi thông tin khuyến mãi và ưu đãi (nếu bạn đồng ý)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" />
                  Bảo mật thông tin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  BeautyHub cam kết bảo vệ thông tin của bạn bằng các biện pháp:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li>• Mã hóa dữ liệu trong quá trình truyền tải</li>
                  <li>• Lưu trữ thông tin trên hệ thống bảo mật cao</li>
                  <li>• Chỉ chia sẻ thông tin với spa khi bạn đặt lịch</li>
                  <li>• Không bán hoặc cho thuê thông tin cá nhân cho bên thứ ba</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Quyền của khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Bạn có quyền:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li>• Truy cập và chỉnh sửa thông tin cá nhân</li>
                  <li>• Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                  <li>• Từ chối nhận email marketing</li>
                  <li>• Khiếu nại về việc sử dụng thông tin không đúng mục đích</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liên hệ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ: <a href="mailto:privacy@beautyhub.vn" className="text-amber-500 hover:underline">privacy@beautyhub.vn</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

