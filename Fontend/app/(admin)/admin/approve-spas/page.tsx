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
      // Only show unapproved spas (is_approved: false)
      const unapprovedSpas = allSpas.filter((spa: any) => spa.isApproved === false || spa.is_approved === false)
      setSpas(unapprovedSpas)
    } catch (error: any) {
      console.error("Failed to fetch spas:", error)
      toast({
        title: "Error",
        description: "Failed to load spa list",
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
        title: "Success",
        description: "Spa approved successfully",
      })
      await fetchSpas()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve spa",
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
        title: "Success",
        description: "Spa rejected successfully",
      })
      await fetchSpas()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject spa",
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
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Spa Management</h1>
        <p className="mt-2 text-slate-600">Approve and manage registered spas</p>
      </div>

      {/* Pending Spas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Pending Spas
          </CardTitle>
          <CardDescription>{spas.length} spas pending approval</CardDescription>
        </CardHeader>
        <CardContent>
          {spas.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No spas pending approval</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Spa Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Owner</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Created At</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {spas.map((spa) => (
                    <tr key={spa.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{spa.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{spa.owner?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{spa.address || "Not provided"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{spa.phone || spa.email || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(spa.createdAt).toLocaleDateString("en-US")}
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
                            {processing === spa.id ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(spa.id)}
                            disabled={processing === spa.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
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
