"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/terms-of-use" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Điều khoản sử dụng</h1>
            <p className="text-lg text-slate-600">
              Quy định và điều khoản khi sử dụng dịch vụ BeautyHub
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Điều khoản chung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Bằng việc sử dụng dịch vụ BeautyHub, bạn đồng ý với các điều khoản sau:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Bạn phải từ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Thông tin bạn cung cấp phải chính xác và đầy đủ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Bạn chịu trách nhiệm bảo mật tài khoản của mình</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Quy định sử dụng dịch vụ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-slate-600">
                  <div>
                    <p className="font-semibold mb-2">Bạn không được:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Sử dụng dịch vụ cho mục đích bất hợp pháp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Đăng tải nội dung vi phạm pháp luật hoặc đạo đức</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Cố gắng hack hoặc phá hoại hệ thống</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Giả mạo danh tính hoặc thông tin cá nhân</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trách nhiệm và giới hạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-600">
                <p>• BeautyHub là nền tảng kết nối giữa khách hàng và spa. Chúng tôi không chịu trách nhiệm về chất lượng dịch vụ của spa</p>
                <p>• BeautyHub không chịu trách nhiệm về các tranh chấp phát sinh giữa khách hàng và spa</p>
                <p>• Chúng tôi có quyền từ chối hoặc chấm dứt dịch vụ đối với tài khoản vi phạm điều khoản</p>
                <p>• BeautyHub bảo lưu quyền thay đổi điều khoản sử dụng mà không cần thông báo trước</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liên hệ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ: <a href="mailto:legal@beautyhub.vn" className="text-amber-500 hover:underline">legal@beautyhub.vn</a>
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

