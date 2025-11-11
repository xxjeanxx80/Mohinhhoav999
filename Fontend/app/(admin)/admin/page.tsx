"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"
import { useAdminDashboard } from "@/hooks/use-admin-dashboard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Users, Calendar, Store, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useUser()
  const { metrics, loading } = useAdminDashboard()

  // Calculate trends (mock data for now - can be enhanced with real comparison)
  const calculateTrend = (current: number, previous: number = 0) => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(2),
      isPositive: change >= 0,
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">System overview and management</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
                  <div className="h-8 w-8 bg-slate-200 animate-pulse rounded"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-slate-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{metrics?.totalUsers.toLocaleString() || 0}</p>
              <div className="flex items-center gap-1 mt-2">
                {metrics?.newCustomers && metrics.newCustomers > 0 ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-medium text-green-600">{metrics.newCustomers} new this month</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">{metrics?.newCustomers || 0} new this month</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Bookings</CardTitle>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{metrics?.totalBookings.toLocaleString() || 0}</p>
              <p className="mt-2 text-xs text-slate-500">All time bookings</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Active Spas</CardTitle>
                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Store className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{metrics?.totalSpas.toLocaleString() || 0}</p>
              <p className="mt-2 text-xs text-slate-500">Approved spas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Profit</CardTitle>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{new Intl.NumberFormat('vi-VN').format(metrics?.totalProfit || 0)} VND</p>
              <p className="mt-2 text-xs text-slate-500">{metrics?.commissionRate || 0}% commission rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {!loading && metrics && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Last 6 months overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') {
                        return [`${new Intl.NumberFormat('vi-VN').format(value)} VND`, 'Revenue']
                      }
                      return [value, 'Bookings']
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    fill="#4f46e5" 
                    name="Revenue" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Bookings</CardTitle>
                  <CardDescription>Last 6 months overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="bookings" 
                    fill="#ec4899" 
                    name="Bookings" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Overall system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-slate-600">API Connection</span>
                <p className="text-xs text-slate-500 mt-1">Backend services</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-slate-600">Database</span>
                <p className="text-xs text-slate-500 mt-1">Data storage</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-slate-600">Cache Server</span>
                <p className="text-xs text-slate-500 mt-1">Performance</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Running
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
