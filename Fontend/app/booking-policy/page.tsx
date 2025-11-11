"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, CheckCircle } from "lucide-react"

export default function BookingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/booking-policy" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Chính sách đặt lịch</h1>
            <p className="text-lg text-slate-600">
              Quy định và hướng dẫn đặt lịch trên BeautyHub
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Quy trình đặt lịch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-slate-600 list-decimal list-inside">
                  <li>Tìm kiếm spa và dịch vụ bạn muốn sử dụng</li>
                  <li>Chọn thời gian phù hợp từ lịch trống của spa</li>
                  <li>Chọn nhân viên (nếu có yêu cầu)</li>
                  <li>Áp dụng mã giảm giá nếu có (tùy chọn)</li>
                  <li>Xác nhận đặt lịch</li>
                  <li>Nhận thông báo xác nhận qua email hoặc SMS</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Thời gian đặt lịch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Bạn có thể đặt lịch trước tối đa 30 ngày</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Đặt lịch trước ít nhất 2 giờ so với thời gian mong muốn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Một số spa có thể có quy định riêng về thời gian đặt lịch tối thiểu</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Quyền và trách nhiệm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-slate-600">
                  <div>
                    <p className="font-semibold mb-2">Khách hàng:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Đến đúng giờ hẹn hoặc thông báo trước nếu muốn thay đổi</li>
                      <li>• Cung cấp thông tin chính xác khi đặt lịch</li>
                      <li>• Thanh toán đúng số tiền đã thỏa thuận</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Spa:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Cung cấp dịch vụ đúng như đã cam kết</li>
                      <li>• Thông báo kịp thời nếu có thay đổi về lịch hẹn</li>
                      <li>• Đảm bảo chất lượng dịch vụ và vệ sinh</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý quan trọng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>• Đặt lịch thành công không có nghĩa là lịch hẹn đã được xác nhận. Spa sẽ xác nhận lại với bạn</p>
                <p>• Nếu spa không xác nhận trong vòng 24 giờ, vui lòng liên hệ trực tiếp với spa</p>
                <p>• Bạn có thể dời lịch hoặc hủy lịch trước 24 giờ mà không bị tính phí (tùy theo chính sách của spa)</p>
                <p>• Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với spa hoặc bộ phận hỗ trợ của BeautyHub</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

