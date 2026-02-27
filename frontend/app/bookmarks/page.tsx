"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bookmark,
  BookmarkX,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Filter,
} from "lucide-react"
import { questions } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const initialBookmarkedIds = [1, 3, 5, 6, 8]

export default function BookmarksPage() {
  useAuth()

  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(initialBookmarkedIds)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  const bookmarkedQuestions = questions.filter((q) => bookmarkedIds.includes(q.id))

  const filtered = selectedDomain
    ? bookmarkedQuestions.filter((q) => q.domainKo === selectedDomain)
    : bookmarkedQuestions

  const uniqueDomains = Array.from(new Set(bookmarkedQuestions.map((q) => q.domainKo)))

  const removeBookmark = (id: number) => {
    setBookmarkedIds((prev) => prev.filter((bid) => bid !== id))
  }

  return (
    <AppShell>
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{"북마크"}</h1>
          <p className="text-sm text-muted-foreground">
            {"헷갈리거나 복습이 필요한 문제를 모아두었습니다. 총 "}{bookmarkedIds.length}{"개"}
          </p>
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
            {"전체"} ({bookmarkedQuestions.length})
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
              {domain} ({bookmarkedQuestions.filter((q) => q.domainKo === domain).length})
            </Badge>
          ))}
        </div>

        {/* Bookmarked list */}
        <div className="space-y-2.5">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id

            return (
              <Card key={q.id} className="border-border bg-card transition-all hover:border-primary/20">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <Bookmark className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
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
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeBookmark(q.id) }}
                      >
                        <BookmarkX className="h-4 w-4" />
                      </Button>
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
                          return (
                            <div
                              key={opt.key}
                              className={cn(
                                "flex items-start gap-3 rounded-lg border p-2.5 text-sm",
                                isCorrectOption
                                  ? "border-success/50 bg-success/10"
                                  : "border-border bg-secondary/20 opacity-70"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold",
                                  isCorrectOption
                                    ? "bg-success text-success-foreground"
                                    : "bg-secondary text-muted-foreground"
                                )}
                              >
                                {opt.key}
                              </span>
                              <span className="text-card-foreground">
                                {opt.textKo}
                              </span>
                              {isCorrectOption && (
                                <span className="ml-auto shrink-0 text-xs text-success">{"정답"}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
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
            <Bookmark className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-base font-medium text-muted-foreground">{"북마크가 없습니다"}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {"문제 풀이 중 북마크 버튼을 눌러 저장하세요."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
