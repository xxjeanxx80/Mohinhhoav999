"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Calendar, 
  Briefcase, 
  Users, 
  Gift, 
  Settings, 
  LogOut, 
  Clock, 
  Building2, 
  DollarSign, 
  FileText, 
  CalendarDays, 
  User,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Shield,
  MessageSquare
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { ownerAPI } from "@/lib/api-service"
import { Logo } from "@/components/brand/logo"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface MenuItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "Bookings",
    icon: Calendar,
    items: [
      { href: "/owner/bookings", label: "All Bookings", icon: Calendar },
    ],
  },
  {
    label: "Services",
    icon: Briefcase,
    items: [
      { href: "/owner/services", label: "Manage Services", icon: Briefcase },
    ],
  },
  {
    label: "Staff Management",
    icon: Users,
    items: [
      { href: "/owner/staff", label: "Staff", icon: Users },
      { href: "/owner/staff/shifts", label: "Staff Shifts", icon: Clock },
      { href: "/owner/staff/time-off", label: "Time Off", icon: CalendarDays },
    ],
  },
  {
    label: "Customer Management",
    icon: Users,
    items: [
      { href: "/owner/customers", label: "Customers", icon: Users },
      { href: "/owner/feedbacks", label: "Feedbacks", icon: MessageSquare },
    ],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    items: [
      { href: "/owner/promotions", label: "Promotions", icon: Gift },
      { href: "/owner/posts", label: "Posts", icon: FileText },
    ],
  },
  {
    label: "Financial",
    icon: DollarSign,
    items: [
      { href: "/owner/payouts", label: "Payouts", icon: DollarSign },
    ],
  },
  {
    label: "System",
    icon: Shield,
    items: [
      { href: "/owner/settings", label: "Settings", icon: Settings },
    ],
  },
]

const registerSpaItem = { href: "/owner/spa/register", label: "Register Spa", icon: Building2 }

export function OwnerSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const [hasSpa, setHasSpa] = useState(false)
  
  // Track which groups are open (default: open if current path is in that group)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    menuGroups.forEach((group) => {
      // Open group if any of its items match current pathname
      initial[group.label] = group.items.some(item => pathname === item.href || pathname?.startsWith(item.href))
    })
    return initial
  })

  useEffect(() => {
    const checkSpa = async () => {
      try {
        const res = await ownerAPI.getMySpas()
        const spas = res.data?.data || res.data || []
        setHasSpa(Array.isArray(spas) && spas.length > 0)
      } catch (error) {
        console.error("Failed to check spa:", error)
        setHasSpa(false)
      }
    }
    checkSpa()
  }, [pathname])

  // Update open groups when pathname changes
  useEffect(() => {
    const newOpenGroups: Record<string, boolean> = {}
    menuGroups.forEach((group) => {
      newOpenGroups[group.label] = group.items.some(item => pathname === item.href || pathname?.startsWith(item.href))
    })
    setOpenGroups(newOpenGroups)
  }, [pathname])

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }))
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Check if any item in a group is active
  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => pathname === item.href || pathname?.startsWith(item.href))
  }

  // Nếu đang ở trang register → CHỈ HIỆN Register Spa
  const isOnRegisterPage = pathname?.includes('/spa/register')
  const showMenuGroups = !isOnRegisterPage && hasSpa

  return (
    <aside className="hidden lg:block w-64 border-r border-slate-200 bg-white flex-shrink-0">
      <div className="flex h-16 items-center justify-center border-b border-slate-200 px-4 lg:px-6">
        <Link href="/owner" className="flex items-center justify-center">
          <Logo size="lg" showLink={false} variant="homepage" />
        </Link>
      </div>

      <nav className="space-y-1 px-3 py-6">
        {/* Dashboard - Standalone */}
        {!isOnRegisterPage && (
          <Link
            href="/owner"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/owner" ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
        )}

        {/* User Profile - Standalone */}
        {!isOnRegisterPage && (
          <Link
            href="/owner/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/owner/profile" ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <User className="h-5 w-5" />
            User Profile
          </Link>
        )}

        {/* Register Spa - Show if no spa or on register page */}
        {(!hasSpa || isOnRegisterPage) && (
          <Link
            href="/owner/spa/register"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/owner/spa/register" ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Building2 className="h-5 w-5" />
            Register Spa
          </Link>
        )}

        {/* Menu Groups - Only show if has spa and not on register page */}
        {showMenuGroups && menuGroups.map((group) => {
          const GroupIcon = group.icon
          const isOpen = openGroups[group.label] ?? false
          const isActive = isGroupActive(group)
          
          return (
            <Collapsible
              key={group.label}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.label)}
            >
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <div className="flex items-center gap-3">
                  <GroupIcon className="h-5 w-5" />
                  {group.label}
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const ItemIcon = item.icon
                  const isItemActive = pathname === item.href || pathname?.startsWith(item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 pl-11 text-sm font-medium transition-colors",
                        isItemActive 
                          ? "bg-red-50 text-red-600" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <ItemIcon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
