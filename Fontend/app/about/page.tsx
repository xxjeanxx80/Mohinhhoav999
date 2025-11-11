"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Sparkles, Users, Calendar, Shield, Heart, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function AboutPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-slate-50">
      <MainHeader currentPath="/about" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-amber-600 text-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6" suppressHydrationWarning>{t.aboutMOGGO}</h1>
          <p className="text-xl text-red-100 mb-8" suppressHydrationWarning>
            {t.aboutDescription}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4" suppressHydrationWarning>{t.ourMission}</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              MOGGO được tạo ra với mong muốn mang đến trải nghiệm đặt lịch spa dễ dàng, 
              tiện lợi và đáng tin cậy cho mọi người. Chúng tôi kết nối khách hàng với những 
              spa chất lượng cao, giúp bạn tìm được dịch vụ phù hợp nhất với nhu cầu của mình.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Dễ dàng đặt lịch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Đặt lịch chỉ với vài cú click, không cần gọi điện hay chờ đợi. 
                  Xem lịch trống, chọn thời gian phù hợp và xác nhận ngay.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle>Đáng tin cậy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Tất cả spa trên nền tảng đều được xác minh và kiểm duyệt kỹ lưỡng. 
                  Đánh giá từ khách hàng thật giúp bạn đưa ra quyết định đúng đắn.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle>Chăm sóc khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn mọi lúc. 
                  Từ đặt lịch đến giải quyết vấn đề, chúng tôi luôn ở đây.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tính năng nổi bật</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Đặt lịch trực tuyến</h3>
                <p className="text-slate-600">
                  Xem lịch trống của spa, chọn thời gian và nhân viên phù hợp. 
                  Nhận thông báo xác nhận ngay lập tức.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Đánh giá và phản hồi</h3>
                <p className="text-slate-600">
                  Chia sẻ trải nghiệm của bạn và đọc đánh giá từ khách hàng khác. 
                  Giúp cộng đồng tìm được spa tốt nhất.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Tìm spa gần bạn</h3>
                <p className="text-slate-600">
                  Sử dụng định vị để tìm spa gần nhất. 
                  Xem khoảng cách, đánh giá và dịch vụ có sẵn.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Chương trình ưu đãi</h3>
                <p className="text-slate-600">
                  Nhận voucher, coupon và ưu đãi độc quyền từ các spa đối tác. 
                  Tiết kiệm với mỗi lần đặt lịch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl text-red-100 mb-8">
            Khám phá những spa tốt nhất và đặt lịch ngay hôm nay
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/spas">
              <Button size="lg" className="bg-white text-red-600 hover:bg-slate-100">
                Khám phá Spa
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-red-700">
                Đọc Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

