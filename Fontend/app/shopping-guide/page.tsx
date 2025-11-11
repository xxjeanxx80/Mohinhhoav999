"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Search, Calendar, CheckCircle } from "lucide-react"

export default function ShoppingGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/shopping-guide" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Hướng dẫn mua hàng</h1>
            <p className="text-lg text-slate-600">
              Hướng dẫn chi tiết cách đặt lịch và sử dụng dịch vụ trên MOGGO
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-500" />
                  Bước 1: Tìm kiếm spa và dịch vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Sử dụng thanh tìm kiếm hoặc duyệt danh sách spa để tìm dịch vụ bạn muốn. Bạn có thể:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Tìm kiếm theo tên spa hoặc địa chỉ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Lọc theo loại dịch vụ (massage, chăm sóc da, làm móng...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Tìm spa gần bạn bằng tính năng định vị</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  Bước 2: Xem chi tiết dịch vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Click vào spa để xem thông tin chi tiết:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Danh sách dịch vụ và giá cả</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Đánh giá từ khách hàng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Thông tin liên hệ và địa chỉ</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Bước 3: Đặt lịch hẹn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-slate-600 list-decimal list-inside">
                  <li>Chọn dịch vụ bạn muốn sử dụng</li>
                  <li>Chọn thời gian phù hợp từ lịch trống</li>
                  <li>Chọn nhân viên (nếu có yêu cầu)</li>
                  <li>Nhập mã giảm giá nếu có (tùy chọn)</li>
                  <li>Xác nhận đặt lịch</li>
                  <li>Nhận thông báo xác nhận qua email hoặc SMS</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý quan trọng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>• Đặt lịch thành công không có nghĩa là lịch hẹn đã được xác nhận. Spa sẽ xác nhận lại với bạn trong vòng 24 giờ</p>
                <p>• Nếu bạn chưa đăng nhập, hệ thống sẽ yêu cầu đăng nhập trước khi đặt lịch</p>
                <p>• Bạn có thể xem và quản lý tất cả các lịch hẹn của mình trong mục "Đặt lịch của bạn"</p>
                <p>• Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ trực tiếp với spa hoặc bộ phận hỗ trợ của BeautyHub</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

