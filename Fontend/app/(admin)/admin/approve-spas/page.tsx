"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock } from "lucide-react"

export default function AdminApproveSpa() {
  const [spas, setSpas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchSpas = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getSpas()
      const allSpas = response.data?.data || []
      // Chỉ hiển thị spa chưa được approve (is_approved: false)
      const unapprovedSpas = allSpas.filter((spa: any) => spa.isApproved === false || spa.is_approved === false)
      setSpas(unapprovedSpas)
    } catch (error: any) {
      console.error("Failed to fetch spas:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách spa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpas()
  }, [])

  const handleApprove = async (spaId: number) => {
    setProcessing(spaId)
    try {
      await adminAPI.approveSpa(spaId, { isApproved: true })
      toast({
        title: "Thành công",
        description: "Đã phê duyệt spa",
      })
      await fetchSpas()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Phê duyệt spa thất bại",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (spaId: number) => {
    setProcessing(spaId)
    try {
      await adminAPI.rejectSpa(spaId, { isApproved: false })
      toast({
        title: "Thành công",
        description: "Đã từ chối spa",
      })
      await fetchSpas()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Từ chối spa thất bại",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý Spa</h1>
        <p className="mt-2 text-slate-600">Phê duyệt và quản lý các spa đã đăng ký</p>
      </div>

      {/* Spa chờ phê duyệt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Spa chờ phê duyệt
          </CardTitle>
          <CardDescription>{spas.length} spa đang chờ phê duyệt</CardDescription>
        </CardHeader>
        <CardContent>
          {spas.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Không có spa nào đang chờ phê duyệt</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tên Spa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Chủ sở hữu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Địa chỉ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Liên hệ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày tạo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {spas.map((spa) => (
                    <tr key={spa.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{spa.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{spa.owner?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{spa.address || "Chưa có"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{spa.phone || spa.email || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(spa.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(spa.id)}
                            disabled={processing === spa.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {processing === spa.id ? "Đang xử lý..." : "Phê duyệt"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(spa.id)}
                            disabled={processing === spa.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
