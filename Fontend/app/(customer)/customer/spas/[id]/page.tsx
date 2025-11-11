"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Star, Clock, Phone, Share2 } from "lucide-react"
import React, { useState } from "react"
import { useSpa } from "@/hooks/use-spa"
import { BookingModal } from "@/components/booking-modal"
import { getSpaImage } from "@/lib/image-utils"
import { useSpaMedia } from "@/hooks/use-spa-media"

export default function SpaDetail({ params }: { params: Promise<{ id: string }> }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const { id } = React.use(params)
  const spaId = Number.parseInt(id)
  const { spa, loading, error } = useSpa(spaId)
  const { backgroundUrl } = useSpaMedia(spaId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải thông tin spa...</p>
        </div>
      </div>
    )
  }

  if (error || !spa) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Không thể tải thông tin spa"}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg overflow-hidden">
        <img
          src={backgroundUrl || getSpaImage(spa)}
          alt={spa.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.jpg"
          }}
        />
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
                  <p className="text-slate-600 mt-2">{spa.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{spa.rating || 0}</span>
                <span className="text-slate-600">({spa.reviewCount || 0} đánh giá)</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">{spa.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">{spa.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">{spa.hours || "10:00 - 22:30"}</span>
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
                        <p className="text-xs text-slate-500">{service.duration}h</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-600">{service.price?.toLocaleString()} VND</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1 bg-transparent"
                          onClick={() => setIsBookingOpen(true)}
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
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Đánh giá khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {spa.reviews && spa.reviews.length > 0 ? (
                spa.reviews.map((review: any, i: number) => (
                  <div key={i} className="pb-4 border-b border-slate-200 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(review.rating || 5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-2">{review.comment}</p>
                    <p className="font-semibold text-slate-900">{review.customerName}</p>
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
                onClick={() => setIsBookingOpen(true)}
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
                <p className="font-medium text-slate-900">{spa.hours || "10:00 - 22:30"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        spaId={spaId}
        spaName={spa.name}
        spaPhone={spa.phone}
        spaAddress={spa.address}
        onBookingSuccess={() => {
          // Refresh bookings or navigate to bookings page
          window.location.href = "/customer/bookings"
        }}
      />
    </div>
  )
}
