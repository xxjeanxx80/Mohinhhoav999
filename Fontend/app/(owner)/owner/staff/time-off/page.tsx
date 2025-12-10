"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useOwnerStaffTimeOff } from "@/hooks/use-owner-staff-timeoff"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Calendar, Plus, Trash2, Clock, Pencil } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OwnerStaffTimeOff() {
  const { timeOffs, loading, staff, requestTimeOff, updateTimeOff, deleteTimeOff, refetch } = useOwnerStaffTimeOff()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTimeOff, setEditingTimeOff] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    staffId: "",
    startAt: "",
    endAt: "",
    reason: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staffId) {
      toast({
        title: "Error",
        description: "Please select a staff member",
        variant: "destructive",
      })
      return
    }

    if (!form.startAt || !form.endAt) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      })
      return
    }

    const startDate = new Date(form.startAt)
    const endDate = new Date(form.endAt)

    if (endDate < startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await requestTimeOff(parseInt(form.staffId), {
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        reason: form.reason || undefined,
      })
      setForm({ staffId: "", startAt: "", endAt: "", reason: "" })
      setShowForm(false)
      refetch()
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (timeOff: any) => {
    const now = new Date()
    const startDate = new Date(timeOff.startAt)
    const endDate = new Date(timeOff.endAt)

    if (endDate < now) {
      return <Badge className="bg-gray-100 text-gray-800">Ended</Badge>
    } else if (startDate <= now && endDate >= now) {
      return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
    }
  }

  const handleEdit = (timeOff: any) => {
    setEditingTimeOff({
      id: timeOff.id,
      staffId: timeOff.staff.id.toString(),
      staffName: timeOff.staff.name,
      startAt: new Date(timeOff.startAt).toISOString().slice(0, 16),
      endAt: new Date(timeOff.endAt).toISOString().slice(0, 16),
      reason: timeOff.reason || "",
    })
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTimeOff) return

    const startDate = new Date(editingTimeOff.startAt)
    const endDate = new Date(editingTimeOff.endAt)

    if (endDate < startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await updateTimeOff(editingTimeOff.id, {
        startAt: new Date(editingTimeOff.startAt).toISOString(),
        endAt: new Date(editingTimeOff.endAt).toISOString(),
        reason: editingTimeOff.reason || undefined,
      })
      setEditingTimeOff(null)
      refetch()
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (timeOffId: number) => {
    setDeletingId(timeOffId)
    try {
      await deleteTimeOff(timeOffId)
      refetch()
    } catch (error) {
      // Error already handled in hook
    } finally {
      setDeletingId(null)
    }
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
          <h1 className="text-3xl font-bold text-slate-900">Time Off Management</h1>
          <p className="mt-2 text-slate-600">Manage staff time off requests</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Time Off
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Time Off</CardTitle>
            <CardDescription>Fill in the information to record staff time off</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member *</Label>
                <Select value={form.staffId} onValueChange={(value) => setForm({ ...form, staffId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Start Date *</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt">End Date *</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="E.g.: Sick leave, Vacation..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  setForm({ staffId: "", startAt: "", endAt: "", reason: "" })
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingTimeOff && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Time Off</CardTitle>
            <CardDescription>Update time off information for {editingTimeOff.staffName}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStartAt">Start Date *</Label>
                  <Input
                    id="editStartAt"
                    type="datetime-local"
                    value={editingTimeOff.startAt}
                    onChange={(e) => setEditingTimeOff({ ...editingTimeOff, startAt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEndAt">End Date *</Label>
                  <Input
                    id="editEndAt"
                    type="datetime-local"
                    value={editingTimeOff.endAt}
                    onChange={(e) => setEditingTimeOff({ ...editingTimeOff, endAt: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editReason">Reason (optional)</Label>
                <Textarea
                  id="editReason"
                  value={editingTimeOff.reason}
                  onChange={(e) => setEditingTimeOff({ ...editingTimeOff, reason: e.target.value })}
                  placeholder="E.g.: Sick leave, Vacation..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingTimeOff(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                  {submitting ? "Saving..." : "Update"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Time Offs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time Off List
          </CardTitle>
          <CardDescription>{timeOffs.length} time off records</CardDescription>
        </CardHeader>
        <CardContent>
          {timeOffs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No time off records yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Staff</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Start Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">End Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timeOffs.map((timeOff) => {
                    const startDate = new Date(timeOff.startAt)
                    const endDate = new Date(timeOff.endAt)
                    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

                    return (
                      <tr key={timeOff.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{timeOff.staff.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {startDate.toLocaleString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {endDate.toLocaleString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {daysDiff} {daysDiff === 1 ? "day" : "days"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {timeOff.reason || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(timeOff)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(timeOff)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(timeOff.id)}
                              disabled={deletingId === timeOff.id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deletingId === timeOff.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

