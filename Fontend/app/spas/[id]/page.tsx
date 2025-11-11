"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Heart, Star, MapPin, Clock, Phone, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { useSpa } from "@/hooks/use-spa"
import { AuthModal } from "@/components/auth-modal"
import { BookingModal } from "@/components/booking-modal"
import { useUserState } from "@/hooks/use-user-state"
import { getSpaImage } from "@/lib/image-utils"
import { useSpaMedia } from "@/hooks/use-spa-media"

// Dynamically import map to avoid SSR issues
const SpaMapView = dynamic(() => import("@/components/spa-map-view").then((mod) => mod.SpaMapView), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center bg-slate-100 rounded-lg">
      <p className="text-slate-500">Đang tải bản đồ...</p>
    </div>
  ),
})

export default function SpaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const spaId = parseInt(params?.id as string)
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { user } = useUserState()
  const { spa, loading, error } = useSpa(spaId)
  const { backgroundUrl, avatarUrl } = useSpaMedia(spaId)

  const handleBookService = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    setIsBookingOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải thông tin spa...</p>
        </div>
      </div>
    )
  }

  if (error || !spa) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy spa</h2>
          <p className="text-red-600 mb-4">{error || "Lỗi khi tải dữ liệu"}</p>
          <Link href="/spas">
            <Button className="bg-amber-500 hover:bg-amber-600">Quay lại</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Generate spa images based on spa data
  // Use background image from media API if available, otherwise fallback to getSpaImage
  const mainSpaImage = backgroundUrl || getSpaImage(spa)
  const spaImages = [mainSpaImage, mainSpaImage, mainSpaImage] // Using same image for all 3 slots for now

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % spaImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + spaImages.length) % spaImages.length)
  }

  return (
    <main className="min-h-screen bg-white">
      <MainHeader currentPath="/spas" />

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg overflow-hidden mb-8">
          <img
            src={spaImages[currentImageIndex]}
            alt={spa.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.jpg"
            }}
          />
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {spaImages.length}
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-3 bg-white rounded-full shadow-md hover:bg-slate-100 transition"
            >
              <Heart className={`w-6 h-6 ${isFavorite ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
            </button>
            <button className="p-3 bg-white rounded-full shadow-md hover:bg-slate-100 transition">
              <Share2 className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{spa.name}</CardTitle>
                    {spa.description && <p className="text-slate-600 mt-2">{spa.description}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{spa.rating || 5.0}</span>
                  <span className="text-slate-600">({spa.reviewCount || 0} đánh giá)</span>
                </div>

                <div className="space-y-2">
                  {spa.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700">{spa.address}</span>
                    </div>
                  )}
                  {spa.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700">{spa.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">
                      {spa.openingTime && spa.closingTime 
                        ? `${spa.openingTime} - ${spa.closingTime}` 
                        : "10:00 - 22:30"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Dịch vụ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spa.services && spa.services.length > 0 ? (
                    spa.services.map((service: any) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{service.name}</p>
                          {service.durationMinutes && (
                            <p className="text-xs text-slate-500">{service.durationMinutes} phút</p>
                          )}
                          {service.description && (
                            <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-600">
                            {Number(service.price).toLocaleString()} VNĐ
                          </p>
                          <Button
                            size="sm"
                            className="mt-1 bg-amber-500 hover:bg-amber-600"
                            onClick={handleBookService}
                          >
                            Đặt lịch
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600">Không có dịch vụ nào</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card id="feedbacks" className="border-0 shadow-sm scroll-mt-20">
              <CardHeader>
                <CardTitle>Đánh giá khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spa.feedbacks && spa.feedbacks.length > 0 ? (
                  spa.feedbacks.map((feedback: any, i: number) => (
                    <div key={i} className="pb-4 border-b border-slate-200 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(feedback.rating || 5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-slate-700 mb-2">{feedback.comment}</p>
                      <p className="font-semibold text-slate-900">{feedback.customer?.name || "Khách hàng"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">Chưa có đánh giá nào</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Đặt lịch ngay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleBookService}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6"
                >
                  ĐẶT LỊCH NGAY
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Liên hệ
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Địa chỉ</p>
                  <p className="font-medium text-slate-900">{spa.address}</p>
                </div>
                <div>
                  <p className="text-slate-600">Điện thoại</p>
                  <p className="font-medium text-slate-900">{spa.phone}</p>
                </div>
                <div>
                  <p className="text-slate-600">Giờ mở cửa</p>
                  <p className="font-medium text-slate-900">
                    {spa.openingTime && spa.closingTime 
                      ? `${spa.openingTime} - ${spa.closingTime}` 
                      : "10:00 - 22:30"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Map Location */}
            {spa.latitude && spa.longitude && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    Vị trí
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SpaMapView 
                    spas={[spa]} 
                    center={[spa.latitude, spa.longitude]}
                    height="300px" 
                    zoom={15} 
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} redirectAfterLogin={false} />
      
      {user && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          spaId={spaId}
          spaName={spa.name}
          spaPhone={spa.phone}
          spaAddress={spa.address}
          onBookingSuccess={() => {
            window.location.href = "/customer/bookings"
          }}
        />
      )}
      
      <Footer />
    </main>
  )
}

