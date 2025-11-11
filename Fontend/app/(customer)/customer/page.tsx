"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useLoyalty } from "@/hooks/use-loyalty"
import { useBookings } from "@/hooks/use-bookings"
import { useFavorites } from "@/hooks/use-favorites"
import { Calendar, Heart, Ticket, ArrowRight, Trophy, Award } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

export default function CustomerDashboard() {
  const { user } = useUser()
  const { loyalty, loading: loyaltyLoading } = useLoyalty(user?.id)
  const { bookings, loading: bookingsLoading } = useBookings()
  const { favorites, loading: favoritesLoading } = useFavorites()

  // Calculate upcoming bookings (PENDING or CONFIRMED with scheduledAt in the future)
  const upcomingBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return []
    const now = new Date()
    return bookings.filter((booking: any) => {
      if (!booking.scheduledAt) return false
      const scheduledDate = new Date(booking.scheduledAt)
      const isUpcoming = scheduledDate >= now
      const isValidStatus = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
      return isUpcoming && isValidStatus
    })
  }, [bookings])

  // Calculate completed services
  const completedServices = useMemo(() => {
    if (!bookings || bookings.length === 0) return []
    return bookings.filter((booking: any) => booking.status === 'COMPLETED')
  }, [bookings])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Xin chào, {user?.name}! 👋</h1>
        <p className="mt-2 text-slate-600">Quản lý đặt lịch của bạn và khám phá các dịch vụ spa mới</p>
      </div>

      {/* Loyalty Card */}
      {loyalty && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-red-600 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Hạng thành viên</h3>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {loyalty.rank === "BRONZE" && "🥉 Đồng"}
                  {loyalty.rank === "SILVER" && "🥈 Bạc"}
                  {loyalty.rank === "GOLD" && "🥇 Vàng"}
                  {loyalty.rank === "PLATINUM" && "💎 Bạch Kim"}
                </p>
                <p className="text-white/90 text-sm">
                  {loyalty.points || 0} điểm tích lũy
                </p>
              </div>
              <Award className="w-16 h-16 opacity-20" />
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{
                  width: `${(() => {
                    const points = loyalty.points || 0
                    if (loyalty.rank === "BRONZE") {
                      return Math.min((points / 100) * 100, 100)
                    }
                    if (loyalty.rank === "SILVER") {
                      return Math.min(((points - 100) / 100) * 100, 100)
                    }
                    if (loyalty.rank === "GOLD") {
                      return Math.min(((points - 200) / 100) * 100, 100)
                    }
                    return 100 // PLATINUM
                  })()}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/80 mt-2">
              {loyalty.rank === "BRONZE" && "Còn " + (100 - (loyalty.points || 0)) + " điểm để lên Bạc"}
              {loyalty.rank === "SILVER" && "Còn " + (200 - (loyalty.points || 0)) + " điểm để lên Vàng"}
              {loyalty.rank === "GOLD" && "Còn " + (300 - (loyalty.points || 0)) + " điểm để lên Bạch Kim"}
              {loyalty.rank === "PLATINUM" && "Bạn đã đạt hạng cao nhất! 🎉"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Đặt lịch sắp tới</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-slate-900">{upcomingBookings.length}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {upcomingBookings.length === 0 
                    ? "Không có đặt lịch sắp tới"
                    : upcomingBookings.length === 1 
                      ? "1 đặt lịch sắp tới"
                      : `${upcomingBookings.length} đặt lịch sắp tới`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Dịch vụ hoàn thành</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-slate-900">{completedServices.length}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {completedServices.length === 0
                    ? "Dịch vụ đã hoàn thành"
                    : completedServices.length === 1
                      ? "1 dịch vụ đã hoàn thành"
                      : `${completedServices.length} dịch vụ đã hoàn thành`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Spa yêu thích</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {favoritesLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-slate-900">{favorites.length}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {favorites.length === 0
                    ? "Spa đã lưu"
                    : favorites.length === 1
                      ? "1 spa đã lưu"
                      : `${favorites.length} spa đã lưu`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empty State - Only show if no bookings */}
      {!bookingsLoading && bookings.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Bạn chưa có đặt lịch nào</CardTitle>
            <CardDescription>
              Vô số spa với dịch vụ chuyên nghiệp và trải nghiệm hấp dẫn đang chờ bạn khám phá
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/spas">
              <Button className="bg-amber-500 hover:bg-amber-600">
                Khám phá ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      {!bookingsLoading && bookings.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Đặt lịch gần đây</CardTitle>
                <CardDescription>Các đặt lịch gần đây của bạn</CardDescription>
              </div>
              <Link href="/customer/bookings">
                <Button variant="outline" size="sm">
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking: any) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{booking.spa?.name || 'N/A'}</p>
                    <p className="text-sm text-slate-600 mt-1">{booking.service?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'COMPLETED' ? 'Hoàn thành' :
                       booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                       booking.status === 'PENDING' ? 'Chờ xác nhận' :
                       'Đã hủy'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
