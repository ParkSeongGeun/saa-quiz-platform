"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const domainData = [
  { name: "복원력 있는 아키텍처 설계", progress: 85, total: 18, correct: 15 },
  { name: "고성능 아키텍처 설계", progress: 72, total: 16, correct: 11 },
  { name: "보안 애플리케이션 설계", progress: 60, total: 15, correct: 9 },
  { name: "비용 최적화 아키텍처 설계", progress: 55, total: 16, correct: 8 },
]

export function DomainProgress() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-card-foreground">
          {"영역별 학습 현황"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {domainData.map((domain) => (
          <div key={domain.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-card-foreground">{domain.name}</span>
              <span className="text-xs text-muted-foreground">
                {domain.correct}/{domain.total} ({domain.progress}%)
              </span>
            </div>
            <Progress
              value={domain.progress}
              className="h-1.5 bg-secondary"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
