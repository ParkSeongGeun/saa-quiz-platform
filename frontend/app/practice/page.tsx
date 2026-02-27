"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { QuestionCard } from "@/components/practice/question-card"
import { QuestionListSidebar } from "@/components/practice/question-list-sidebar"
import { domains as mockDomains, type Question } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Filter, ListOrdered, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Mapping between backend domain strings and frontend IDs
const domainMap: Record<string, string> = {
  "Resilience": "design-resilient",
  "Performance": "design-performant",
  "Security": "design-secure",
  "Cost": "design-cost",
}

const reverseDomainMap: Record<string, string> = {
  "design-resilient": "Resilience",
  "design-performant": "Performance",
  "design-secure": "Security",
  "design-cost": "Cost",
}

export default function PracticePage() {
  useAuth()

  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<Question | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, "correct" | "wrong">>({})
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const domainParam = selectedDomain ? reverseDomainMap[selectedDomain] : ''
      const url = `${API_URL}/api/questions/${domainParam ? `?domain=${domainParam}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedDomain, API_URL])

  const fetchQuestionDetail = useCallback(async (id: number) => {
    setDetailLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/questions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Map backend detail to frontend Question type
        const mappedQuestion: Question = {
          id: data.id,
          domain: domainMap[data.domain] || data.domain,
          domainKo: mockDomains.find(d => d.id === domainMap[data.domain])?.ko || data.domain,
          titleKo: data.question,
          options: data.options.map((o: any) => ({
            key: o.label,
            textKo: o.content
          })),
          correctAnswer: data.options.find((o: any) => o.is_answer)?.label || "A",
          explanationKo: data.explanation || ""
        }
        setCurrentQuestionDetail(mappedQuestion)
      }
    } catch (error) {
      console.error("Failed to fetch question detail:", error)
    } finally {
      setDetailLoading(false)
    }
  }, [API_URL])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      fetchQuestionDetail(questions[currentIndex].id)
    } else {
      setCurrentQuestionDetail(null)
    }
  }, [currentIndex, questions, fetchQuestionDetail])

  const progress = questions.length > 0 
    ? (Object.keys(answeredQuestions).length / questions.length) * 100 
    : 0

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
          {mockDomains.map((d) => (
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
            {loading ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <QuestionListSidebar
                questions={questions.map((q, idx) => ({
                  id: q.id,
                  domain: q.domain,
                  domainKo: mockDomains.find(d => d.id === domainMap[q.domain])?.ko || q.domain,
                  titleKo: q.question,
                  options: [], // Not needed for sidebar
                  correctAnswer: "",
                  explanationKo: ""
                }))}
                currentIndex={currentIndex}
                answeredQuestions={answeredQuestions}
                onSelect={setCurrentIndex}
              />
            )}
          </div>

          {/* Mobile question list */}
          {showList && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setShowList(false)}>
              <div className="fixed right-0 top-0 h-full w-72 border-l border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
                <QuestionListSidebar
                  questions={questions.map((q, idx) => ({
                    id: q.id,
                    domain: q.domain,
                    domainKo: mockDomains.find(d => d.id === domainMap[q.domain])?.ko || q.domain,
                    titleKo: q.question,
                    options: [],
                    correctAnswer: "",
                    explanationKo: ""
                  }))}
                  currentIndex={currentIndex}
                  answeredQuestions={answeredQuestions}
                  onSelect={(index) => { setCurrentIndex(index); setShowList(false) }}
                />
              </div>
            </div>
          )}

          {/* Question card */}
          <div className="flex-1">
            {loading || detailLoading ? (
              <Card className="flex h-[400px] items-center justify-center border-border bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </Card>
            ) : currentQuestionDetail ? (
              <QuestionCard
                question={currentQuestionDetail}
                currentIndex={currentIndex}
                totalCount={questions.length}
                onNext={() => setCurrentIndex(Math.min(currentIndex + 1, questions.length - 1))}
                onPrev={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
              />
            ) : (
              <Card className="flex h-[200px] flex-col items-center justify-center border-border bg-card text-center p-6">
                <p className="text-muted-foreground">{"문제를 불러올 수 없거나 조건에 맞는 문제가 없습니다."}</p>
                <Button variant="outline" className="mt-4" onClick={() => fetchQuestions()}>{"다시 시도"}</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

import { Card } from "@/components/ui/card"
