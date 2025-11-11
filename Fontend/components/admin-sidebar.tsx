"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Store, 
  Gift, 
  FileText, 
  Settings, 
  LogOut,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Megaphone,
  Folder,
  Shield
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
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
    label: "Spas Management",
    icon: Store,
    items: [
      { href: "/admin/approve-spas", label: "Approve Spas", icon: CheckCircle },
    ],
  },
  {
    label: "User Management",
    icon: Users,
    items: [
      { href: "/admin/owners", label: "Owners", icon: Store },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    label: "Bookings",
    icon: Calendar,
    items: [
      { href: "/admin/bookings", label: "All Bookings", icon: Calendar },
    ],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    items: [
      { href: "/admin/campaigns", label: "Campaigns", icon: Gift },
      { href: "/admin/promotions", label: "Promotions", icon: Gift },
    ],
  },
  {
    label: "Financial",
    icon: DollarSign,
    items: [
      { href: "/admin/payouts", label: "Payouts", icon: DollarSign },
    ],
  },
  {
    label: "Content Management",
    icon: Folder,
    items: [
      { href: "/admin/cms", label: "CMS", icon: FileText },
      { href: "/admin/homepage", label: "Homepage", icon: LayoutDashboard },
      { href: "/admin/moderation", label: "Moderation", icon: AlertCircle },
    ],
  },
  {
    label: "System",
    icon: Shield,
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: AlertCircle },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  
  // Track which groups are open (default: open if current path is in that group)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    menuGroups.forEach((group) => {
      // Open group if any of its items match current pathname
      initial[group.label] = group.items.some(item => pathname === item.href || pathname?.startsWith(item.href))
    })
    return initial
  })

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

  return (
    <aside className="hidden lg:block w-64 border-r border-slate-200 bg-white flex-shrink-0">
      <div className="flex h-16 items-center justify-center border-b border-slate-200 px-4 lg:px-6">
        <Link href="/admin" className="flex items-center justify-center">
          <Logo size="lg" showLink={false} variant="homepage" />
        </Link>
      </div>

      <nav className="space-y-1 px-3 py-6">
        {/* Dashboard - Standalone */}
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/admin" ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>

        {/* User Profile - Standalone */}
        <Link
          href="/admin/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/admin/profile" ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          <Users className="h-5 w-5" />
          User Profile
        </Link>

        {/* Menu Groups */}
        {menuGroups.map((group) => {
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
                  const isItemActive = pathname === item.href
                  
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
