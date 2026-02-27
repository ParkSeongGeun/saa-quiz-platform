"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Bookmark, StickyNote } from "lucide-react"

const activities = [
  {
    type: "correct",
    icon: CheckCircle,
    message: "문제 #5 정답 처리됨",
    detail: "복원력 있는 아키텍처 설계",
    time: "2분 전",
    color: "text-success",
  },
  {
    type: "wrong",
    icon: XCircle,
    message: "문제 #3 오답 처리됨",
    detail: "보안 애플리케이션 설계",
    time: "5분 전",
    color: "text-destructive",
  },
  {
    type: "bookmark",
    icon: Bookmark,
    message: "문제 #6 북마크에 추가",
    detail: "보안 애플리케이션 설계",
    time: "8분 전",
    color: "text-primary",
  },
  {
    type: "note",
    icon: StickyNote,
    message: "문제 #4에 메모 추가",
    detail: "비용 최적화 아키텍처 설계",
    time: "15분 전",
    color: "text-info",
  },
  {
    type: "correct",
    icon: CheckCircle,
    message: "문제 #2 정답 처리됨",
    detail: "고성능 아키텍처 설계",
    time: "20분 전",
    color: "text-success",
  },
]

export function RecentActivity() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-card-foreground">
          {"최근 활동"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/30 p-2.5"
          >
            <activity.icon className={`mt-0.5 h-4 w-4 shrink-0 ${activity.color}`} />
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium text-card-foreground">{activity.message}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                  {activity.detail}
                </Badge>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
