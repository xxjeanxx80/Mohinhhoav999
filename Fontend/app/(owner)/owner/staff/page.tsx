"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOwnerStaff } from "@/hooks/use-owner-staff"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, X } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface StaffSkill {
  id: number
  name: string
}

interface StaffMember {
  id: number
  name: string
  email: string | null
  phone: string | null
  skills?: StaffSkill[]
}

export default function OwnerStaff() {
  const { staff, loading, createStaff, deleteStaff, refetch } = useOwnerStaff()
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [creating, setCreating] = useState(false)
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [newSkillName, setNewSkillName] = useState("")
  const [addingSkill, setAddingSkill] = useState(false)
  const { toast } = useToast()

  const handleOpenSkillModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
    setSkillModalOpen(true)
    setNewSkillName("")
  }

  const handleCloseSkillModal = () => {
    setSkillModalOpen(false)
    setSelectedStaff(null)
    setNewSkillName("")
  }

  const handleAddSkill = async () => {
    if (!selectedStaff || !newSkillName.trim()) {
      toast({
        title: "Thông báo",
        description: "Vui lòng nhập tên kỹ năng",
        variant: "destructive",
      })
      return
    }

    try {
      setAddingSkill(true)
      await ownerAPI.addStaffSkill(selectedStaff.id, { name: newSkillName.trim() })
      toast({
        title: "Thành công",
        description: "Đã thêm kỹ năng mới",
      })
      setNewSkillName("")
      await refetch() // Refresh staff data
      // Update selected staff with new data
      const updatedStaff = staff.find((s: StaffMember) => s.id === selectedStaff.id)
      if (updatedStaff) {
        setSelectedStaff(updatedStaff)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm kỹ năng",
        variant: "destructive",
      })
    } finally {
      setAddingSkill(false)
    }
  }

  const handleRemoveSkill = async (skillId: number) => {
    if (!selectedStaff) return

    try {
      await ownerAPI.removeStaffSkill(selectedStaff.id, skillId)
      toast({
        title: "Thành công",
        description: "Đã xóa kỹ năng",
      })
      await refetch()
      // Update selected staff with new data
      const updatedStaff = staff.find((s: StaffMember) => s.id === selectedStaff.id)
      if (updatedStaff) {
        setSelectedStaff(updatedStaff)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa kỹ năng",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="mt-2 text-slate-600">Manage your spa staff members</p>
        </div>
        <Button
          className="bg-gradient-to-r from-amber-500 to-amber-500 hover:from-amber-600 hover:to-amber-600"
          disabled={creating || !form.name.trim()}
          onClick={async () => {
            if (!form.name.trim()) return
            setCreating(true)
            try {
              await createStaff(form)
              setForm({ name: "", email: "", phone: "" })
            } catch {
              // Error already toasted
            } finally {
              setCreating(false)
            }
          }}
        >
          {creating ? "Adding..." : "Add Staff Member"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Staff</CardTitle>
          <CardDescription>Provide at least a name. Email/phone optional.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>{loading ? "Loading..." : `${staff.length} members`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Skills</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s: StaffMember) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.email || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.phone || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {s.skills && s.skills.length > 0 ? (
                          s.skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">No skills</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenSkillModal(s)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Skills
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteStaff(s.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Skill Management Modal */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quản lý kỹ năng - {selectedStaff?.name}</DialogTitle>
            <DialogDescription>
              Thêm hoặc xóa kỹ năng cho nhân viên này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Skills */}
            <div className="space-y-2">
              <Label>Kỹ năng hiện tại</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-slate-50">
                {selectedStaff?.skills && selectedStaff.skills.length > 0 ? (
                  selectedStaff.skills.map((skill) => (
                    <Badge 
                      key={skill.id} 
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {skill.name}
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">Chưa có kỹ năng nào</span>
                )}
              </div>
            </div>

            {/* Add New Skill */}
            <div className="space-y-2">
              <Label htmlFor="skillName">Thêm kỹ năng mới</Label>
              <div className="flex gap-2">
                <Input
                  id="skillName"
                  placeholder="Ví dụ: Massage, Nail Art..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddSkill()
                    }
                  }}
                />
                <Button 
                  onClick={handleAddSkill} 
                  disabled={addingSkill || !newSkillName.trim()}
                  className="bg-gradient-to-r from-amber-500 to-amber-500 hover:from-amber-600 hover:to-amber-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSkillModal}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
