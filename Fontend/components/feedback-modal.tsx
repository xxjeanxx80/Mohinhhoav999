"use client"

import { useState } from "react"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { feedbacksAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: number
  spaId: number
  spaName: string
  onSuccess?: () => void
}

export function FeedbackModal({ isOpen, onClose, bookingId, spaId, spaName, onSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Notice",
        description: "Please enter your review",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await feedbacksAPI.create({
        bookingId,
        rating,
        comment: comment.trim(),
      })

      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      })

      setComment("")
      setRating(5)
      onClose()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit feedback",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold">Đánh giá dịch vụ</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded" disabled={submitting}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Spa Name */}
          <div>
            <p className="text-sm text-slate-600 mb-1">Bạn đã sử dụng dịch vụ tại</p>
            <p className="font-semibold text-slate-900">{spaName}</p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Mức độ hài lòng của bạn
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  disabled={submitting}
                >
                  <Star
                    size={40}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-slate-200 text-slate-200"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {rating === 1 && "Rất không hài lòng"}
              {rating === 2 && "Không hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Hài lòng"}
              {rating === 5 && "Rất hài lòng"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chia sẻ trải nghiệm của bạn
            </label>
            <Textarea
              placeholder="Nhập đánh giá của bạn về dịch vụ, nhân viên, không gian..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={submitting}
              className="resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{comment.length}/500 ký tự</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </div>
    </div>
  )
}

