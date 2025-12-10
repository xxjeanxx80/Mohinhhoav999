"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useOwnerPayouts } from "@/hooks/use-owner-payouts"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { useState } from "react"
import { DollarSign, Plus, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function OwnerPayouts() {
  const { payouts, availableProfit, loading, requestPayout } = useOwnerPayouts()
  const { user } = useUser()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: "",
    notes: "",
  })
  const { toast } = useToast()

  // Check if bank account is linked
  const hasBankAccount = user?.bankName && user?.bankAccountNumber && user?.bankAccountHolder

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await requestPayout(amount, form.notes || undefined)
      setForm({ amount: "", notes: "" })
      setShowForm(false)
    } catch (error) {
      // Error already handled in hook
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      REQUESTED: { 
        label: "Requested", 
        className: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-4 w-4" />
      },
      APPROVED: { 
        label: "Approved", 
        className: "bg-blue-100 text-blue-800",
        icon: <CheckCircle className="h-4 w-4" />
      },
      COMPLETED: { 
        label: "Completed", 
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4" />
      },
      REJECTED: { 
        label: "Rejected", 
        className: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4" />
      },
    }
    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800", icon: null }
    return (
      <Badge className={badge.className}>
        <div className="flex items-center gap-1">
          {badge.icon}
          {badge.label}
        </div>
      </Badge>
    )
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Payouts</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600">Request and view payout history</p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Request Payout</span>
          <span className="sm:hidden">Request</span>
        </Button>
      </div>

      {/* Bank Account Warning */}
      {!hasBankAccount && (
        <div className="rounded-lg border-l-4 border-l-red-500 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Bank Account Not Linked</h3>
              <p className="mt-1 text-sm text-red-800">
                Please link your bank account in{" "}
                <Link href="/owner/profile" className="font-semibold underline hover:text-red-700">
                  Profile
                </Link>
                {" "}before requesting a payout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Profit Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Available Profit
          </CardTitle>
          <CardDescription className="text-green-700">
            Total amount available for withdrawal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-800">
            {new Intl.NumberFormat('vi-VN').format(availableProfit)} VND
          </div>
          <p className="text-sm text-green-600 mt-2">
            This amount will automatically decrease when you make a payout
          </p>
        </CardContent>
      </Card>

      {/* Request Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
            <CardDescription>Fill in the information to request a payout</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (VND) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="E.g.: 1000000"
                  min="0"
                  step="1000"
                  max={availableProfit}
                  required
                />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    Amount: {form.amount ? new Intl.NumberFormat('vi-VN').format(parseFloat(form.amount) || 0) : "0"} VND
                  </p>
                  <p className="text-xs text-slate-500">
                    Remaining after payout: {form.amount ? new Intl.NumberFormat('vi-VN').format(Math.max(0, availableProfit - parseFloat(form.amount) || 0)) : new Intl.NumberFormat('vi-VN').format(availableProfit)} VND
                  </p>
                  {form.amount && parseFloat(form.amount) > availableProfit && (
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Amount exceeds available balance!
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="E.g.: October 2025 payout"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  setForm({ amount: "", notes: "" })
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payouts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payout History
          </CardTitle>
          <CardDescription>{payouts.length} payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No payout requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Requested At</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Approved At</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Completed At</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">#{payout.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {new Intl.NumberFormat('vi-VN').format(payout.amount)} VND
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(payout.requestedAt).toLocaleString("en-US")}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {payout.approvedAt ? new Date(payout.approvedAt).toLocaleString("en-US") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {payout.completedAt ? new Date(payout.completedAt).toLocaleString("en-US") : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {payout.notes || "—"}
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

