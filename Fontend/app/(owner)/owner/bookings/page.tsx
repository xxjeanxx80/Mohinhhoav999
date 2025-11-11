"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOwnerBookings } from "@/hooks/use-owner-bookings"
import { BookingDetailModal } from "@/components/booking-detail-modal"
import { Check, X, CheckCircle, Eye } from "lucide-react"

export default function OwnerBookings() {
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase()
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
    const normalizedStatus = status.toUpperCase()
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

  const { bookings, loading, updating, acceptBooking, rejectBooking, completeBooking } = useOwnerBookings()
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bookings</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600">Manage all customer bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>{loading ? "Loading..." : `${bookings.length} bookings`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Customer</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap hidden md:table-cell">Service</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Date & Time</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap hidden lg:table-cell">Price</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-900">
                      <div className="truncate max-w-[120px] sm:max-w-none">{b.customer?.name || b.customer?.email || b.customerId}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                      <div className="truncate max-w-[150px]">{b.service?.name || b.serviceId}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                      <div className="truncate">{new Date(b.scheduledAt).toLocaleString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 hidden lg:table-cell whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN').format(b.finalPrice ?? b.totalPrice ?? 0)} VND
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                      <Badge className={getStatusColor(b.status)}>{getStatusLabel(b.status)}</Badge>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                      <div className="flex gap-1 sm:gap-2 items-center flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                          onClick={() => setSelectedBookingId(b.id)}
                        >
                          <Eye size={12} className="sm:mr-1 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Chi tiết</span>
                        </Button>
                        {b.status?.toUpperCase() === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                              onClick={() => acceptBooking(b.id)}
                              disabled={updating === b.id}
                            >
                              <Check size={12} className="sm:mr-1 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">{updating === b.id ? "..." : "Chấp nhận"}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                              onClick={() => rejectBooking(b.id)}
                              disabled={updating === b.id}
                            >
                              <X size={12} className="sm:mr-1 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">Từ chối</span>
                            </Button>
                          </>
                        )}
                        {b.status?.toUpperCase() === "CONFIRMED" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                            onClick={() => completeBooking(b.id)}
                            disabled={updating === b.id}
                          >
                            <CheckCircle size={12} className="sm:mr-1 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden sm:inline">Hoàn thành</span>
                          </Button>
                        )}
                        {(b.status?.toUpperCase() === "COMPLETED" || b.status?.toUpperCase() === "CANCELLED") && (
                          <span className="text-sm text-slate-500 px-3 py-1">Không có hành động</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBookingId && (
        <BookingDetailModal
          isOpen={!!selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          bookingId={selectedBookingId}
        />
      )}
    </div>
  )
}
