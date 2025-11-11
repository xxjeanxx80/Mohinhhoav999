"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MapPin, Star, Search, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { getSpaImage } from "@/lib/image-utils"
import { SpaAvatar } from "@/components/spa-avatar"

export default function CustomerSpas() {
  const [selectedService, setSelectedService] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const spas = [
    {
      id: 1,
      name: "Aki Beauty Spa",
      address: "301 Đội Cấn - Liễu Giai - Ba Đình, Hanoi, Vietnam",
      phone: "SDT 096 790 0530",
      rating: 5.0,
      reviews: 0,
      hours: "10:00 - 22:30",
      image: "aki-beauty-spa",
      services: ["Massage Việt Nam", "Massage Shiatsu", "Massage Thái"],
    },
    {
      id: 2,
      name: "La Maison Spa - Wellness & Therapy",
      address: "L1H01L, đô Lạc, 35-37 Hàng Tông, Hoàn Kiếm...",
      rating: 5.0,
      reviews: 1,
      image: "la-maison-spa",
      services: ["Chăm sóc da", "Massage"],
    },
    {
      id: 3,
      name: "TOYO Beauty",
      address: "36 Nguyễn Hữu Huân, quận Hoàn Kiếm, Hà Nội",
      rating: 5.0,
      reviews: 1,
      image: "toyo-beauty",
      services: ["Làm móng", "Chăm sóc da"],
    },
    {
      id: 4,
      name: "MACON Beauty & Spa",
      address: "38 Cương Văn Minh, phường Đội Cấn, quận Ba Đình, Hà Nội",
      rating: 4.5,
      reviews: 1,
      image: "macon-spa",
      services: ["Massage", "Chăm sóc da"],
    },
    {
      id: 5,
      name: "Amadora Wellness & Spa",
      address: "102 F, Hàn Hải Đức, Bùi Thị Xuân, Hà Nội",
      rating: 4.3,
      reviews: 0,
      image: "amadora-spa",
      services: ["Massage", "Trị liệu"],
    },
    {
      id: 6,
      name: "EM - Spa Làm đẹp Dưỡng lành",
      address: "50 Nội ngõ 7 Thái Hà, Đống Đa, Hà Nội",
      rating: 4.0,
      reviews: 2,
      image: "em-spa",
      services: ["Chăm sóc da", "Massage"],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Có 10 spa gần bạn</h1>
        <p className="mt-2 text-slate-600">Tìm kiếm và đặt lịch từ mạng lưới spa cao cấp của chúng tôi</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tất cả dịch vụ</label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="massage">Massage</SelectItem>
                <SelectItem value="skincare">Chăm sóc da</SelectItem>
                <SelectItem value="nails">Làm móng</SelectItem>
                <SelectItem value="therapy">Trị liệu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tất cả địa điểm</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hanoi">Hà Nội</SelectItem>
                <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                <SelectItem value="danang">Đà Nẵng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Nhập tên spa..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spa Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {spas.map((spa) => (
          <Card key={spa.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0">
            {/* Spa Avatar Header */}
            <div className="relative h-32 md:h-40 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center group">
              <SpaAvatar spaId={spa.id} spaName={spa.name} size="md" />
              <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-slate-100 transition">
                <Heart className="w-5 h-5 text-slate-400 hover:text-amber-500" />
              </button>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{spa.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-600">{spa.address}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-900">{spa.rating}</span>
                  <span className="text-xs text-slate-500">({spa.reviews} đánh giá)</span>
                </div>
              </div>

              {spa.hours && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{spa.hours}</span>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {spa.services.slice(0, 2).map((service, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    {service}
                  </span>
                ))}
              </div>

              <Link href={`/customer/spas/${spa.id}`} className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700">Xem chi tiết</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
