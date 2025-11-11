"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showLink?: boolean
  variant?: "default" | "homepage"
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
}

export function Logo({ size = "md", className, showLink = false, variant = "default" }: LogoProps) {
  const logoContent = (
    <span className={cn("font-bold", sizeClasses[size], className)}>
      {variant === "homepage" ? (
        <>
          <span className="text-red-600">MOGG</span>
          <span className="text-orange-500">O</span>
        </>
      ) : (
        <>
          <span className="text-red-600">MOG</span>
          <span className="text-amber-600">GO</span>
        </>
      )}
    </span>
  )

  if (showLink) {
    return (
      <Link href="/" className="flex items-center">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

