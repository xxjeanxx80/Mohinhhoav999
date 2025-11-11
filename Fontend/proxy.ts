import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value
  const role = req.cookies.get("role")?.value
  const path = req.nextUrl.pathname

  // Allow logout route to work from anywhere (including 404 pages)
  if (path === "/logout") {
    return NextResponse.next()
  }

  // Redirect OWNER from public pages to their dashboard
  if (role === "OWNER" && (path === "/" || path === "/spas" || path.startsWith("/spas/"))) {
    return NextResponse.redirect(new URL("/owner", req.url))
  }

  // Redirect ADMIN from public pages to their dashboard
  if (role === "ADMIN" && (path === "/" || path === "/spas" || path.startsWith("/spas/"))) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  // Check if user is trying to access protected routes
  if ((path.startsWith("/admin") || path.startsWith("/owner") || path.startsWith("/customer")) && !token) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Handle role-based access control
  if (path.startsWith("/admin") && role !== "ADMIN") {
    // If user has a role but it's not ADMIN, redirect to their dashboard
    if (role) {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, req.url))
    }
    // If no role, redirect to homepage
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (path.startsWith("/owner") && role !== "OWNER") {
    if (role) {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, req.url))
    }
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (path.startsWith("/customer") && role !== "CUSTOMER") {
    if (role) {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, req.url))
    }
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
}

