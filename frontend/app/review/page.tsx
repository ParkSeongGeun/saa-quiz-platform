"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XCircle, ChevronDown, ChevronUp, RotateCcw, Lightbulb, Filter, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const domainNameMap: Record<string, string> = {
  "Resilience": "복원력",
  "Performance": "성능",
  "Security": "보안",
  "Cost": "비용",
}

export default function ReviewPage() {
  useAuth()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchWrongQuestions = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/wrong/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setQuestions(data)
        }
      } catch (error) {
        console.error("Failed to fetch wrong questions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWrongQuestions()
  }, [API_URL])

  const filtered = selectedDomain
    ? questions.filter((q) => q.domain === selectedDomain)
    : questions

  const uniqueDomains = Array.from(new Set(questions.map((q) => q.domain)))

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{"오답 노트"}</h1>
            <p className="text-sm text-muted-foreground">
              {"틀린 문제를 복습하고 정답을 확인하세요. 총 "}{questions.length}{"개의 오답이 있습니다."}
            </p>
          </div>
          <Link href="/practice?mode=wrong">
            <Button variant="outline" size="sm" className="gap-1.5 border-border text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-4 w-4" />
              {"오답 다시 풀기"}
            </Button>
          </Link>
        </div>

        {/* Domain filter */}
        {uniqueDomains.length > 0 && (
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
              {"전체"} ({questions.length})
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
                {domainNameMap[domain] || domain} ({questions.filter((q) => q.domain === domain).length})
              </Badge>
            ))}
          </div>
        )}

        {/* Wrong questions list */}
        <div className="space-y-2.5">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id

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
                          {domainNameMap[q.domain] || q.domain}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-card-foreground">
                        {q.question}
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
                      <p className="text-xs text-muted-foreground">
                        {"이 문제부터 오답 문제만 모아서 풀어보세요."}
                      </p>
                      <Link href={`/practice?mode=wrong&start=${q.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5" />
                          {"이 문제부터 풀기"}
                        </Button>
                      </Link>
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
            <p className="mt-1 text-sm text-muted-foreground/70">
              {selectedDomain ? "선택한 영역에 오답이 없습니다." : "모든 문제를 맞췄습니다!"}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
