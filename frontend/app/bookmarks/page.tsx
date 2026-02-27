"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkX, Filter, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const domainNameMap: Record<string, string> = {
  "Resilience": "복원력",
  "Performance": "성능",
  "Security": "보안",
  "Cost": "비용",
}

export default function BookmarksPage() {
  useAuth()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/flags/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [API_URL])

  const removeBookmark = async (questionId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/flags/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question_id: questionId })
      })

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId))
      }
    } catch (error) {
      console.error("Failed to remove bookmark:", error)
    }
  }

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
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{"북마크"}</h1>
          <p className="text-sm text-muted-foreground">
            {"헷갈리거나 복습이 필요한 문제를 모아두었습니다. 총 "}{questions.length}{"개"}
          </p>
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

        {/* Bookmarked list */}
        <div className="space-y-2.5">
          {filtered.map((q) => (
            <Card key={q.id} className="border-border bg-card transition-all hover:border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bookmark className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-primary">Q{q.id}</span>
                      <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                        {domainNameMap[q.domain] || q.domain}
                      </Badge>
                      {q.is_solved && (
                        <Badge variant="outline" className="border-success/50 bg-success/10 text-xs text-success">
                          {"풀이 완료"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-card-foreground">
                      {q.question}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/practice?mode=bookmark&start=${q.id}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        {"풀기"}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => removeBookmark(q.id)}
                    >
                      <BookmarkX className="h-3.5 w-3.5" />
                      {"제거"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bookmark className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-base font-medium text-muted-foreground">{"북마크가 없습니다"}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {selectedDomain ? "선택한 영역에 북마크가 없습니다." : "문제 풀이 중 북마크를 추가해보세요."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
