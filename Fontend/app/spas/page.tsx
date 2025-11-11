"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/main-header"
import { Footer } from "@/components/footer"
import { Heart, Star, Search } from "lucide-react"
import { spasAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { useFavorites } from "@/hooks/use-favorites"
import { getSpaImage } from "@/lib/image-utils"
import { SpaAvatar } from "@/components/spa-avatar"
import { useLanguage } from "@/contexts/language-context"

export default function SpasPage() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const serviceQuery = searchParams?.get("service") || ""
  const searchQuery = searchParams?.get("search") || ""
  const nearbyQuery = searchParams?.get("nearby") || ""
  const lat = searchParams?.get("lat") || ""
  const lng = searchParams?.get("lng") || ""
  
  const [spas, setSpas] = useState<any[]>([])
  const [filteredSpas, setFilteredSpas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const { toast } = useToast()
  const { isFavorite, toggleFavorite } = useFavorites()

  // Fetch spas when page loads or when nearby query changes
  useEffect(() => {
    if (nearbyQuery && lat && lng) {
      fetchNearbySpas(parseFloat(lat), parseFloat(lng))
    } else {
      fetchSpas()
    }
  }, [nearbyQuery, lat, lng])

  // Filter spas when serviceQuery, searchTerm, or spas list changes
  useEffect(() => {
    // Wait for spas to load
    if (spas.length === 0 && !nearbyQuery) {
      return
    }
    
    if (serviceQuery) {
      filterByService(serviceQuery)
    } else if (searchTerm) {
      filterBySearchTerm(searchTerm)
    } else {
      setFilteredSpas(spas)
    }
  }, [serviceQuery, searchTerm, spas, nearbyQuery])

  const fetchSpas = async () => {
    try {
      setLoading(true)
      const res = await spasAPI.getFeatured() // Use public endpoint
      const allSpas = res.data?.data || res.data || []
      
      // Featured endpoint already returns approved spas only
      setSpas(Array.isArray(allSpas) ? allSpas : [])
      setFilteredSpas(Array.isArray(allSpas) ? allSpas : [])
    } catch (error: any) {
      console.error("Error fetching spas:", error)
      toast({
        title: t.error,
        description: t.cannotLoadSpaList,
        variant: "destructive",
      })
      setSpas([])
      setFilteredSpas([])
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbySpas = async (latitude: number, longitude: number) => {
    try {
      setLoading(true)
      console.log("🔍 Fetching nearby spas:", { latitude, longitude })
      
      const res = await spasAPI.getNearby(latitude, longitude, 20)
      console.log("✅ Nearby spas response:", res.data)
      
      const nearbySpas = res.data?.data || res.data || []
      const spaArray = Array.isArray(nearbySpas) ? nearbySpas : []
      
      setSpas(spaArray)
      setFilteredSpas(spaArray)
      
      if (spaArray.length === 0) {
        toast({
          title: t.noSpaFound,
          description: t.noSpaInRadius,
        })
      } else {
        toast({
          title: t.success,
          description: t.foundSpasNearby.replace("{count}", spaArray.length.toString()),
        })
      }
    } catch (error: any) {
      console.error("❌ Error fetching nearby spas:", {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          t.cannotLoad
      
      toast({
        title: t.error,
        description: errorMessage,
        variant: "destructive",
      })
      setSpas([])
      setFilteredSpas([])
    } finally {
      setLoading(false)
    }
  }

  const filterByService = async (keyword: string) => {
    try {
      setLoading(true)
      console.log("🔍 [filterByService] Filtering spas by service keyword:", keyword)
      
      // Đảm bảo đã có danh sách spas trước
      if (spas.length === 0) {
        console.log("⚠️ [filterByService] No spas loaded, fetching all spas first...")
        await fetchSpas()
      }
      
      // Lọc spas có services chứa từ khóa
      const filtered = await Promise.all(
        spas.map(async (spa) => {
          try {
            const servicesRes = await spasAPI.getServices(spa.id)
            console.log(`🔍 [filterByService] Services response for spa ${spa.id}:`, servicesRes.data)
            
            // Handle different response structures
            let services: any[] = []
            if (servicesRes.data?.data?.services) {
              services = servicesRes.data.data.services
            } else if (servicesRes.data?.data && Array.isArray(servicesRes.data.data)) {
              services = servicesRes.data.data
            } else if (servicesRes.data?.services) {
              services = servicesRes.data.services
            } else if (Array.isArray(servicesRes.data)) {
              services = servicesRes.data
            }
            
            // Ensure services is an array
            if (!Array.isArray(services)) {
              console.warn(`⚠️ [filterByService] Services is not an array for spa ${spa.id}:`, services)
              services = []
            }
            
            console.log(`📋 [filterByService] Spa ${spa.id} has ${services.length} services:`, services.map((s: any) => s.name))
            
            // Check nếu có service nào chứa keyword trong name hoặc description
            const hasMatchingService = services.some((service: any) => {
              const serviceName = (service.name || "").trim().toLowerCase()
              const serviceDesc = (service.description || "").trim().toLowerCase()
              const keywordLower = keyword.trim().toLowerCase()
              
              // Normalize Vietnamese text (remove diacritics for better matching)
              const normalize = (str: string) => {
                return str
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .trim()
              }
              
              const normalizedServiceName = normalize(serviceName)
              const normalizedServiceDesc = normalize(serviceDesc)
              const normalizedKeyword = normalize(keywordLower)
              
              // Split keyword into words for better matching
              const keywordWords = normalizedKeyword.split(/\s+/).filter(w => w.length > 0)
              const serviceNameWords = normalizedServiceName.split(/\s+/)
              const serviceDescWords = normalizedServiceDesc.split(/\s+/)
              
              // Check if all keyword words appear in service name or description
              const allWordsMatch = keywordWords.length > 0 && keywordWords.every(word => 
                serviceNameWords.some(sw => sw.includes(word) || word.includes(sw)) ||
                serviceDescWords.some(sw => sw.includes(word) || word.includes(sw))
              )
              
              // Also check full string match (original logic)
              const fullStringMatch = normalizedServiceName.includes(normalizedKeyword) || 
                                     normalizedServiceDesc.includes(normalizedKeyword) ||
                                     serviceName.includes(keywordLower) || 
                                     serviceDesc.includes(keywordLower)
              
              const matches = allWordsMatch || fullStringMatch
              
              if (matches) {
                console.log(`✅ [filterByService] Service "${service.name}" matches keyword "${keyword}"`, {
                  serviceName,
                  serviceDesc,
                  keywordLower,
                  normalizedServiceName,
                  normalizedKeyword,
                })
              }
              
              return matches
            })
            
            if (hasMatchingService) {
              console.log(`✅ [filterByService] Spa ${spa.name} (ID: ${spa.id}) matches keyword "${keyword}"`)
            } else {
              console.log(`❌ [filterByService] Spa ${spa.name} (ID: ${spa.id}) does NOT match keyword "${keyword}"`, {
                servicesCount: services.length,
                serviceNames: services.map((s: any) => s.name),
              })
            }
            
            return hasMatchingService ? spa : null
          } catch (error: any) {
            console.error(`❌ [filterByService] Error fetching services for spa ${spa.id}:`, error)
            return null
          }
        })
      )
      
      const validSpas = filtered.filter(Boolean)
      console.log(`✅ [filterByService] Found ${validSpas.length} spa(s) matching keyword "${keyword}"`)
      
      setFilteredSpas(validSpas)
      
      if (validSpas.length === 0) {
        toast({
          title: t.noSpaFound,
          description: t.noSpaWithService.replace("{keyword}", keyword),
        })
      } else {
        toast({
          title: t.success,
          description: t.foundSpas.replace("{count}", validSpas.length.toString()).replace("{keyword}", keyword),
        })
      }
    } catch (error: any) {
      console.error("❌ [filterByService] Error filtering by service:", error)
      toast({
        title: t.error,
        description: t.cannotLoad,
        variant: "destructive",
      })
      setFilteredSpas([])
    } finally {
      setLoading(false)
    }
  }

  const filterBySearchTerm = (term: string) => {
    const filtered = spas.filter((spa) =>
      spa.name?.toLowerCase().includes(term.toLowerCase()) ||
      spa.address?.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredSpas(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      filterBySearchTerm(searchTerm)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600" suppressHydrationWarning>{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <MainHeader currentPath="/spas" />
      
      {/* Search Bar Section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder={t.enterSpaName} 
                className="pl-10 bg-slate-100 border-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <Button type="submit" size="icon" className="bg-amber-500 hover:bg-amber-600">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {nearbyQuery && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2" suppressHydrationWarning>
                {t.spasNearYou}
              </h1>
              <p className="text-slate-600" suppressHydrationWarning>
                {t.foundSpasInRadius.replace("{count}", filteredSpas.length.toString())}
              </p>
              {lat && lng && (
                <p className="text-sm text-slate-500 mt-1" suppressHydrationWarning>
                  📍 {t.location}: {lat}, {lng}
                </p>
              )}
            </div>
          )}

          {!nearbyQuery && serviceQuery && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2" suppressHydrationWarning>
                {t.searchResultsFor.replace("{query}", serviceQuery)}
              </h1>
              <p className="text-slate-600" suppressHydrationWarning>
                {t.foundSpasWithService.replace("{count}", filteredSpas.length.toString())}
              </p>
            </div>
          )}

          {!nearbyQuery && !serviceQuery && searchTerm && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2" suppressHydrationWarning>
                {t.searchResultsFor.replace("{query}", searchTerm)}
              </h1>
              <p className="text-slate-600" suppressHydrationWarning>
                {t.foundSpasCount.replace("{count}", filteredSpas.length.toString())}
              </p>
            </div>
          )}

          {!nearbyQuery && !serviceQuery && !searchTerm && (
            <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center" suppressHydrationWarning>
              {t.featuredSpas}
            </h1>
          )}

          {/* Spas Grid */}
          {filteredSpas.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg mb-4" suppressHydrationWarning>{t.noSpaFoundMessage}</p>
              <Link href="/">
                <Button className="bg-amber-500 hover:bg-amber-600" suppressHydrationWarning>
                  {t.backToHomepage}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6">
              {filteredSpas.map((spa) => (
                <Link href={`/spas/${spa.id}`} key={spa.id}>
                  <Card className="overflow-hidden hover:shadow-xl transition group cursor-pointer">
                    {/* Spa Avatar Header - giống homepage */}
                    <div className="h-40 md:h-48 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center overflow-hidden">
                      <SpaAvatar spaId={spa.id} spaName={spa.name} fillContainer={true} rounded="none" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-900 mb-1">{spa.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                        {spa.address || "Chưa có địa chỉ"}
                      </p>
                      {spa.distance && (
                        <p className="text-xs text-amber-600 font-medium mb-2">
                          📍 Cách bạn {spa.distance} km
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">5.0</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const wasFavorite = isFavorite(spa.id)
                            toggleFavorite(spa.id)
                            toast({
                              title: wasFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
                              description: wasFavorite 
                                ? `${spa.name} đã được xóa khỏi danh sách yêu thích`
                                : `${spa.name} đã được thêm vào danh sách yêu thích`,
                            })
                          }}
                          className="p-1.5 hover:bg-amber-50 rounded-full transition z-10"
                          title={isFavorite(spa.id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                        >
                          <Heart 
                            className={`w-4 h-4 transition ${
                              isFavorite(spa.id) 
                                ? "text-amber-500 fill-amber-500" 
                                : "text-slate-400 hover:text-amber-500"
                            }`} 
                          />
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

      <Footer />
    </main>
  )
}
