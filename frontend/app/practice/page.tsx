"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { QuestionCard } from "@/components/practice/question-card"
import { QuestionListSidebar } from "@/components/practice/question-list-sidebar"
import { questions, domains } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Filter, ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, "correct" | "wrong">>({})
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)

  const filteredQuestions = selectedDomain
    ? questions.filter((q) => q.domain === selectedDomain)
    : questions

  const currentQuestion = filteredQuestions[currentIndex]
  const progress = (Object.keys(answeredQuestions).length / filteredQuestions.length) * 100

  return (
    <AppShell>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{"문제 풀기"}</h1>
            <p className="text-sm text-muted-foreground">
              {"AWS SAA 시험 연습 문제를 풀어보세요."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 border-border text-muted-foreground hover:text-foreground md:hidden",
              showList && "border-primary/50 text-primary"
            )}
            onClick={() => setShowList(!showList)}
          >
            <ListOrdered className="h-4 w-4" />
            {"목록"}
          </Button>
        </div>

        {/* Domain Filter */}
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
            onClick={() => { setSelectedDomain(null); setCurrentIndex(0) }}
          >
            {"전체"}
          </Badge>
          {domains.map((d) => (
            <Badge
              key={d.id}
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors",
                selectedDomain === d.id
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              onClick={() => { setSelectedDomain(d.id); setCurrentIndex(0) }}
            >
              {d.ko}
            </Badge>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{"진행률"}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-secondary" />
        </div>

        {/* Main content */}
        <div className="flex gap-4">
          {/* Question list - desktop sidebar */}
          <div className="hidden w-60 shrink-0 lg:block">
            <QuestionListSidebar
              questions={filteredQuestions}
              currentIndex={currentIndex}
              answeredQuestions={answeredQuestions}
              onSelect={setCurrentIndex}
            />
          </div>

          {/* Mobile question list */}
          {showList && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setShowList(false)}>
              <div className="fixed right-0 top-0 h-full w-72 border-l border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
                <QuestionListSidebar
                  questions={filteredQuestions}
                  currentIndex={currentIndex}
                  answeredQuestions={answeredQuestions}
                  onSelect={(index) => { setCurrentIndex(index); setShowList(false) }}
                />
              </div>
            </div>
          )}

          {/* Question card */}
          <div className="flex-1">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalCount={filteredQuestions.length}
                onNext={() => setCurrentIndex(Math.min(currentIndex + 1, filteredQuestions.length - 1))}
                onPrev={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
