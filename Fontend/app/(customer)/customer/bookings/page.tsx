"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Trash2, Star, CalendarClock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useBookings } from "@/hooks/use-bookings"
import { bookingsAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { FeedbackModal } from "@/components/feedback-modal"
import { RescheduleModal } from "@/components/reschedule-modal"
import { ReportModal } from "@/components/report-modal"
import { useLanguage } from "@/contexts/language-context"

export default function CustomerBookings() {
  const { bookings, loading, error, refetch } = useBookings()
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [canceling, setCanceling] = useState<number | null>(null)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const handleCancel = async (bookingId: number) => {
    if (!confirm(t.confirmCancelBooking)) {
      return
    }
    
    try {
      setCanceling(bookingId)
      await bookingsAPI.cancel(bookingId, { reason: "Customer requested cancellation" })
      toast({
        title: t.success,
        description: t.cancelSuccess,
      })
      refetch()
    } catch (error: any) {
      console.error("Cancel error:", error)
      toast({
        title: t.error,
        description: error.response?.data?.message || t.cancelFailed,
        variant: "destructive",
      })
    } finally {
      setCanceling(null)
    }
  }

  const handleFeedback = (booking: any) => {
    setSelectedBooking(booking)
    setFeedbackModalOpen(true)
  }

  const handleReport = (booking: any) => {
    setSelectedBooking(booking)
    setReportModalOpen(true)
  }

  const handleReschedule = (booking: any) => {
    setSelectedBooking(booking)
    setRescheduleModalOpen(true)
  }

  const handleFeedbackSuccess = () => {
    refetch()
  }

  const handleReportSuccess = () => {
    refetch()
  }

  const handleRescheduleSuccess = () => {
    refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600" suppressHydrationWarning>{t.loadingBookings}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" suppressHydrationWarning>{t.yourBookingsTitle}</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600" suppressHydrationWarning>{t.yourBookingsDescription}</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Calendar className="w-16 h-16 text-slate-300" />
            </div>
            <CardTitle className="text-2xl" suppressHydrationWarning>{t.noBookingsYet}</CardTitle>
            <p className="text-slate-600 mt-2" suppressHydrationWarning>
              {t.noBookingsDescription}
            </p>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Link href="/spas">
              <Button className="bg-amber-500 hover:bg-amber-600" suppressHydrationWarning>
                {t.exploreNow}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6 items-start md:items-center">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1.5 sm:mb-2" suppressHydrationWarning>{t.spa}</p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">{booking.spa?.name || "N/A"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1.5 sm:mb-2" suppressHydrationWarning>{t.service}</p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">{booking.service?.name || "N/A"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1.5 sm:mb-2" suppressHydrationWarning>{t.staff}</p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">{booking.staff?.name || t.notSelected}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1.5 sm:mb-2 flex items-center gap-1.5" suppressHydrationWarning>
                      <Calendar size={14} className="flex-shrink-0" /> {t.time}
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-slate-900 whitespace-nowrap">
                      {new Date(booking.scheduledAt).toLocaleString(language === "VN" ? "vi-VN" : "en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 mb-1.5 sm:mb-2" suppressHydrationWarning>{t.status}</p>
                    <span
                      className={`inline-block px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : booking.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                      suppressHydrationWarning
                    >
                      {booking.status === "CONFIRMED"
                        ? t.confirmed
                        : booking.status === "CANCELLED"
                          ? t.cancelled
                          : booking.status === "COMPLETED"
                            ? t.completed
                            : t.pending}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-start md:justify-end gap-2 sm:gap-2 pt-2 md:pt-0">
                    {booking.status === "COMPLETED" && (
                      <>
                        {booking.feedbacks && booking.feedbacks.length > 0 ? (
                          <Link href={`/spas/${booking.spa?.id}#feedbacks`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              suppressHydrationWarning
                            >
                              <Star size={14} className="mr-1.5 fill-yellow-400 text-yellow-400" />
                              <span className="hidden sm:inline">{t.viewFeedback}</span>
                              <span className="sm:hidden">Feedback</span>
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback(booking)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            suppressHydrationWarning
                          >
                            <Star size={14} className="mr-1.5" />
                            <span className="hidden sm:inline">{t.rate}</span>
                            <span className="sm:hidden">Đánh giá</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReport(booking)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                          suppressHydrationWarning
                        >
                          <AlertTriangle size={14} className="mr-1.5" />
                          <span className="hidden sm:inline">Báo cáo</span>
                          <span className="sm:hidden">Báo cáo</span>
                        </Button>
                      </>
                    )}
                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(booking)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          suppressHydrationWarning
                        >
                          <CalendarClock size={14} className="mr-1.5" />
                          <span className="hidden sm:inline">{t.reschedule}</span>
                          <span className="sm:hidden">Đổi lịch</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(booking.id)}
                          disabled={canceling === booking.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          suppressHydrationWarning
                        >
                          <Trash2 size={14} className="mr-1.5" />
                          <span className="hidden sm:inline">{canceling === booking.id ? t.canceling : t.cancelBooking}</span>
                          <span className="sm:hidden">{canceling === booking.id ? "..." : "Hủy"}</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedBooking && (
        <>
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => {
              setFeedbackModalOpen(false)
              setSelectedBooking(null)
            }}
            bookingId={selectedBooking.id}
            spaId={selectedBooking.spa?.id}
            spaName={selectedBooking.spa?.name || "Spa"}
            onSuccess={handleFeedbackSuccess}
          />
          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => {
              setReportModalOpen(false)
              setSelectedBooking(null)
            }}
            booking={selectedBooking}
            onSuccess={handleReportSuccess}
          />
          <RescheduleModal
            isOpen={rescheduleModalOpen}
            onClose={() => {
              setRescheduleModalOpen(false)
              setSelectedBooking(null)
            }}
            booking={selectedBooking}
            onSuccess={handleRescheduleSuccess}
          />
        </>
      )}
    </div>
  )
}
