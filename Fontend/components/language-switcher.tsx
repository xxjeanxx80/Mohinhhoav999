"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Language } from "@/lib/translations"
import { ChevronDown } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage, canChangeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Don't render if language change is not allowed
  if (!canChangeLanguage) {
    return null
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const languages: { code: Language; label: string; flag: string; flagColor: string }[] = [
    { code: "VN", label: "Tiếng Việt", flag: "VN", flagColor: "bg-red-600" },
    { code: "US", label: "English", flag: "US", flagColor: "bg-blue-600" },
  ]

  const currentLang = languages.find((lang) => lang.code === language) || languages[0]

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setIsOpen(false)
    // Reload page to apply translations
    window.location.reload()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition"
        aria-label="Change language"
      >
        <div className={`w-6 h-4 ${currentLang.flagColor} rounded flex items-center justify-center`}>
          <span className="text-xs text-white font-bold">{currentLang.flag}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-100 transition ${
                language === lang.code ? "bg-slate-50" : ""
              }`}
            >
              <div className={`w-6 h-4 ${lang.flagColor} rounded flex items-center justify-center`}>
                <span className="text-xs text-white font-bold">{lang.flag}</span>
              </div>
              <span className="text-sm text-slate-700">{lang.label}</span>
              {language === lang.code && (
                <span className="ml-auto text-red-600 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

