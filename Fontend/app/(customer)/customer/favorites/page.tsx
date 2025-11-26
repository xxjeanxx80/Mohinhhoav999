"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useFavorites } from "@/hooks/use-favorites"
import { SpaAvatar } from "@/components/spa-avatar"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

export default function CustomerFavorites() {
  const { favorites, loading, toggleFavorite } = useFavorites()
  const { t } = useLanguage()
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600" suppressHydrationWarning>{t.loadingFavorites}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900" suppressHydrationWarning>{t.favoritesTitle}</h1>
        <p className="mt-2 text-slate-600" suppressHydrationWarning>{t.favoritesDescription}</p>
      </div>

      {favorites.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Heart className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2" suppressHydrationWarning>{t.noFavoritesYet}</h3>
            <p className="text-slate-600 mb-6" suppressHydrationWarning>
              {t.noFavoritesDescription}
            </p>
            <Link href="/spas">
              <Button className="bg-amber-500 hover:bg-amber-600" suppressHydrationWarning>
                {t.exploreNow}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((spa) => (
            <Link key={spa.id} href={`/spas/${spa.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <SpaAvatar 
                        spaId={spa.id} 
                        spaName={spa.name} 
                        size="lg"
                        className="w-20 h-20"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{spa.name}</h3>
                      <p className="text-sm text-slate-600 mb-2" suppressHydrationWarning>{spa.address || t.noAddress}</p>
                      <div className="flex items-center gap-3">
                        {spa.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-slate-900">{spa.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <span className="text-xs text-slate-500" suppressHydrationWarning>{t.recentMonth}</span>
                      </div>
                    </div>
                    
                    {/* Heart Icon - Filled vì đã yêu thích */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          await toggleFavorite(spa.id)
                          toast({
                            title: "Đã xóa khỏi yêu thích",
                            description: `${spa.name} đã được xóa khỏi danh sách yêu thích`,
                          })
                        }}
                        className="p-2 hover:bg-red-50 rounded-full transition"
                        title={t.removeFromFavorites}
                        suppressHydrationWarning
                      >
                        <Heart className="w-5 h-5 text-amber-500 fill-amber-500 hover:text-red-500 hover:fill-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
