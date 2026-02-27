"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className="pb-16 md:ml-60 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-5">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
