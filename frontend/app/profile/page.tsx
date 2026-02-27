"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Calendar,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Flame,
  CheckCircle,
  XCircle,
  Bookmark,
  StickyNote,
} from "lucide-react"

const studyStreak = [
  { day: "월", active: true },
  { day: "화", active: true },
  { day: "수", active: true },
  { day: "목", active: false },
  { day: "금", active: true },
  { day: "토", active: true },
  { day: "일", active: false },
]

const domainScores = [
  { name: "복원력 있는 아키텍처 설계", score: 85, color: "bg-chart-1" },
  { name: "고성능 아키텍처 설계", score: 72, color: "bg-chart-2" },
  { name: "보안 애플리케이션 설계", score: 60, color: "bg-chart-3" },
  { name: "비용 최적화 아키텍처 설계", score: 55, color: "bg-chart-4" },
]

const achievements = [
  { label: "첫 문제 풀기", description: "첫 번째 문제를 풀었습니다", unlocked: true },
  { label: "10문제 연속 정답", description: "연속으로 10문제를 맞추었습니다", unlocked: true },
  { label: "오답 정복자", description: "오답 노트의 모든 문제를 다시 풀었습니다", unlocked: true },
  { label: "완벽한 한 주", description: "일주일 동안 매일 학습했습니다", unlocked: false },
  { label: "전 영역 80%+", description: "모든 영역에서 80% 이상 달성", unlocked: false },
  { label: "시험 준비 완료", description: "모든 문제를 풀고 복습까지 완료", unlocked: false },
]

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{"프로필"}</h1>
          <p className="text-sm text-muted-foreground">
            {"학습 통계와 성과를 확인하세요."}
          </p>
        </div>

        {/* User info */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-16 w-16 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                  JK
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-card-foreground">{"김준호"}</h2>
                <p className="text-sm text-muted-foreground">junho.kim@example.com</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {"가입: 2026.01.15"}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
                    <Target className="h-3 w-3" />
                    {"목표: 2026.04.01 시험"}
                  </Badge>
                  <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                    <Flame className="h-3 w-3" />
                    {"5일 연속 학습"}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
                {"설정"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {[
            { icon: BookOpen, label: "풀이 문제", value: "42", color: "text-primary" },
            { icon: CheckCircle, label: "정답", value: "33", color: "text-success" },
            { icon: XCircle, label: "오답", value: "9", color: "text-destructive" },
            { icon: Clock, label: "총 학습 시간", value: "18h", color: "text-info" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Weekly streak */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                <Flame className="h-4 w-4 text-primary" />
                {"이번 주 학습 현황"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-around">
                {studyStreak.map((day) => (
                  <div key={day.day} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                        day.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {day.day}
                    </div>
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        day.active ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Domain scores */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {"영역별 정답률"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {domainScores.map((domain) => (
                <div key={domain.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground">{domain.name}</span>
                    <span className="text-sm font-semibold text-card-foreground">{domain.score}%</span>
                  </div>
                  <Progress value={domain.score} className="h-1.5 bg-secondary" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-3">
              <Bookmark className="h-4 w-4 text-primary" />
              <div>
                <p className="text-base font-bold text-card-foreground">12</p>
                <p className="text-xs text-muted-foreground">{"북마크"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-3">
              <StickyNote className="h-4 w-4 text-info" />
              <div>
                <p className="text-base font-bold text-card-foreground">5</p>
                <p className="text-xs text-muted-foreground">{"노트"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-3">
              <Target className="h-4 w-4 text-success" />
              <div>
                <p className="text-base font-bold text-card-foreground">78%</p>
                <p className="text-xs text-muted-foreground">{"전체 정답률"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-base font-bold text-card-foreground">+5%</p>
                <p className="text-xs text-muted-foreground">{"이번 주 성장"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <Award className="h-4 w-4 text-primary" />
              {"업적"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.label}
                  className={`flex items-start gap-2.5 rounded-lg border p-3 transition-colors ${
                    achievement.unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-secondary/20 opacity-50"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      achievement.unlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${achievement.unlocked ? "text-card-foreground" : "text-muted-foreground"}`}>
                      {achievement.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
