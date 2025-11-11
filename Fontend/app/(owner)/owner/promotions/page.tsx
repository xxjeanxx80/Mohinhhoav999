"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useOwnerPromotions } from "@/hooks/use-owner-promotions"

export default function OwnerPromotions() {
  const { promotions, loading, createPromotion, deletePromotion } = useOwnerPromotions()
  const [form, setForm] = useState({ 
    code: "", 
    discountPercent: 10, 
    expiresAt: "",
    maxRedemptions: "" 
  })
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Promotions</h1>
          <p className="mt-2 text-slate-600">Manage your promotional codes (coupons)</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700"
          disabled={creating || !form.code.trim()}
          onClick={async () => {
            setCreating(true)
            try {
              await createPromotion(form)
              setForm({ code: "", discountPercent: 10, expiresAt: "", maxRedemptions: "" })
            } catch {
              // Error already toasted
            } finally {
              setCreating(false)
            }
          }}
        >
          {creating ? "Creating..." : "Create Promotion"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Promotion</CardTitle>
          <CardDescription>Code (required), Discount % (0-100), Max uses & Expiry (optional)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input 
            placeholder="Code (e.g. SUMMER20)" 
            value={form.code} 
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
          />
          <Input 
            type="number" 
            placeholder="Discount % (max 40%)" 
            value={form.discountPercent} 
            onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} 
            min={0} 
            max={40} 
          />
          <Input 
            type="number" 
            placeholder="Max Uses (∞ if empty)" 
            value={form.maxRedemptions} 
            onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} 
            min={1}
          />
          <Input 
            type="date" 
            placeholder="Expires At" 
            value={form.expiresAt} 
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
          <CardDescription>{loading ? "Loading..." : `${promotions.length} promotions`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Usage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo: any) => (
                  <tr key={promo.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{promo.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{promo.discountPercent ?? promo.discountPercentage ?? promo.discountAmount ?? "N/A"}%</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : "No expiry"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{promo.currentRedemptions ?? promo.usageCount ?? 0} / {promo.maxRedemptions ?? "∞"}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className="bg-green-100 text-green-800">{promo.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => deletePromotion(promo.id)}>
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
