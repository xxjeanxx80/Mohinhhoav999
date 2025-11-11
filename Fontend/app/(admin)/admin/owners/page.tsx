"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

export default function AdminOwners() {
  const [owners, setOwners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchOwners = async () => {
    setLoading(true)
    try {
      // Fetch all users and all spas
      const [usersRes, spasRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getSpas()
      ])
      
      const usersData = usersRes.data?.data?.users || usersRes.data?.users || []
      const spasData = spasRes.data?.data || spasRes.data || []
      
      // Filter only OWNER role users
      const ownerUsers = usersData.filter((u: any) => u.role === "OWNER")
      
      // Count spas for each owner
      const ownersWithSpas = ownerUsers.map((owner: any) => {
        const ownerSpas = spasData.filter((spa: any) => spa.owner?.id === owner.id)
        return {
          ...owner,
          spas: ownerSpas.length,
        }
      })
      
      setOwners(ownersWithSpas)
    } catch (error: any) {
      console.error("Failed to fetch owners:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách owner",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwners()
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Spa Owners</h1>
        <p className="mt-2 text-slate-600">Manage spa owner accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Owners</CardTitle>
          <CardDescription>{owners.length} spa owners</CardDescription>
        </CardHeader>
        <CardContent>
          {owners.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có owner nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Spas</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Join Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner) => (
                    <tr key={owner.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{owner.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{owner.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <Badge variant="outline">{owner.spas} spa{owner.spas !== 1 ? 's' : ''}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(owner.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
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
