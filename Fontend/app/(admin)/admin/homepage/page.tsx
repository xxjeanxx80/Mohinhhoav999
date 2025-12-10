"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect, useRef } from "react"
import { Home, Image as ImageIcon, Upload, Save } from "lucide-react"

interface HomepageImage {
  tag: string
  label: string
  description: string
  currentUrl?: string | null
}

const homepageImages: HomepageImage[] = [
  { tag: "homepage_card_1", label: "Card 1 - Discover Offers", description: "Image for 'Discover special offers' card" },
  { tag: "homepage_card_2", label: "Card 2 - Book Appointment", description: "Image for 'Book online appointment' card" },
  { tag: "homepage_service_1", label: "Service 1 - Skincare", description: "Icon for 'Skincare' service" },
  { tag: "homepage_service_2", label: "Service 2 - Nail Care", description: "Icon for 'Nail Care' service" },
  { tag: "homepage_service_3", label: "Service 3 - Foot Bath", description: "Icon for 'Foot Bath' service" },
  { tag: "homepage_service_4", label: "Service 4 - Therapy", description: "Icon for 'Therapy' service" },
  { tag: "homepage_service_5", label: "Service 5 - Therapeutic Massage", description: "Icon for 'Therapeutic Massage' service" },
  { tag: "homepage_service_6", label: "Service 6 - Relaxation Massage", description: "Icon for 'Relaxation Massage' service" },
]

export default function AdminHomepage() {
  const [images, setImages] = useState<Record<string, { url: string | null; loading: boolean; uploading: boolean }>>({})
  const { toast } = useToast()
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetchAllImages()
  }, [])

  const fetchAllImages = async () => {
    const imageStates: Record<string, { url: string | null; loading: boolean; uploading: boolean }> = {}
    
    for (const img of homepageImages) {
      imageStates[img.tag] = { url: null, loading: true, uploading: false }
    }
    setImages(imageStates)

    // Fetch all images in parallel
    const promises = homepageImages.map(async (img) => {
      try {
        const response = await adminAPI.getHomepageImage(img.tag)
        const media = response.data?.data
        if (media?.url) {
          const url = media.url.startsWith('http') ? media.url : `http://localhost:3000${media.url}`
          return { tag: img.tag, url }
        }
        return { tag: img.tag, url: null }
      } catch (error) {
        return { tag: img.tag, url: null }
      }
    })

    const results = await Promise.all(promises)
    const updatedStates = { ...imageStates }
    results.forEach(({ tag, url }) => {
      updatedStates[tag] = { url, loading: false, uploading: false }
    })
    setImages(updatedStates)
  }

  const handleFileSelect = (tag: string) => {
    fileInputRefs.current[tag]?.click()
  }

  const handleFileUpload = async (tag: string, file: File | null) => {
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must not exceed 5MB",
        variant: "destructive",
      })
      return
    }

    setImages((prev) => ({
      ...prev,
      [tag]: { ...prev[tag], uploading: true },
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      await adminAPI.uploadHomepageImage(tag, formData)
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })

      // Refresh this image
      await fetchImage(tag)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      })
      setImages((prev) => ({
        ...prev,
        [tag]: { ...prev[tag], uploading: false },
      }))
    }
  }

  const fetchImage = async (tag: string) => {
    try {
      const response = await adminAPI.getHomepageImage(tag)
      const media = response.data?.data
      if (media?.url) {
        const url = media.url.startsWith('http') ? media.url : `http://localhost:3000${media.url}`
        setImages((prev) => ({
          ...prev,
          [tag]: { url, loading: false, uploading: false },
        }))
      } else {
        setImages((prev) => ({
          ...prev,
          [tag]: { url: null, loading: false, uploading: false },
        }))
      }
    } catch (error) {
      setImages((prev) => ({
        ...prev,
        [tag]: { url: null, loading: false, uploading: false },
      }))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Home className="h-8 w-8 text-red-600" />
          Homepage Management
        </h1>
        <p className="mt-2 text-slate-600">Edit images displayed on the homepage</p>
      </div>

      {/* Card Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-red-600" />
           Card Images (2 images)
          </CardTitle>
          <CardDescription>Images displayed on 2 cards at the top of homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {homepageImages.slice(0, 2).map((img) => {
              const imageState = images[img.tag] || { url: null, loading: false, uploading: false }
              return (
                <div key={img.tag} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div>
                    <Label className="text-base font-semibold">{img.label}</Label>
                    <p className="text-sm text-slate-500 mt-1">{img.description}</p>
                  </div>
                  
                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {imageState.loading ? (
                      <div className="animate-pulse text-slate-400">Loading...</div>
                    ) : imageState.url ? (
                      <img 
                        src={imageState.url} 
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image</p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={(el) => (fileInputRefs.current[img.tag] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      handleFileUpload(img.tag, file)
                      if (e.target) e.target.value = ''
                    }}
                  />

                  <Button
                    onClick={() => handleFileSelect(img.tag)}
                    disabled={imageState.uploading}
                    className="w-full"
                    variant="outline"
                  >
                    {imageState.uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {imageState.url ? "Change Image" : "Upload Image"}
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Service Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-red-600" />
            Service Images (6 images)
          </CardTitle>
          <CardDescription>Icons displayed for 6 spa services on homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {homepageImages.slice(2).map((img) => {
              const imageState = images[img.tag] || { url: null, loading: false, uploading: false }
              return (
                <div key={img.tag} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div>
                    <Label className="text-base font-semibold">{img.label}</Label>
                    <p className="text-sm text-slate-500 mt-1">{img.description}</p>
                  </div>
                  
                  <div className="aspect-square bg-slate-100 rounded-full overflow-hidden flex items-center justify-center">
                    {imageState.loading ? (
                      <div className="animate-pulse text-slate-400">Loading...</div>
                    ) : imageState.url ? (
                      <img 
                        src={imageState.url} 
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image</p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={(el) => (fileInputRefs.current[img.tag] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      handleFileUpload(img.tag, file)
                      if (e.target) e.target.value = ''
                    }}
                  />

                  <Button
                    onClick={() => handleFileSelect(img.tag)}
                    disabled={imageState.uploading}
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    {imageState.uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {imageState.url ? "Change" : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

