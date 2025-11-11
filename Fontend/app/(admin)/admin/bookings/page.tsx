"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminBookings } from "@/hooks/use-admin-bookings"
import { Calendar, User, DollarSign, Scissors } from "lucide-react"

export default function AdminBookings() {
  const { bookings, loading } = useAdminBookings()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý Booking</h1>
        <p className="mt-2 text-slate-600">Theo dõi tất cả booking trong hệ thống</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Đã hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === "COMPLETED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Đã xác nhận</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {bookings.filter(b => b.status === "CONFIRMED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Đã hủy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {bookings.filter(b => b.status === "CANCELLED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả Bookings</CardTitle>
          <CardDescription>{bookings.length} booking trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có booking nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Spa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Dịch vụ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Nhân viên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày hẹn</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Giá</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">#{booking.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{booking.customer?.name || "N/A"}</p>
                            <p className="text-xs text-slate-500">{booking.customer?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">{booking.spa?.name || `Spa #${booking.spa?.id}`}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-900">{booking.service?.name || `Service #${booking.service?.id}`}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {booking.staff?.name || "Chưa chỉ định"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-slate-900">
                              {new Date(booking.scheduledAt).toLocaleDateString("vi-VN")}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(booking.scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{new Intl.NumberFormat('vi-VN').format(Number(booking.finalPrice))} VND</p>
                            {booking.couponCode && (
                              <p className="text-xs text-green-600">Mã: {booking.couponCode}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
