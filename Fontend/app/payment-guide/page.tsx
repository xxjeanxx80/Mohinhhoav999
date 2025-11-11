"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Wallet, Smartphone, CheckCircle } from "lucide-react"

export default function PaymentGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/payment-guide" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Hướng dẫn thanh toán</h1>
            <p className="text-lg text-slate-600">
              Các phương thức thanh toán được hỗ trợ trên BeautyHub
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  Thanh toán khi nhận dịch vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Bạn có thể thanh toán trực tiếp tại spa sau khi sử dụng dịch vụ. Đây là phương thức thanh toán phổ biến và tiện lợi nhất.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Thanh toán bằng tiền mặt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Thanh toán bằng thẻ ngân hàng (nếu spa hỗ trợ)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-500" />
                  Thanh toán qua ví điện tử
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Một số spa có thể hỗ trợ thanh toán qua các ví điện tử phổ biến như:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>MoMo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>ZaloPay</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>VNPay</span>
                  </li>
                </ul>
                <p className="text-slate-500 text-sm mt-4">
                  * Vui lòng liên hệ trực tiếp với spa để xác nhận phương thức thanh toán được hỗ trợ.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  Lưu ý quan trọng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>• Thanh toán sẽ được thực hiện tại spa sau khi bạn sử dụng dịch vụ</p>
                <p>• Nếu bạn sử dụng voucher hoặc coupon, vui lòng trình mã giảm giá khi thanh toán</p>
                <p>• Giá cuối cùng có thể khác với giá hiển thị nếu bạn áp dụng mã giảm giá</p>
                <p>• Nếu có bất kỳ thắc mắc nào về thanh toán, vui lòng liên hệ với spa trước khi đến</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

