"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axiosClient from "@/lib/axios-client"
import { useToast } from "@/hooks/use-toast"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  booking: {
    id: number
    spa?: { id: number; name: string } | null
    service?: { id: number; name: string } | null
    staff?: { id: number; name: string } | null
  }
  feedbackId?: number
  onSuccess?: () => void
}

export function ReportModal({ isOpen, onClose, booking, feedbackId, onSuccess }: ReportModalProps) {
  const [targetType, setTargetType] = useState<"SPA" | "SERVICE" | "STAFF" | "FEEDBACK">(
    feedbackId ? "FEEDBACK" : "SPA"
  )
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const getTargetId = () => {
    switch (targetType) {
      case "SPA":
        return booking.spa?.id
      case "SERVICE":
        return booking.service?.id
      case "STAFF":
        return booking.staff?.id
      case "FEEDBACK":
        return feedbackId
      default:
        return undefined
    }
  }

  const getTargetName = () => {
    switch (targetType) {
      case "SPA":
        return booking.spa?.name || "Spa"
      case "SERVICE":
        return booking.service?.name || "Dịch vụ"
      case "STAFF":
        return booking.staff?.name || "Nhân viên"
      case "FEEDBACK":
        return `Đánh giá #${feedbackId}`
      default:
        return ""
    }
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Thông báo",
        description: "Vui lòng nhập lý do báo cáo",
        variant: "destructive",
      })
      return
    }

    const targetId = getTargetId()
    if (!targetId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin đối tượng cần báo cáo",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await axiosClient.post("/reports", {
        targetType,
        targetId,
        reason: reason.trim(),
      })

      toast({
        title: "Thành công",
        description: "Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi sớm nhất.",
      })

      // Reset form
      setReason("")
      setTargetType("SPA")
      
      onClose()
      onSuccess?.()
    } catch (error: any) {
      console.error("Submit report error:", error)
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Gửi báo cáo thất bại",
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
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle size={24} />
            Báo cáo
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded" disabled={submitting}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Thông tin đặt lịch</p>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Spa:</span> {booking.spa?.name || "N/A"}</p>
              <p><span className="font-medium">Dịch vụ:</span> {booking.service?.name || "N/A"}</p>
              {booking.staff && (
                <p><span className="font-medium">Nhân viên:</span> {booking.staff.name}</p>
              )}
            </div>
          </div>

          {/* Target Type Selection */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Bạn muốn báo cáo về
            </Label>
            <Select
              value={targetType}
              onValueChange={(value) => setTargetType(value as "SPA" | "SERVICE" | "STAFF" | "FEEDBACK")}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feedbackId && (
                  <SelectItem value="FEEDBACK">Đánh giá #{feedbackId}</SelectItem>
                )}
                {booking.spa && (
                  <SelectItem value="SPA">Spa: {booking.spa.name}</SelectItem>
                )}
                {booking.service && (
                  <SelectItem value="SERVICE">Dịch vụ: {booking.service.name}</SelectItem>
                )}
                {booking.staff && (
                  <SelectItem value="STAFF">Nhân viên: {booking.staff.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Đang báo cáo về: <span className="font-medium">{getTargetName()}</span>
            </p>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-slate-700 mb-2 block">
              Lý do báo cáo *
            </Label>
            <Textarea
              id="reason"
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              disabled={submitting}
              className="resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{reason.length}/500 ký tự</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Lưu ý:</strong> Báo cáo của bạn sẽ được gửi đến quản trị viên để xem xét. 
              Chúng tôi sẽ phản hồi qua thông báo khi có kết quả.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={submitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </div>
      </div>
    </div>
  )
}

