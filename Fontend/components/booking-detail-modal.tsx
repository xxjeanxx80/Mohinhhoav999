"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { User, Phone, MapPin, Calendar, Clock, DollarSign, Building2, Wrench, UserCircle } from "lucide-react"

interface BookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: number
}

export function BookingDetailModal({ isOpen, onClose, bookingId }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetail()
    }
  }, [isOpen, bookingId])

  const fetchBookingDetail = async () => {
    setLoading(true)
    try {
      const res = await ownerAPI.getBookingDetail(bookingId)
      setBooking(res.data?.data || res.data)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tải thông tin booking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || ""
    switch (normalizedStatus) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || ""
    switch (normalizedStatus) {
      case "CONFIRMED":
        return "Đã xác nhận"
      case "PENDING":
        return "Chờ xử lý"
      case "COMPLETED":
        return "Hoàn thành"
      case "CANCELLED":
        return "Đã hủy"
      default:
        return status
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Booking #{bookingId}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về booking và khách hàng
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
              <p className="text-slate-600">Đang tải...</p>
            </div>
          </div>
        ) : booking ? (
          <div className="space-y-4">
            {/* Booking Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Trạng thái</CardTitle>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-red-600" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Họ tên</p>
                    <p className="font-medium text-slate-900">
                      {booking.customer?.name || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Số điện thoại</p>
                    <p className="font-medium text-slate-900">
                      {booking.customer?.phone || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Địa chỉ</p>
                    <p className="font-medium text-slate-900">
                      {booking.customer?.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-900">
                      {booking.customer?.email || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  Thông tin booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Spa</p>
                    <p className="font-medium text-slate-900">
                      {booking.spa?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Dịch vụ</p>
                    <p className="font-medium text-slate-900">
                      {booking.service?.name || "N/A"}
                    </p>
                    {booking.service?.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {booking.service.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Thời gian đặt lịch</p>
                    <p className="font-medium text-slate-900">
                      {new Date(booking.scheduledAt).toLocaleString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {booking.staff && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Nhân viên</p>
                      <p className="font-medium text-slate-900">
                        {booking.staff.name}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  Thông tin thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Giá gốc</p>
                  <p className="font-medium text-slate-900">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(booking.totalPrice || 0)}
                  </p>
                </div>
                {booking.couponCode && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Mã giảm giá</p>
                    <p className="font-medium text-slate-900">
                      {booking.couponCode}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Thành tiền</p>
                  <p className="font-bold text-lg text-red-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(booking.finalPrice || booking.totalPrice || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>Không tìm thấy thông tin booking</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

