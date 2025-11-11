"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Star, Search, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AuthModal } from "@/components/auth-modal"
import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { useUserState } from "@/hooks/use-user-state"
import { useFeaturedSpas } from "@/hooks/use-featured-spas"
import { useRecentFeedbacks } from "@/hooks/use-recent-feedbacks"
import { usePublicPosts, PublicPost } from "@/hooks/use-public-posts"
import { useHomepageImages } from "@/hooks/use-homepage-images"
import { useRouter } from "next/navigation"
import { getSpaImage, getServiceImage } from "@/lib/image-utils"
import { SpaAvatar } from "@/components/spa-avatar"
import { PostImage } from "@/components/post-image"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"

export default function Home() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [findingLocation, setFindingLocation] = useState(false)
  const { user } = useUserState()
  const { spas, loading: spasLoading } = useFeaturedSpas()
  const { feedbacks, loading: feedbacksLoading } = useRecentFeedbacks()
  const { posts: publicPosts, loading: postsLoading } = usePublicPosts()
  const { card1Url, card2Url, serviceImages } = useHomepageImages()

  const handleAuthModalClose = (open: boolean) => {
    setAuthModalOpen(open)
    if (!open) {
      // Reload page when modal closes to update user state
      setTimeout(() => {
        window.location.reload()
      }, 300)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/spas?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push("/spas")
    }
  }

  const handleFindNearby = () => {
    if (typeof window === "undefined") {
      return
    }
    
    // Check if running on secure origin (HTTPS or localhost)
    const isSecureOrigin = window.location.protocol === 'https:' || 
                          window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1'
    
    if (!isSecureOrigin) {
      toast({
        title: "Lỗi bảo mật",
        description: "Geolocation chỉ hoạt động trên HTTPS hoặc localhost. Vui lòng truy cập qua localhost:3000",
        variant: "destructive",
      })
      return
    }
    
    if (!navigator.geolocation) {
      toast({
        title: "Lỗi",
        description: "Trình duyệt không hỗ trợ định vị",
        variant: "destructive",
      })
      return
    }

    setFindingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        router.push(`/spas?lat=${latitude}&lng=${longitude}&nearby=true`)
        setFindingLocation(false)
      },
      (error) => {
        setFindingLocation(false)
        let errorMessage = "Vui lòng cho phép truy cập vị trí của bạn"
        let showFallback = false
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Quyền truy cập vị trí bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt."
            showFallback = true
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Không thể xác định vị trí của bạn."
            showFallback = true
            break
          case error.TIMEOUT:
            errorMessage = "Hết thời gian chờ định vị. Vui lòng thử lại."
            showFallback = true
            break
        }
        
        // Check for secure origin error
        if (error.message && error.message.includes("secure origins")) {
          errorMessage = "Geolocation chỉ hoạt động trên HTTPS hoặc localhost. Vui lòng truy cập qua localhost:3000"
          showFallback = true
        }
        
        toast({
          title: "Lỗi định vị",
          description: errorMessage,
          variant: "destructive",
        })
        
        // Offer fallback option
        if (showFallback) {
          setTimeout(() => {
            const useFallback = confirm("Bạn có muốn xem tất cả spa thay vì tìm theo vị trí không?")
            if (useFallback) {
              router.push("/spas")
            }
          }, 2000)
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <MainHeader currentPath="/" />

      {/* Hero Section với Background Spa */}
      <section 
        className="relative py-24 bg-cover bg-center" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(/placeholder.jpg)'
        }}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-8" suppressHydrationWarning>{t.findSpaNearby}</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-full shadow-lg p-2 flex gap-2 max-w-3xl mx-auto mb-4">
            <Input 
              placeholder={t.searchPlaceholder}
              suppressHydrationWarning 
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-6"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 rounded-full px-8"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              type="button"
              size="lg" 
              className="bg-red-600 hover:bg-red-700 rounded-full px-6"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                e.stopPropagation()
                handleFindNearby()
              }}
              disabled={findingLocation}
            >
              <Navigation className="w-5 h-5 mr-2" />
              <span suppressHydrationWarning>{findingLocation ? t.findingLocation : t.findNearby}</span>
            </Button>
          </form>
          
          <p className="text-sm text-slate-600" suppressHydrationWarning>
            {t.or} <button 
              type="button"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                e.stopPropagation()
                handleFindNearby()
              }} 
              className="text-amber-600 hover:underline font-medium"
            >
              {t.orFindSpaNearLocation}
            </button>
          </p>
        </div>
      </section>

      {/* Featured Cards - 2 Cột */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 - Khám phá ưu đãi */}
            <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white overflow-hidden relative">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2" suppressHydrationWarning>{t.exploreSpecialOffers}</h3>
                  <p className="text-amber-100" suppressHydrationWarning>
                    {t.exploreSpecialOffersDesc}
                  </p>
                </div>
                <div className="hidden md:block">
                  <img 
                    src={card1Url || "/placeholder.svg"} 
                    alt="" 
                    className="w-48 h-48 object-cover rounded-lg" 
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 2 - Đặt lịch hẹn */}
            <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden relative">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2" suppressHydrationWarning>{t.bookOnlineAppointment}</h3>
                  <p className="text-red-100" suppressHydrationWarning>
                    {t.bookOnlineAppointmentDesc}
                  </p>
                </div>
                <div className="hidden md:block">
                  <img 
                    src={card2Url || "/placeholder.svg"} 
                    alt="" 
                    className="w-48 h-48 object-cover rounded-lg" 
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section với Icons tròn */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3" suppressHydrationWarning>{t.chooseSpaByService}</h2>
            <p className="text-slate-600" suppressHydrationWarning>
              {t.chooseSpaByServiceDesc}
            </p>
          </div>
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { name: "Chăm sóc da", keywords: ["chăm sóc da", "da mặt", "dưỡng ẩm"], tag: 0 },
              { name: "Làm móng", keywords: ["làm móng", "móng", "nail"], tag: 1 },
              { name: "Ngâm chân", keywords: ["ngâm chân", "chân"], tag: 2 },
              { name: "Trị liệu", keywords: ["trị liệu", "therapy"], tag: 3 },
              { name: "Massage Trị Liệu", keywords: ["massage", "mát xa", "trị liệu"], tag: 4 },
              { name: "Massage Thư Giãn", keywords: ["massage", "mát xa", "thư giãn"], tag: 5 },
            ].map((service, i) => {
              const serviceImageUrl = serviceImages[service.tag]
              const fallbackImage = getServiceImage(service.name)
              return (
                <Link 
                  key={i}
                  href={`/spas?service=${encodeURIComponent(service.keywords[0])}`}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:shadow-xl transition">
                    <img 
                      src={serviceImageUrl || fallbackImage} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = fallbackImage
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-amber-500 transition">
                    {service.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Spas */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12" suppressHydrationWarning>{t.featuredSpas}</h2>
          {spasLoading ? (
            <div className="text-center py-12" suppressHydrationWarning>{t.loading}</div>
          ) : spas.length === 0 ? (
            <div className="text-center py-12 text-slate-500" suppressHydrationWarning>{t.noSpasYet}</div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6">
              {spas.slice(0, 8).map((spa: { id: number; name: string; address?: string }) => (
                <Link href={`/spas/${spa.id}`} key={spa.id}>
                  <Card className="overflow-hidden hover:shadow-xl transition group cursor-pointer">
                    <div className="h-40 md:h-48 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center overflow-hidden">
                      <SpaAvatar spaId={spa.id} spaName={spa.name} fillContainer={true} rounded="none" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-900 mb-1">{spa.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-1" suppressHydrationWarning>{spa.address || t.noAddress}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">5.0</span>
                        </div>
                        <button 
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            // Add to favorites logic
                          }}
                          className="p-1.5 hover:bg-amber-50 rounded-full transition"
                        >
                          <Heart className="w-4 h-4 text-slate-400 hover:text-amber-500" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">1 tháng gần đây</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-red-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12">Đánh giá khách hàng</h2>
          {feedbacksLoading ? (
            <div className="text-center py-12 text-white">Đang tải...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-white">Chưa có đánh giá nào</div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6">
              {feedbacks.slice(0, 4).map((feedback: { id: number; rating: number; comment?: string; customer?: { name?: string } }) => (
                <div key={feedback.id} className="bg-white rounded-lg p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(feedback.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-3">{feedback.comment || "Dịch vụ tuyệt vời!"}</p>
                  <p className="font-semibold text-slate-900">{feedback.customer?.name || "Khách hàng"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blogs Section */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Blogs</h2>
          {postsLoading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : publicPosts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Chưa có bài viết nào</div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {publicPosts.slice(0, 3).map((post: PublicPost) => {
                  const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : "Chưa có ngày"
                  const spaName = post.spa?.name || "Spa"
                  return (
                    <Link href={`/blog/${post.id}`} key={post.id}>
                      <Card className="overflow-hidden hover:shadow-xl transition group cursor-pointer">
                        <PostImage postId={post.id} spaId={post.spa?.id} />
                        <CardContent className="p-5">
                          <p className="text-amber-500 text-sm font-medium mb-2">{spaName}</p>
                          <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 min-h-[2.5rem]">{post.title}</h3>
                          <p className="text-xs text-slate-500">{postDate}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
              {publicPosts.length > 3 && (
                <div className="text-center mt-10">
                  <Link href="/blog">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 rounded-full text-base font-medium">
                      Xem thêm
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <AuthModal open={authModalOpen} onOpenChange={handleAuthModalClose} redirectAfterLogin={false} />
    </main>
  )
}
