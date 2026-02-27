"use client"

import { AppShell } from "@/components/app-shell"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { DomainProgress } from "@/components/dashboard/domain-progress"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
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
        <StatsCards />

        <div className="grid gap-4 lg:grid-cols-2">
          <DomainProgress />
          <RecentActivity />
        </div>
      </div>
    </AppShell>
  )
}
