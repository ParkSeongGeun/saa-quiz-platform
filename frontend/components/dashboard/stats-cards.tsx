"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, CheckCircle, XCircle, Bookmark, TrendingUp, Target } from "lucide-react"

const stats = [
  {
    label: "총 문제 수",
    value: "65",
    sub: "4개 영역",
    icon: BookOpen,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    label: "풀이 완료",
    value: "42",
    sub: "64.6%",
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "정답률",
    value: "78%",
    sub: "+5% 이번 주",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "오답 문제",
    value: "9",
    sub: "복습 필요",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    label: "정답 문제",
    value: "33",
    sub: "정답 유지",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "북마크",
    value: "12",
    sub: "복습 대기",
    icon: Bookmark,
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className={`mt-0.5 text-xs ${stat.color}`}>{stat.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
