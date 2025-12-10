"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { spasAPI, ownerAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Clock, Mail, MapPin, Phone, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RegisterSpaPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    openingTime: "08:00:00",
    closingTime: "22:00:00",
  })
  const [loading, setLoading] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [alreadyHasSpa, setAlreadyHasSpa] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Check if owner already has a spa
  useEffect(() => {
    const checkExistingSpa = async () => {
      try {
        const res = await ownerAPI.getMySpas()
        const spas = res.data?.data || res.data || []
        if (Array.isArray(spas) && spas.length > 0) {
          setAlreadyHasSpa(true)
          // Redirect to owner page (will show pending approval screen)
          setTimeout(() => {
            window.location.href = "/owner"
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking existing spa:", error)
      } finally {
        setCheckingExisting(false)
      }
    }
    checkExistingSpa()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const missingFields: string[] = []
    
    if (!formData.name.trim()) {
      missingFields.push("Spa name")
    }
    if (!formData.address.trim()) {
      missingFields.push("Address")
    }
    if (!formData.phone.trim()) {
      missingFields.push("Phone number")
    }
    if (!formData.email.trim()) {
      missingFields.push("Email")
    }

    if (missingFields.length > 0) {
      toast({
        title: "Please fill in all required fields",
        description: `Missing: ${missingFields.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await spasAPI.create(formData)
      console.log("✅ Spa created:", response)

      toast({
        title: "Success",
        description: "Spa registered successfully! Please wait for admin approval.",
      })

      // Force reload to check spa status again
      setTimeout(() => {
        window.location.href = "/owner"
      }, 1500)
    } catch (error: any) {
      console.error("❌ Register spa error:", error)
      console.error("Error response:", error.response?.data)
      
      toast({
        title: "Error", 
        description: error.response?.data?.message || "Failed to register spa",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  // Show loading while checking
  if (checkingExisting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking spa status...</p>
        </div>
      </div>
    )
  }

  // Show message if already has spa
  if (alreadyHasSpa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle>Spa Already Registered</CardTitle>
            <CardDescription>
              You have already registered a spa. Redirecting...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/owner">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Register New Spa</h1>
          <p className="mt-2 text-slate-600">Fill in the information to register your spa</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-red-600" />
            Spa Information
          </CardTitle>
          <CardDescription>
            Spa will be sent to admin for approval after registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Spa Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Spa Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g.: Beauty Spa & Wellness"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your spa..."
                rows={4}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="E.g.: 123 Main Street, District 1, City"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="spa@email.com"
                  type="email"
                />
              </div>
            </div>

            {/* Opening & Closing Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Opening Time
                </Label>
                <Input
                  id="openingTime"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  type="time"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Closing Time
                </Label>
                <Input
                  id="closingTime"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  type="time"
                  step="1"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📝 Note</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Spa will be sent to admin for approval</li>
                <li>• After approval, spa will be publicly visible</li>
                <li>• You can edit spa information after registration</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Link href="/owner">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Registering..." : "Register Spa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

