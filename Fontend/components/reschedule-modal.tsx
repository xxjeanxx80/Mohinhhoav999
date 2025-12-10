"use client"

import { useState } from "react"
import { X, Calendar, Clock } from "lucide-react"
import { bookingsAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  booking: any
  onSuccess?: () => void
}

export function RescheduleModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  if (!isOpen || !booking) return null

  // Check if booking can be rescheduled
  const canReschedule = booking.status !== "CONFIRMED" && 
                       (!booking.rescheduleCount || booking.rescheduleCount < 1)

  if (!canReschedule) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Không thể đổi lịch</h2>
            <p className="text-gray-600 mb-6">
              {booking.status === "CONFIRMED" 
                ? "Lịch hẹn đã được xác nhận và không thể đổi lịch."
                : "Bạn đã đổi lịch hẹn này 1 lần. Không thể đổi lịch thêm."}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn ngày và giờ mới",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create a date object from the selected date and time
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      // Format to ISO string without milliseconds
      const scheduledAt = dateTime.toISOString().split('.')[0] + 'Z';
      
      await bookingsAPI.reschedule(booking.id, {
        scheduledAt,
      })

      toast({
        title: "Thành công",
        description: "Đã dời lịch hẹn thành công!",
      })

      onClose()
      onSuccess?.()
    } catch (error: any) {
      console.error("Reschedule error:", error)
      let errorMessage = "Không thể dời lịch hẹn"
      
      if (error.response) {
        console.error("Error response data:", error.response.data)
        console.error("Error status:", error.response.status)
        console.error("Error headers:", error.response.headers)
        
        if (error.response.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response.status === 500) {
          errorMessage = "Lỗi máy chủ nội bộ. Vui lòng thử lại sau."
        }
      } else if (error.request) {
        console.error("No response received:", error.request)
        errorMessage = "Không nhận được phản hồi từ máy chủ"
      } else {
        console.error("Error setting up request:", error.message)
        errorMessage = `Lỗi: ${error.message}`
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30",
  ]

  const getDatesForMonth = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dời lịch hẹn</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Current Booking Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold mb-2">Lịch hẹn hiện tại:</h3>
          <div className="text-sm space-y-1 text-gray-700">
            <p><strong>Spa:</strong> {booking.spa?.name}</p>
            <p><strong>Dịch vụ:</strong> {booking.service?.name}</p>
            <p><strong>Nhân viên:</strong> {booking.staff?.name || "Không chỉ định"}</p>
            <p><strong>Thời gian:</strong> {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString('vi-VN') : '-'}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <Calendar className="inline mr-2" size={20} />
            Chọn ngày và giờ mới
          </h3>

          <div className="mb-6">
            <p className="text-sm font-semibold mb-3">Chọn ngày</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {getDatesForMonth().map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date.toISOString().split("T")[0])}
                  className={`px-3 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedDate === date.toISOString().split("T")[0]
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <div className="text-xs">{date.toLocaleDateString("vi-VN", { weekday: "short" })}</div>
                  <div className="font-semibold">{date.getDate()}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3">
              <Clock className="inline mr-1" size={16} />
              Chọn giờ
            </p>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded-lg transition text-sm ${
                    selectedTime === time ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedDate || !selectedTime}
            className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận dời lịch"}
          </button>
        </div>
      </div>
    </div>
  )
}

