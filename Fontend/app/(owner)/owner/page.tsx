"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"
import { useOwnerDashboard } from "@/hooks/use-owner-dashboard"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, DollarSign, TrendingUp, Users, Briefcase, ArrowUp } from "lucide-react"

export default function OwnerDashboard() {
  const { user } = useUser()
  const stats = useOwnerDashboard()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name}!</h1>
        <p className="mt-2 text-slate-600">Manage your spa business and bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Bookings</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.todayBookings}</p>
            <p className="mt-2 text-xs text-slate-500">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)} VND</p>
            <p className="mt-2 text-xs text-slate-500">This month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Profit</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{new Intl.NumberFormat('vi-VN').format(stats.totalProfit)} VND</p>
            <p className="mt-2 text-xs text-slate-500">After {stats.commissionRate}% commission</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Staff Members</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.staffCount}</p>
            <p className="mt-2 text-xs text-slate-500">Active staff</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Services</CardTitle>
              <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{stats.servicesCount}</p>
            <p className="mt-2 text-xs text-slate-500">Available services</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
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
            {stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyRevenue.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                      return value.toString()
                    }}
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
            ) : (
              <p className="text-slate-600 text-center py-8">No revenue data yet</p>
            )}
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
            {stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyRevenue.slice().reverse()}>
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
            ) : (
              <p className="text-slate-600 text-center py-8">No bookings data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest bookings from all time (excluding cancelled)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.upcomingToday.length > 0 ? (
              stats.upcomingToday.map((appointment: any) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{appointment.service?.name || `Service ${appointment.serviceId}`}</p>
                    <p className="text-sm text-slate-600 mt-1">{appointment.customer?.name || appointment.customer?.email || `Customer ${appointment.customerId}`}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(appointment.scheduledAt).toLocaleDateString()} at {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "CONFIRMED" || appointment.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-center py-8">No bookings yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
