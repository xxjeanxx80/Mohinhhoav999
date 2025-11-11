"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, MessageSquare } from "lucide-react"

export default function AdminModeration() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<number | null>(null)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const { toast } = useToast()

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getReports()
      const data = response.data?.data || response.data || []
      setReports(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Failed to fetch reports:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách báo cáo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenResolveDialog = (report: any) => {
    setSelectedReport(report)
    setResolutionNotes("")
    setShowResolveDialog(true)
  }

  const handleCloseResolveDialog = () => {
    setShowResolveDialog(false)
    setSelectedReport(null)
    setResolutionNotes("")
  }

  const handleResolve = async () => {
    if (!selectedReport) return
    
    setResolving(selectedReport.id)
    try {
      await adminAPI.resolveReport(selectedReport.id, { notes: resolutionNotes || "Đã xử lý" })
      toast({
        title: "Thành công",
        description: "Đã đánh dấu báo cáo đã xử lý",
      })
      await fetchReports()
      handleCloseResolveDialog()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xử lý báo cáo",
        variant: "destructive",
      })
    } finally {
      setResolving(null)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Kiểm duyệt & Báo cáo</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600">Xem xét và xử lý các báo cáo từ người dùng</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Báo cáo nội dung
          </CardTitle>
          <CardDescription>{reports.length} báo cáo</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-2">✅ Không có báo cáo nào</p>
              <p className="text-sm text-slate-400">Hệ thống đang hoạt động tốt!</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">ID</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Người báo cáo</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap hidden md:table-cell">Loại báo cáo</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap hidden lg:table-cell">ID đối tượng</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Lý do</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Trạng thái</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Hành động</th>
                    </tr>
                  </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600">#{report.id}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        <div>
                          <p className="font-medium text-slate-900 truncate max-w-[120px] sm:max-w-none">{report.reporter?.name || "N/A"}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none hidden sm:block">{report.reporter?.email || `User #${report.reporterId}`}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">
                        <Badge className="bg-blue-100 text-blue-800">{report.targetType || "N/A"}</Badge>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">
                        <p className="font-medium text-slate-900 truncate max-w-[150px]">{report.targetName || "N/A"}</p>
                        <p className="text-xs text-slate-500">ID: #{report.targetId}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600">
                        <p className="truncate max-w-[200px] sm:max-w-xs" title={report.reason}>{report.reason || "N/A"}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        <Badge className={report.status === "OPEN" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                          {report.status === "OPEN" ? "Chờ xử lý" : "Đã xử lý"}
                        </Badge>
                        {report.status === "RESOLVED" && report.resolutionNotes && (
                          <div className="mt-1 text-xs text-slate-500 flex items-start gap-1 hidden sm:flex">
                            <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="truncate max-w-[150px]" title={report.resolutionNotes}>{report.resolutionNotes}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                        {report.status === "OPEN" ? (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                            onClick={() => handleOpenResolveDialog(report)}
                            disabled={resolving === report.id}
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">{resolving === report.id ? "Đang xử lý..." : "Xử lý"}</span>
                          </Button>
                        ) : (
                          <span className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Đã xử lý</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Xử lý báo cáo</DialogTitle>
            <DialogDescription>
              Nhập ghi chú về cách xử lý báo cáo này
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thông tin báo cáo</Label>
                <div className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">ID:</span>
                    <span className="text-sm text-slate-900">#{selectedReport.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Người báo cáo:</span>
                    <span className="text-sm text-slate-900">{selectedReport.reporter?.name || selectedReport.reporter?.email || `User #${selectedReport.reporterId}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Loại:</span>
                    <Badge className="bg-blue-100 text-blue-800">{selectedReport.targetType}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Đối tượng:</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{selectedReport.targetName || "N/A"}</p>
                      <p className="text-xs text-slate-500">ID: #{selectedReport.targetId}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Lý do:</span>
                    <p className="text-sm text-slate-900">{selectedReport.reason}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution-notes">Ghi chú xử lý (Admin)</Label>
                <Textarea
                  id="resolution-notes"
                  placeholder="Nhập ghi chú về cách bạn đã xử lý báo cáo này..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">
                  Ghi chú này sẽ được lưu lại trong hệ thống
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseResolveDialog}
              disabled={resolving !== null}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleResolve}
              disabled={resolving !== null}
            >
              {resolving !== null ? "Đang xử lý..." : "Xác nhận đã xử lý"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
