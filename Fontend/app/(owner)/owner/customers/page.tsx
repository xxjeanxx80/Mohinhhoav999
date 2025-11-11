"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useOwnerCustomers } from "@/hooks/use-owner-customers"
import { Star } from "lucide-react"

interface Customer {
  id: number
  name: string | null
  email: string
  phone: string | null
  loyaltyRank?: string
  loyaltyPoints?: number
}

const getLoyaltyColor = (rank?: string) => {
  switch (rank?.toUpperCase()) {
    case "BRONZE": return "bg-orange-100 text-orange-800 border-orange-300"
    case "SILVER": return "bg-slate-200 text-slate-800 border-slate-300"
    case "GOLD": return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "PLATINUM": return "bg-cyan-100 text-cyan-800 border-cyan-300"
    default: return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

// Tự động tính rank dựa trên điểm
const calculateRank = (points: number): string => {
  if (points >= 300) return "PLATINUM"
  if (points >= 200) return "GOLD"
  if (points >= 100) return "SILVER"
  return "BRONZE"
}

export default function OwnerCustomers() {
  const { customers, loading } = useOwnerCustomers()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
        <p className="mt-2 text-slate-600">Manage your customer list</p>
      </div>

      {/* Loyalty Rank Info */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Loyalty Rank System (Tự động theo điểm)</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 border">BRONZE</Badge>
                  <span className="text-slate-600">0-99 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-200 text-slate-800 border-slate-300 border">SILVER</Badge>
                  <span className="text-slate-600">100-199 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 border">GOLD</Badge>
                  <span className="text-slate-600">200-299 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300 border">PLATINUM</Badge>
                  <span className="text-slate-600">300+ points</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>{loading ? "Loading..." : `${customers.length} customers`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Loyalty Rank</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Chưa có khách hàng nào. Khách hàng sẽ xuất hiện khi họ đặt lịch.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer: Customer, index: number) => {
                    const points = customer.loyaltyPoints || 0
                    const rank = calculateRank(points)
                    
                    return (
                      <tr key={`customer-${customer.id}-${index}`} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{customer.name || customer.email || `Customer ${customer.id}`}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{customer.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{customer.phone || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1 text-amber-600 font-semibold">
                            <Star className="w-4 h-4 fill-amber-500" />
                            {points.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className={`${getLoyaltyColor(rank)} border font-semibold px-3 py-1`}>
                            {rank}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
