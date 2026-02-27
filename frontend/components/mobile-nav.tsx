"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Bookmark,
  StickyNote,
  Sun,
  Moon,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/practice", label: "문제", icon: BookOpen },
  { href: "/review", label: "오답", icon: RotateCcw },
  { href: "/bookmarks", label: "북마크", icon: Bookmark },
  { href: "/notes", label: "노트", icon: StickyNote },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-sidebar py-1.5 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs text-muted-foreground transition-colors"
        aria-label="테마 변경"
      >
        {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span>{"테마"}</span>
      </button>
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs text-muted-foreground transition-colors"
        aria-label="로그아웃"
      >
        <LogOut className="h-4 w-4" />
        <span>로그아웃</span>
      </button>
    </nav>
  )
}
