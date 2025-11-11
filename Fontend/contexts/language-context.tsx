"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Language, translations } from "@/lib/translations"
import { usePathname } from "next/navigation"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.VN
  isHydrated: boolean
  canChangeLanguage: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = "app_language"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // Check if user is on owner or admin pages
  const isOwnerOrAdmin = pathname?.startsWith("/owner") || pathname?.startsWith("/admin")
  
  // Force "US" for owner/admin, otherwise start with "VN"
  const [language, setLanguageState] = useState<Language>(isOwnerOrAdmin ? "US" : "VN")
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Force US for owner/admin pages
      if (isOwnerOrAdmin) {
        setLanguageState("US")
        setIsHydrated(true)
        return
      }
      
      // For customer/public pages, load from localStorage
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
      if (saved === "VN" || saved === "US") {
        setLanguageState(saved)
      }
      setIsHydrated(true)
    }
  }, [isOwnerOrAdmin])

  // Update language when pathname changes
  useEffect(() => {
    if (isOwnerOrAdmin) {
      setLanguageState("US")
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
      if (saved === "VN" || saved === "US") {
        setLanguageState(saved)
      }
    }
  }, [pathname, isOwnerOrAdmin])

  const setLanguage = (lang: Language) => {
    // Don't allow changing language on owner/admin pages
    if (isOwnerOrAdmin) {
      return
    }
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    }
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isHydrated,
    canChangeLanguage: !isOwnerOrAdmin,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Convenience hook for translations
export function useTranslation() {
  const { t } = useLanguage()
  return t
}

