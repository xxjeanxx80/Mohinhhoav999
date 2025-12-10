"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ 
    code: "", 
    discountPercent: 10, 
    expiresAt: "",
    maxRedemptions: 100 
  })
  const { toast } = useToast()

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getCoupons()
      setCoupons(response.data?.data || [])
    } catch (error: any) {
      console.error("Failed to fetch coupons:", error)
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreate = async () => {
    if (!form.code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      })
      return
    }

    // Admin max 70%
    if (form.discountPercent > 70) {
      toast({
        title: "Error",
        description: "Admin can only create discounts up to 70%",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const payload = {
        code: form.code,
        discountPercent: form.discountPercent,
        expiresAt: form.expiresAt || undefined,
        maxRedemptions: form.maxRedemptions === 0 ? 0 : form.maxRedemptions
      }
      
      await adminAPI.createCoupon(payload)
      toast({
        title: "Success",
        description: "Coupon created successfully",
      })
      setForm({ code: "", discountPercent: 10, expiresAt: "", maxRedemptions: 100 })
      await fetchCoupons()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create coupon",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteCoupon(id)
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      })
      await fetchCoupons()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Promotions</h1>
          <p className="mt-2 text-slate-600">Manage all promotional codes (coupons)</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          disabled={creating || !form.code.trim()}
          onClick={handleCreate}
        >
          {creating ? "Creating..." : "Create Promotion"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Promotion</CardTitle>
          <CardDescription>Code (required), Discount % (0-70), Max uses (0 = Vĩnh viễn) & Expiry (optional)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input 
              id="code"
              placeholder="Code (e.g. SUMMER20)" 
              value={form.code} 
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount % (max 70%)</Label>
            <Input 
              id="discount"
              type="number" 
              value={form.discountPercent} 
              onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} 
              min={0} 
              max={70} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">Max Uses (0 = Vĩnh viễn)</Label>
            <Input 
              id="max"
              type="number" 
              placeholder="0 = Vĩnh viễn"
              value={form.maxRedemptions} 
              onChange={(e) => setForm({ ...form, maxRedemptions: Number(e.target.value) })} 
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires">Expires At</Label>
            <Input 
              id="expires"
              type="date" 
              value={form.expiresAt} 
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>{loading ? "Loading..." : `${coupons.length} promotions`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Spa</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Usage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon: any) => (
                  <tr key={coupon.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{coupon.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{coupon.discountPercent}%</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {coupon.spa ? coupon.spa.name : "Global"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {coupon.currentRedemptions ?? 0} / {coupon.maxRedemptions === 0 ? "Vĩnh viễn" : (coupon.maxRedemptions ?? "Vĩnh viễn")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={coupon.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(coupon.id)}>
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
    </div>
  )
}
