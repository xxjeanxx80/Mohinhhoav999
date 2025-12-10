"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { translations } from "@/lib/translations"

// Simplified language context - English only
interface LanguageContextType {
  language: "US"
  t: typeof translations.US
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const value: LanguageContextType = {
    language: "US",
    t: translations.US,
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

export function useTranslation() {
  const { t } = useLanguage()
  return t
}

