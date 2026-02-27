"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Lightbulb,
  Filter,
} from "lucide-react"
import { questions } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const wrongQuestionIds = [3, 4, 6]
const wrongQuestions = questions.filter((q) => wrongQuestionIds.includes(q.id))

const wrongAnswerMap: Record<number, string> = {
  3: "A",
  4: "C",
  6: "C",
}

export default function ReviewPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  const filtered = selectedDomain
    ? wrongQuestions.filter((q) => q.domainKo === selectedDomain)
    : wrongQuestions

  const uniqueDomains = Array.from(new Set(wrongQuestions.map((q) => q.domainKo)))

  return (
    <AppShell>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{"오답 노트"}</h1>
            <p className="text-sm text-muted-foreground">
              {"틀린 문제를 복습하고 정답을 확인하세요. 총 "}{wrongQuestions.length}{"개의 오답이 있습니다."}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 border-border text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-4 w-4" />
            {"오답 다시 풀기"}
          </Button>
        </div>

        {/* Domain filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              !selectedDomain
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setSelectedDomain(null)}
          >
            {"전체"} ({wrongQuestions.length})
          </Badge>
          {uniqueDomains.map((domain) => (
            <Badge
              key={domain}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors",
                selectedDomain === domain
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setSelectedDomain(domain)}
            >
              {domain} ({wrongQuestions.filter((q) => q.domainKo === domain).length})
            </Badge>
          ))}
        </div>

        {/* Wrong questions list */}
        <div className="space-y-2.5">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id
            const userAnswer = wrongAnswerMap[q.id]

            return (
              <Card key={q.id} className="border-border bg-card">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-primary">Q{q.id}</span>
                        <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                          {q.domainKo}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-card-foreground">
                        {q.titleKo}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-2.5 border-t border-border px-4 pb-4 pt-3">
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const isCorrectOption = opt.key === q.correctAnswer
                          const isUserAnswer = opt.key === userAnswer

                          return (
                            <div
                              key={opt.key}
                              className={cn(
                                "flex items-start gap-3 rounded-lg border p-2.5 text-sm",
                                isCorrectOption
                                  ? "border-success/50 bg-success/10"
                                  : isUserAnswer
                                    ? "border-destructive/50 bg-destructive/10"
                                    : "border-border bg-secondary/20 opacity-60"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold",
                                  isCorrectOption
                                    ? "bg-success text-success-foreground"
                                    : isUserAnswer
                                      ? "bg-destructive text-destructive-foreground"
                                      : "bg-secondary text-muted-foreground"
                                )}
                              >
                                {opt.key}
                              </span>
                              <span className="text-card-foreground">
                                {opt.textKo}
                              </span>
                              {isUserAnswer && !isCorrectOption && (
                                <span className="ml-auto shrink-0 text-xs text-destructive">{"내 답변"}</span>
                              )}
                              {isCorrectOption && (
                                <span className="ml-auto shrink-0 text-xs text-success">{"정답"}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-start gap-2 rounded-lg bg-card p-3 border border-border">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-sm leading-relaxed text-card-foreground">
                          {q.explanationKo}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-base font-medium text-muted-foreground">{"오답이 없습니다"}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">{"선택한 영역에 오답이 없습니다."}</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
