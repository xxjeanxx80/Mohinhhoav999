"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, XCircle } from "lucide-react"

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/cancellation-policy" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Chính sách hủy lịch</h1>
            <p className="text-lg text-slate-600">
              Quy định về việc hủy đặt lịch trên BeautyHub
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Hủy lịch trước 24 giờ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Bạn có thể hủy đặt lịch miễn phí nếu thông báo trước ít nhất 24 giờ so với thời gian đã đặt. 
                  Việc hủy lịch có thể được thực hiện trực tiếp trên website hoặc ứng dụng.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Hủy lịch trong vòng 24 giờ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Nếu bạn hủy lịch trong vòng 24 giờ trước thời gian đã đặt, có thể áp dụng một số quy định sau:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li>• Một số spa có thể yêu cầu phí hủy lịch</li>
                  <li>• Vui lòng liên hệ trực tiếp với spa để được hỗ trợ</li>
                  <li>• Trong trường hợp khẩn cấp, spa có thể xem xét miễn phí hủy lịch</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Không đến đúng giờ hẹn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Nếu bạn không đến đúng giờ hẹn mà không thông báo trước, spa có quyền hủy lịch hẹn của bạn. 
                  Trong một số trường hợp, bạn có thể bị tính phí hủy lịch hoặc không được hoàn tiền (nếu đã thanh toán trước).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lưu ý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>• Mỗi spa có thể có chính sách hủy lịch riêng, vui lòng kiểm tra thông tin chi tiết khi đặt lịch</p>
                <p>• Nếu có thay đổi về thời gian, bạn có thể sử dụng tính năng "Dời lịch" thay vì hủy</p>
                <p>• Để được hỗ trợ tốt nhất, vui lòng liên hệ với spa trực tiếp qua số điện thoại hoặc email</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

