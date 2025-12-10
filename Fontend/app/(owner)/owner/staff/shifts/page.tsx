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
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
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
        : "Failed to load data"
      toast({
        title: "Error",
        description: errorMessage || "Failed to load data",
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
        title: "Notice",
        description: "Please fill in all fields",
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
        toast({ title: "Success", description: "Shift updated successfully" })
      } else {
        await ownerAPI.createStaffShift(payload)
        toast({ title: "Success", description: "Shift created successfully" })
      }

      handleCloseModal()
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Operation failed",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this shift?")) return

    try {
      await ownerAPI.deleteStaffShift(id)
      toast({ title: "Success", description: "Shift deleted successfully" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete",
        variant: "destructive",
      })
    }
  }

  const getDayLabel = (day: number) => {
    const dayNum = Number(day)
    return DAYS_OF_WEEK.find((d) => d.value === dayNum)?.label || `Day ${dayNum}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shift Management</h1>
          <p className="mt-2 text-slate-600">Assign work shifts to staff members</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift List</CardTitle>
          <CardDescription>{shifts.length} shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Staff</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Day of Week</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Start Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">End Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No shifts yet
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
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(shift.id)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
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
            <DialogTitle>{editingShift ? "Edit Shift" : "Add New Shift"}</DialogTitle>
            <DialogDescription>Fill in shift information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Member</Label>
              <Select 
                value={formData.staffId} 
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                disabled={staff.length === 0}
              >
                <SelectTrigger id="staff">
                  <SelectValue placeholder={staff.length === 0 ? "No staff members" : "Select staff member"} />
                </SelectTrigger>
                <SelectContent>
                  {staff.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-slate-500">
                      Please create staff members first
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
                  You need to create staff members before adding shifts. Go to the Staff page to create staff.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="day">Day of Week</Label>
              <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select day" />
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
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
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
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleSubmit}>
              {editingShift ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

