"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, DollarSign, AlertTriangle } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/refund-policy" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Chính sách hoàn tiền</h1>
            <p className="text-lg text-slate-600">
              Quy định về việc hoàn tiền trên BeautyHub
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  Nguyên tắc hoàn tiền
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  BeautyHub hoạt động theo mô hình thanh toán tại spa sau khi sử dụng dịch vụ. 
                  Do đó, việc hoàn tiền sẽ được xử lý trực tiếp bởi spa nơi bạn đã đặt lịch.
                </p>
                <p className="text-slate-600">
                  Nếu bạn đã thanh toán trước và cần hoàn tiền, vui lòng liên hệ trực tiếp với spa để được hỗ trợ.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                  Trường hợp được hoàn tiền
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Spa hủy lịch hẹn của bạn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Dịch vụ không đúng như mô tả hoặc không đạt chất lượng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Bạn hủy lịch đúng theo chính sách của spa (thường là trước 24 giờ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Các trường hợp bất khả kháng được spa chấp nhận</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Thời gian xử lý hoàn tiền
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Thời gian xử lý hoàn tiền phụ thuộc vào phương thức thanh toán ban đầu và chính sách của spa:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li>• Thanh toán bằng tiền mặt: Hoàn tiền ngay tại spa</li>
                  <li>• Thanh toán bằng thẻ: 3-5 ngày làm việc</li>
                  <li>• Thanh toán qua ví điện tử: 1-3 ngày làm việc</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>• Mỗi spa có chính sách hoàn tiền riêng, vui lòng tham khảo trước khi đặt lịch</p>
                <p>• Nếu có tranh chấp về hoàn tiền, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của BeautyHub</p>
                <p>• BeautyHub sẽ hỗ trợ bạn trong việc giải quyết các vấn đề liên quan đến hoàn tiền</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

