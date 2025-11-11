"use client"

import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Heart, TrendingUp } from "lucide-react"

export default function RecruitmentPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/recruitment" />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Tuyển dụng</h1>
            <p className="text-lg text-slate-600">
              Tham gia đội ngũ MOGGO và cùng chúng tôi xây dựng tương lai của ngành làm đẹp
            </p>
          </div>

          <div className="space-y-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  Tại sao chọn MOGGO?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Môi trường làm việc chuyên nghiệp</h3>
                      <p className="text-slate-600 text-sm">
                        Làm việc trong môi trường năng động, sáng tạo với đội ngũ trẻ trung, nhiệt huyết
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Cơ hội phát triển</h3>
                      <p className="text-slate-600 text-sm">
                        Nhiều cơ hội học hỏi và thăng tiến trong sự nghiệp
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Chế độ đãi ngộ tốt</h3>
                      <p className="text-slate-600 text-sm">
                        Lương thưởng cạnh tranh, bảo hiểm đầy đủ và các phúc lợi hấp dẫn
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vị trí đang tuyển dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Frontend Developer</h3>
                    <p className="text-slate-600 text-sm mb-2">Yêu cầu: React, Next.js, TypeScript</p>
                    <p className="text-slate-500 text-xs">Hà Nội / Hồ Chí Minh</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Backend Developer</h3>
                    <p className="text-slate-600 text-sm mb-2">Yêu cầu: Node.js, NestJS, PostgreSQL</p>
                    <p className="text-slate-500 text-xs">Hà Nội / Hồ Chí Minh</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">UI/UX Designer</h3>
                    <p className="text-slate-600 text-sm mb-2">Yêu cầu: Figma, Design System</p>
                    <p className="text-slate-500 text-xs">Hà Nội / Hồ Chí Minh</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nộp đơn ứng tuyển</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Gửi CV và thư xin việc đến email: <a href="mailto:hr@beautyhub.vn" className="text-amber-500 hover:underline">hr@beautyhub.vn</a>
                </p>
                <p className="text-slate-600">
                  Hoặc liên hệ trực tiếp: <a href="tel:0906129223" className="text-amber-500 hover:underline">0906129223</a>
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

