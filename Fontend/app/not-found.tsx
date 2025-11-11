"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/main-header"
import { Home, LogOut } from "lucide-react"
import { clearAuthData } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

/**
 * Custom 404 Not Found page
 * Allows users to logout even when on a 404 page
 */
export default function NotFound() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogout = () => {
    clearAuthData()
    router.push("/")
    router.refresh()
    // Force hard reload to ensure cookies are cleared
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader currentPath="/404" />
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-9xl font-bold text-red-600 mb-4" suppressHydrationWarning>{t.notFound}</h1>
          <h2 className="text-3xl font-semibold text-slate-900 mb-4" suppressHydrationWarning>
            {t.pageNotFound}
          </h2>
          <p className="text-slate-600 mb-8" suppressHydrationWarning>
            {t.pageNotFoundDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto" suppressHydrationWarning>
                <Home className="mr-2 h-4 w-4" />
                {t.backToHome}
              </Button>
            </Link>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto"
              suppressHydrationWarning
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t.logout}
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4" suppressHydrationWarning>
              {t.ifYouHaveProblems}
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/logout" className="text-sm text-red-600 hover:underline" suppressHydrationWarning>
                {t.clearLoginData}
              </Link>
              <Link href="/spas" className="text-sm text-slate-600 hover:underline" suppressHydrationWarning>
                {t.viewSpaList}
              </Link>
              <Link href="/blog" className="text-sm text-slate-600 hover:underline" suppressHydrationWarning>
                {t.viewBlog}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

