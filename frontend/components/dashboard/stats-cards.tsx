"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, CheckCircle, XCircle, Bookmark, TrendingUp, Target, Loader2 } from "lucide-react"

export function StatsCards() {
  const [statsData, setStatsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/stats/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setStatsData(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [API_URL])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border bg-card animate-pulse">
            <CardContent className="p-3 h-24 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: "총 문제 수",
      value: statsData?.total_questions || "0",
      sub: "전체 영역",
      icon: BookOpen,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "풀이 완료",
      value: statsData?.solved_count || "0",
      sub: `${Math.round((statsData?.solved_count / statsData?.total_questions) * 100) || 0}%`,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "정답률",
      value: `${statsData?.accuracy || 0}%`,
      sub: "전체 시도 대비",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "오답 문제",
      value: statsData?.wrong_count || "0",
      sub: "복습 필요",
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "정답 문제",
      value: statsData?.correct_count || "0",
      sub: "풀이 완료",
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "북마크",
      value: statsData?.bookmark_count || "0",
      sub: "관심 문제",
      icon: Bookmark,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

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
