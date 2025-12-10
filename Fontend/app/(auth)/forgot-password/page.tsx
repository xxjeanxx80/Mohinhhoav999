"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPassword() {
  const router = useRouter()
  const { forgotPassword, loading, error } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    const result = await forgotPassword(email)
    if (result.success) {
      setSuccess(true)
      toast({
        title: "Success",
        description: "If the email exists, a new password has been sent to your email.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send password reset email",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
              <p className="font-semibold mb-2">✓ Email sent!</p>
              <p>
                If email <strong>{email}</strong> exists in the system, a new password has been sent to your inbox.
              </p>
              <p className="mt-2 text-xs">
                Please check your inbox and spam folder. After receiving the new password, please login and change your password.
              </p>
            </div>
            <Button
              onClick={() => router.push("/signin")}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-500 hover:from-amber-600 hover:to-amber-600"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-500 hover:from-amber-600 hover:to-amber-600"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send New Password"}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Remember your password?{" "}
              <Link href="/signin" className="font-semibold text-amber-600 hover:text-amber-700">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

