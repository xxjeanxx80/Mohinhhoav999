"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, Check, Home, Building2, Tag, CreditCard, Wallet, DollarSign } from "lucide-react"
import { bookingsAPI, servicesAPI, spasAPI, couponsAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  spaId: number
  spaName: string
  spaPhone: string
  spaAddress: string
  onBookingSuccess?: () => void
}

export function BookingModal({
  isOpen,
  onClose,
  spaId,
  spaName,
  spaPhone,
  spaAddress,
  onBookingSuccess,
}: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [couponCode, setCouponCode] = useState<string>("")
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT_CARD" | "PAYPAL">("CASH")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [filteringStaff, setFilteringStaff] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()

  // Load services and staff when modal opens
  useEffect(() => {
    if (isOpen) {
      loadServices()
      loadStaff()
      // Pre-fill customer info from user profile
      if (user) {
        setCustomerInfo({
          name: user.name || "",
          phone: user.phone || "",
          email: user.email || "",
          notes: "",
        })
      }
    }
  }, [isOpen, user])

  // Filter staff when moving to step 3 (after selecting time)
  useEffect(() => {
    if (step === 3 && selectedDate && selectedTime) {
      filterAvailableStaff()
    }
  }, [step, selectedDate, selectedTime])

  const loadServices = async () => {
    try {
      const response = await spasAPI.getServices(spaId)
      const servicesData = response.data?.data?.services || []
      setServices(servicesData)
    } catch (error) {
      console.error("Failed to load services:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách dịch vụ",
        variant: "destructive",
      })
    }
  }

  const loadStaff = async () => {
    try {
      const response = await spasAPI.getStaff(spaId)
      const staffData = response.data?.data?.staff || []
      setStaff(staffData)
    } catch (error) {
      console.error("Failed to load staff:", error)
    }
  }

  const filterAvailableStaff = async () => {
    try {
      setFilteringStaff(true)
      // Create ISO datetime from selected date and time
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      const scheduledAt = dateTime.toISOString()
      
      const response = await bookingsAPI.getAvailableStaff(spaId, scheduledAt)
      const availableStaffData = response.data?.data || []
      setStaff(availableStaffData)
    } catch (error) {
      console.error("Failed to filter staff:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhân viên có sẵn",
        variant: "destructive",
      })
    } finally {
      setFilteringStaff(false)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setValidatedCoupon(null)
      return
    }

    setValidatingCoupon(true)
    try {
      const response = await couponsAPI.validate(couponCode)
      const coupon = response.data?.data
      if (coupon && coupon.isActive) {
        // Check if coupon is valid for this spa
        // Admin coupons (no spaId) are valid for all spas
        // Spa-specific coupons must match the current spaId
        if (coupon.spaId && coupon.spaId !== spaId) {
          setValidatedCoupon(null)
          toast({
            title: "Lỗi",
            description: "Mã giảm giá này chỉ áp dụng cho spa khác",
            variant: "destructive",
          })
        } else {
          setValidatedCoupon(coupon)
          toast({
            title: "Thành công",
            description: `Áp dụng mã giảm ${coupon.discountValue}% thành công!`,
          })
        }
      } else {
        setValidatedCoupon(null)
        toast({
          title: "Lỗi",
          description: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      // Suppress 404 errors in console (expected when coupon doesn't exist)
      if (error.response?.status !== 404) {
        console.error("Validate coupon error:", error)
      }
      setValidatedCoupon(null)
      
      // Handle specific error cases
      let errorMessage = "Mã giảm giá không khả dụng"
      
      if (error.response?.status === 404) {
        errorMessage = "Mã giảm giá không tồn tại"
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Mã giảm giá không hợp lệ"
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      console.log("Error message:", errorMessage)
      
      // Show alert to notify user
      alert(errorMessage)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const getFinalPrice = () => {
    if (!selectedService) return 0
    let price = selectedService.price
    if (validatedCoupon) {
      price = price * (1 - validatedCoupon.discountValue / 100)
    }
    return price
  }

  if (!isOpen) return null

  const handleNext = () => {
    if (step === 1 && !selectedService) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn dịch vụ",
        variant: "destructive",
      })
      return
    }
    if (step === 2 && !selectedDate) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn ngày",
        variant: "destructive",
      })
      return
    }
    if (step === 2 && !selectedTime) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn giờ",
        variant: "destructive",
      })
      return
    }
    if (step < 4) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Validation check
      if (!selectedService?.id) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn dịch vụ",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Create proper ISO datetime (Vietnam timezone GMT+7)
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      const scheduledAt = dateTime.toISOString()

      const payload: any = {
        spaId: Number(spaId),
        serviceId: Number(selectedService.id),
        scheduledAt,
        paymentMethod, // Add payment method
      }

      // Only add optional fields if they have values (not empty/null/undefined)
      if (selectedStaff?.id) {
        payload.staffId = Number(selectedStaff.id)
      }
      if (validatedCoupon?.code && validatedCoupon.code.trim() !== '') {
        payload.couponCode = validatedCoupon.code.trim()
      }

      await bookingsAPI.create(payload)

      toast({
        title: "Success",
        description: "Booking confirmed successfully!",
      })

      // Reset form
      setStep(1)
      setSelectedService(null)
      setSelectedStaff(null)
      setSelectedDate("")
      setSelectedTime("")
      setCouponCode("")
      setValidatedCoupon(null)
      setPaymentMethod("CASH")
      setCustomerInfo({ name: "", phone: "", email: "", notes: "" })

      onClose()
      onBookingSuccess?.()
    } catch (error: any) {
      console.error("Booking error:", error)
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Đặt lịch hẹn thất bại",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
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
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold">Đặt lịch hẹn</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s < step ? "bg-green-500" : s === step ? "bg-white text-red-600" : "bg-red-500"
                  }`}
                >
                  {s < step ? <Check size={20} /> : s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-green-500" : "bg-red-500"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>Chọn dịch vụ</span>
            <span>Chọn thời gian</span>
            <span>Chọn nhân viên</span>
            <span>Xác nhận</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Chọn dịch vụ</h3>
              {services.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Spa này chưa có dịch vụ nào</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedService?.id === service.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{service.name}</h4>
                            {service.serviceType === "AT_HOME" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                <Home size={12} />
                                Tại nhà
                              </span>
                            )}
                            {service.serviceType === "AT_SPA" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                <Building2 size={12} />
                                Tại spa
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.floor(service.durationMinutes / 60)}h {service.durationMinutes % 60 > 0 ? `${service.durationMinutes % 60}m` : ""}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-amber-600 ml-4">
                          {Number(service.price).toLocaleString()} VND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Chọn thời gian</h3>
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Tháng 10</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getDatesForMonth().map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date.toISOString().split("T")[0])}
                      className={`px-3 py-2 rounded-lg whitespace-nowrap transition ${
                        selectedDate === date.toISOString().split("T")[0]
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="text-xs">{date.toLocaleDateString("vi-VN", { weekday: "short" })}</div>
                      <div className="font-semibold">{date.getDate()}</div>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm font-semibold mb-3">Giờ</p>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-lg transition text-sm ${
                      selectedTime === time ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Staff */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Chọn nhân viên</h3>
              <p className="text-sm text-gray-600 mb-4">Thời gian: {selectedDate} - {selectedTime}</p>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div
                  onClick={() => setSelectedStaff(null)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    !selectedStaff ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">?</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Không ưu tiên</h4>
                      <p className="text-sm text-gray-600">Spa sẽ chọn nhân viên phù hợp</p>
                    </div>
                  </div>
                </div>

                {staff.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStaff(s)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedStaff?.id === s.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {s.name?.[0]?.toUpperCase() || "S"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{s.name}</h4>
                        <p className="text-sm text-gray-600">{s.position || "Nhân viên"}</p>
                        {s.rating && <p className="text-sm text-yellow-600">⭐ {s.rating}/5</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Xác nhận đặt lịch</h3>
              
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3 text-sm">Thông tin người đặt</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="Nhập email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {/* Coupon Input */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold mb-2">
                    <Tag className="inline mr-1" size={16} />
                    Mã giảm giá (tùy chọn)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 border rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={!couponCode.trim() || validatingCoupon}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {validatingCoupon ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang kiểm tra...
                        </>
                      ) : (
                        "Áp dụng"
                      )}
                    </button>
                  </div>
                  {validatedCoupon && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ Giảm {validatedCoupon.discountValue}% - Mã hợp lệ!
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`p-4 border-2 rounded-lg transition flex flex-col items-center gap-2 ${
                      paymentMethod === "CASH"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <DollarSign size={24} className={paymentMethod === "CASH" ? "text-amber-600" : "text-gray-400"} />
                    <span className="text-sm font-medium">Tiền mặt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                    className={`p-4 border-2 rounded-lg transition flex flex-col items-center gap-2 ${
                      paymentMethod === "CREDIT_CARD"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <CreditCard size={24} className={paymentMethod === "CREDIT_CARD" ? "text-amber-600" : "text-gray-400"} />
                    <span className="text-sm font-medium">Thẻ tín dụng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("PAYPAL")}
                    className={`p-4 border-2 rounded-lg transition flex flex-col items-center gap-2 ${
                      paymentMethod === "PAYPAL"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <Wallet size={24} className={paymentMethod === "PAYPAL" ? "text-amber-600" : "text-gray-400"} />
                    <span className="text-sm font-medium">PayPal</span>
                  </button>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">Tóm tắt đặt lịch</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dịch vụ:</span>
                    <span className="font-semibold">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhân viên:</span>
                    <span>{selectedStaff?.name || "Không ưu tiên"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span>{selectedDate} - {selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thanh toán:</span>
                    <span>
                      {paymentMethod === "CASH" ? "Tiền mặt" : paymentMethod === "CREDIT_CARD" ? "Thẻ tín dụng" : "PayPal"}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá gốc:</span>
                      <span>{Number(selectedService?.price).toLocaleString()} VND</span>
                    </div>
                    {validatedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá ({validatedCoupon.discountValue}%):</span>
                        <span>-{(Number(selectedService?.price) * validatedCoupon.discountValue / 100).toLocaleString()} VND</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Tổng cộng:</span>
                      <span className="text-amber-600">{getFinalPrice().toLocaleString()} VND</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Chính sách đặt lịch</h4>
                <p className="text-sm text-gray-700">
                  Để đảm bảo hoạt động trơn tru và phục vụ quý khách hàng, chúng tôi yêu cầu khách hàng hủy lịch hẹn
                  trước 24 giờ nếu không thể đến.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between gap-4 sticky bottom-0 bg-white">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
              Quay lại
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="ml-auto px-8 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 font-semibold"
            >
              Tiếp tục
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto px-8 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 font-semibold disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
