"use client"

import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { DomainProgress } from "@/components/dashboard/domain-progress"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!token) return null

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {"AWS SAA 대시보드"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {"학습 현황을 한눈에 확인하고 빠르게 시작하세요."}
          </p>
        </div>

        <QuickActions />

        <div>
          <DomainProgress />
        </div>
      </div>
    </AppShell>
  )
}
