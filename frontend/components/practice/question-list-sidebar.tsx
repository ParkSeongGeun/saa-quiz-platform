"use client"

import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Minus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Question } from "@/lib/mock-data"

interface QuestionListSidebarProps {
  questions: Question[]
  currentIndex: number
  answeredQuestions: Record<number, "correct" | "wrong">
  onSelect: (index: number) => void
}

export function QuestionListSidebar({
  questions,
  currentIndex,
  answeredQuestions,
  onSelect,
}: QuestionListSidebarProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2.5">
        <h3 className="text-sm font-semibold text-card-foreground">{"문제 목록"}</h3>
        <p className="text-xs text-muted-foreground">
          {Object.keys(answeredQuestions).length} / {questions.length} {"완료"}
        </p>
      </div>
      <ScrollArea className="h-80">
        <div className="space-y-0.5 p-1.5">
          {questions.map((q, index) => {
            const status = answeredQuestions[q.id]
            return (
              <button
                key={q.id}
                onClick={() => onSelect(index)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                  currentIndex === index
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span className="shrink-0">
                  {status === "correct" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                  ) : status === "wrong" ? (
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground/50" />
                  )}
                </span>
                <span className="truncate text-xs">
                  Q{q.id}. {q.domainKo.slice(0, 12)}...
                </span>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
