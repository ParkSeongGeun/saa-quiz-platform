"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

const domainNameMap: Record<string, string> = {
  "Resilience": "복원력 있는 아키텍처 설계",
  "Performance": "고성능 아키텍처 설계",
  "Security": "보안 애플리케이션 설계",
  "Cost": "비용 최적화 아키텍처 설계",
}

export function DomainProgress() {
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchDomainStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setDomains(data.domain_progress)
        }
      } catch (error) {
        console.error("Failed to fetch domain stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDomainStats()
  }, [API_URL])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-card-foreground">
          {"영역별 학습 현황"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : domains.length > 0 ? (
          domains.map((domain) => (
            <div key={domain.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">
                  {domainNameMap[domain.name] || domain.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {domain.correct}/{domain.total} ({domain.progress}%)
                </span>
              </div>
              <Progress
                value={domain.progress}
                className="h-1.5 bg-secondary"
              />
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {"데이터가 없습니다."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
