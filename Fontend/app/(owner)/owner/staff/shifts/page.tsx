"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Staff {
  id: number
  name: string
}

interface Shift {
  id: number
  staff: Staff
  dayOfWeek: number
  startTime: string
  endTime: string
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
]

export default function StaffShiftsPage() {
  const { toast } = useToast()
  const [staff, setStaff] = useState<Staff[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [formData, setFormData] = useState({
    staffId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [staffRes, shiftsRes] = await Promise.all([ownerAPI.getStaff(), ownerAPI.getStaffShifts()])
      
      const staffData = Array.isArray(staffRes.data?.data) 
        ? staffRes.data.data 
        : Array.isArray(staffRes.data) 
          ? staffRes.data 
          : []
      
      const shiftsData = Array.isArray(shiftsRes.data?.data)
        ? shiftsRes.data.data
        : Array.isArray(shiftsRes.data)
          ? shiftsRes.data
          : []
      
      setStaff(staffData)
      setShifts(shiftsData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Không thể tải dữ liệu"
      toast({
        title: "Lỗi",
        description: errorMessage || "Không thể tải dữ liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift)
      setFormData({
        staffId: shift.staff.id.toString(),
        dayOfWeek: Number(shift.dayOfWeek).toString(),
        startTime: shift.startTime,
        endTime: shift.endTime,
      })
    } else {
      setEditingShift(null)
      setFormData({ staffId: "", dayOfWeek: "", startTime: "", endTime: "" })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingShift(null)
    setFormData({ staffId: "", dayOfWeek: "", startTime: "", endTime: "" })
  }

  const handleSubmit = async () => {
    if (!formData.staffId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast({
        title: "Thông báo",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    try {
      const payload = {
        staffId: parseInt(formData.staffId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
      }

      if (editingShift) {
        await ownerAPI.updateStaffShift(editingShift.id, payload)
        toast({ title: "Thành công", description: "Cập nhật ca làm việc thành công" })
      } else {
        await ownerAPI.createStaffShift(payload)
        toast({ title: "Thành công", description: "Tạo ca làm việc thành công" })
      }

      handleCloseModal()
      fetchData()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Thao tác thất bại",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa ca làm việc này?")) return

    try {
      await ownerAPI.deleteStaffShift(id)
      toast({ title: "Thành công", description: "Xóa ca làm việc thành công" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Xóa thất bại",
        variant: "destructive",
      })
    }
  }

  const getDayLabel = (day: number) => {
    const dayNum = Number(day)
    return DAYS_OF_WEEK.find((d) => d.value === dayNum)?.label || `Ngày ${dayNum}`
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý ca làm việc</h1>
          <p className="mt-2 text-slate-600">Phân công ca làm việc cho nhân viên</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm ca làm việc
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ca làm việc</CardTitle>
          <CardDescription>{shifts.length} ca làm việc</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày trong tuần</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Giờ bắt đầu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Giờ kết thúc</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Chưa có ca làm việc nào
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                    <tr key={shift.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{shift.staff?.name || `Staff ${shift.staff?.id}`}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{getDayLabel(Number(shift.dayOfWeek))}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{shift.startTime}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{shift.endTime}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenModal(shift)}>
                            <Edit size={14} className="mr-1" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(shift.id)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingShift ? "Sửa ca làm việc" : "Thêm ca làm việc mới"}</DialogTitle>
            <DialogDescription>Điền thông tin ca làm việc</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Nhân viên</Label>
              <Select 
                value={formData.staffId} 
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                disabled={staff.length === 0}
              >
                <SelectTrigger id="staff">
                  <SelectValue placeholder={staff.length === 0 ? "Chưa có nhân viên nào" : "Chọn nhân viên"} />
                </SelectTrigger>
                <SelectContent>
                  {staff.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-slate-500">
                      Vui lòng tạo nhân viên trước
                    </div>
                  ) : (
                    staff.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {staff.length === 0 && (
                <p className="text-xs text-amber-600">
                  Bạn cần tạo nhân viên trước khi thêm ca làm việc. Đi đến trang Staff để tạo nhân viên.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="day">Ngày trong tuần</Label>
              <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Chọn ngày" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Giờ bắt đầu</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Giờ kết thúc</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleSubmit}>
              {editingShift ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

