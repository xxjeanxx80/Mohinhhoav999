"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, AlertTriangle, MessageSquare } from "lucide-react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { ReportModal } from "@/components/report-modal"
import axiosClient from "@/lib/axios-client"

interface Feedback {
  id: number
  rating: number
  comment: string | null
  createdAt: string
  customer?: {
    id: number
    name: string
    email: string
  } | null
  spa?: {
    id: number
    name: string
  } | null
  booking?: {
    id: number
  } | null
}

export default function OwnerFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const { toast } = useToast()

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      // Use the new owner endpoint to get all feedbacks
      const feedbacksRes = await ownerAPI.getMyFeedbacks()
      const allFeedbacks = feedbacksRes.data?.data || []
      
      console.log(`Fetched ${allFeedbacks.length} feedbacks for owner`, allFeedbacks)

      // Sort by createdAt (newest first) - already sorted by backend but ensure it
      const sortedFeedbacks = [...allFeedbacks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setFeedbacks(sortedFeedbacks)
    } catch (error: any) {
      console.error("Failed to fetch feedbacks:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đánh giá",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const handleReport = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setReportModalOpen(true)
  }

  const handleReportSuccess = () => {
    fetchFeedbacks()
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Đánh giá khách hàng</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600">Xem và quản lý đánh giá từ khách hàng</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tất cả đánh giá
          </CardTitle>
          <CardDescription>{feedbacks.length} đánh giá từ khách hàng</CardDescription>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">Chưa có đánh giá nào</p>
              <p className="text-sm mt-2">Khách hàng sẽ xuất hiện ở đây sau khi họ đánh giá dịch vụ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id} className="border border-slate-200 hover:shadow-md transition">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={
                                  i < feedback.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-slate-200 text-slate-200"
                                }
                              />
                            ))}
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {feedback.rating}/5
                          </Badge>
                        </div>

                        {feedback.comment && (
                          <p className="text-slate-700 mb-3 leading-relaxed">{feedback.comment}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                          <div className="truncate">
                            <span className="font-medium">Khách hàng:</span> {feedback.customer?.name || "N/A"}
                          </div>
                          <div className="truncate">
                            <span className="font-medium">Spa:</span> {feedback.spa?.name || "N/A"}
                          </div>
                          <div className="truncate">
                            <span className="font-medium">Ngày:</span>{" "}
                            {new Date(feedback.createdAt).toLocaleString("vi-VN", {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReport(feedback)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <AlertTriangle size={16} className="mr-1" />
                          Báo cáo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFeedback && selectedFeedback.spa && selectedFeedback.booking && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false)
            setSelectedFeedback(null)
          }}
          booking={{
            id: selectedFeedback.booking.id,
            spa: selectedFeedback.spa,
            service: null,
            staff: null,
          }}
          feedbackId={selectedFeedback.id}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  )
}

