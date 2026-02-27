"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, RotateCcw, Bookmark } from "lucide-react"

const actions = [
  {
    href: "/practice",
    label: "문제 풀기 시작",
    description: "처음부터 순서대로 풀기",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/20",
  },
  {
    href: "/review",
    label: "오답 복습하기",
    description: "틀린 문제 다시 풀기",
    icon: RotateCcw,
    color: "text-destructive",
    bg: "bg-destructive/10 hover:bg-destructive/20",
  },
  {
    href: "/bookmarks",
    label: "북마크 확인",
    description: "저장한 문제 복습하기",
    icon: Bookmark,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/20",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="h-full cursor-pointer border-border bg-card transition-colors hover:border-primary/30">
            <CardContent className="flex flex-col items-center p-3.5 text-center">
              <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${action.bg} transition-colors`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <p className="text-sm font-semibold text-card-foreground">{action.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
