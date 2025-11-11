"use client"

import { useState, useEffect } from "react"
import { ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useOwnerStaff } from "./use-owner-staff"

export interface TimeOff {
  id: number
  staff: {
    id: number
    name: string
  }
  startAt: string
  endAt: string
  reason?: string | null
  createdAt: string
}

export function useOwnerStaffTimeOff() {
  const { staff } = useOwnerStaff()
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchTimeOffs = async () => {
    setLoading(true)
    try {
      // Get all staff and collect their time offs
      const allTimeOffs: TimeOff[] = []
      for (const member of staff) {
        if (member.timeOff && Array.isArray(member.timeOff)) {
          member.timeOff.forEach((to: any) => {
            allTimeOffs.push({
              id: to.id,
              staff: {
                id: member.id,
                name: member.name,
              },
              startAt: to.startAt,
              endAt: to.endAt,
              reason: to.reason,
              createdAt: to.createdAt,
            })
          })
        }
      }
      // Sort by start date (most recent first)
      allTimeOffs.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
      setTimeOffs(allTimeOffs)
    } catch (error: any) {
      console.error("Failed to fetch time offs:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nghỉ phép",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const requestTimeOff = async (staffId: number, data: { startAt: string; endAt: string; reason?: string }) => {
    try {
      await ownerAPI.requestTimeOff(staffId, data)
      toast({
        title: "Thành công",
        description: "Đã ghi nhận nghỉ phép",
      })
      // Refetch staff to get updated time offs
      await fetchTimeOffs()
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể ghi nhận nghỉ phép"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    if (staff.length > 0) {
      fetchTimeOffs()
    }
  }, [staff])

  return {
    timeOffs,
    loading,
    staff,
    requestTimeOff,
    refetch: fetchTimeOffs,
  }
}

