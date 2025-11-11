"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Handshake, Percent, Shield, FileText, CheckCircle } from "lucide-react"

export default function PartnerTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/partner-terms" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Điều khoản đối tác</h1>
            <p className="text-lg text-slate-600">
              Quy định và điều khoản dành cho các đối tác spa trên BeautyHub
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-amber-500" />
                  Điều kiện trở thành đối tác
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Có giấy phép kinh doanh hợp lệ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Đáp ứng các tiêu chuẩn về chất lượng dịch vụ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Cam kết cung cấp dịch vụ đúng như mô tả</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Tuân thủ các quy định về vệ sinh và an toàn</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-amber-500" />
                  Phí và hoa hồng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  BeautyHub áp dụng mô hình hoa hồng dựa trên doanh thu:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li>• Hoa hồng: 15% trên mỗi đơn đặt lịch thành công</li>
                  <li>• Thanh toán: Định kỳ hàng tháng</li>
                  <li>• Không có phí đăng ký hoặc phí ẩn</li>
                  <li>• Phí chỉ được tính khi khách hàng hoàn thành dịch vụ</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  Trách nhiệm của đối tác
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Cung cấp thông tin chính xác về spa và dịch vụ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Xác nhận hoặc từ chối đặt lịch trong vòng 24 giờ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Đảm bảo chất lượng dịch vụ đúng như cam kết</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Xử lý khiếu nại của khách hàng một cách công bằng</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Quyền lợi của đối tác
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Tiếp cận với hàng ngàn khách hàng tiềm năng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Quản lý lịch hẹn và khách hàng dễ dàng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Hỗ trợ marketing và quảng bá dịch vụ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Báo cáo doanh thu và thống kê chi tiết</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liên hệ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Để trở thành đối tác hoặc có thắc mắc, vui lòng liên hệ: <a href="mailto:partners@beautyhub.vn" className="text-amber-500 hover:underline">partners@beautyhub.vn</a>
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

