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
  { tag: "homepage_card_1", label: "Card 1 - Khám phá ưu đãi", description: "Ảnh cho card 'Khám phá các ưu đãi đặc biệt'" },
  { tag: "homepage_card_2", label: "Card 2 - Đặt lịch hẹn", description: "Ảnh cho card 'Đặt lịch hẹn trực tuyến'" },
  { tag: "homepage_service_1", label: "Dịch vụ 1 - Chăm sóc da", description: "Icon cho dịch vụ 'Chăm sóc da'" },
  { tag: "homepage_service_2", label: "Dịch vụ 2 - Làm móng", description: "Icon cho dịch vụ 'Làm móng'" },
  { tag: "homepage_service_3", label: "Dịch vụ 3 - Ngâm chân", description: "Icon cho dịch vụ 'Ngâm chân'" },
  { tag: "homepage_service_4", label: "Dịch vụ 4 - Trị liệu", description: "Icon cho dịch vụ 'Trị liệu'" },
  { tag: "homepage_service_5", label: "Dịch vụ 5 - Massage Trị Liệu", description: "Icon cho dịch vụ 'Massage Trị Liệu'" },
  { tag: "homepage_service_6", label: "Dịch vụ 6 - Massage Thư Giãn", description: "Icon cho dịch vụ 'Massage Thư Giãn'" },
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
        title: "Lỗi",
        description: "Chỉ được upload file ảnh",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File không được vượt quá 5MB",
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
        title: "Thành công",
        description: "Đã upload ảnh thành công",
      })

      // Refresh this image
      await fetchImage(tag)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Upload ảnh thất bại",
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
          Quản lý Homepage
        </h1>
        <p className="mt-2 text-slate-600">Chỉnh sửa ảnh hiển thị trên trang chủ</p>
      </div>

      {/* Card Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-red-600" />
           Ảnh Cards (2 ảnh)
          </CardTitle>
          <CardDescription>Ảnh hiển thị trên 2 cards ở phần đầu trang chủ</CardDescription>
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
                      <div className="animate-pulse text-slate-400">Đang tải...</div>
                    ) : imageState.url ? (
                      <img 
                        src={imageState.url} 
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có ảnh</p>
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
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {imageState.url ? "Thay đổi ảnh" : "Upload ảnh"}
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
            Ảnh Dịch vụ (6 ảnh)
          </CardTitle>
          <CardDescription>Icon hiển thị cho 6 dịch vụ spa trên trang chủ</CardDescription>
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
                      <div className="animate-pulse text-slate-400">Đang tải...</div>
                    ) : imageState.url ? (
                      <img 
                        src={imageState.url} 
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có ảnh</p>
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
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {imageState.url ? "Thay đổi" : "Upload"}
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

