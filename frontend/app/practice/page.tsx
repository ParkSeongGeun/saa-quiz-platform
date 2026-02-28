"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { QuestionCard } from "@/components/practice/question-card"
import { QuestionListSidebar } from "@/components/practice/question-list-sidebar"
import { domains as mockDomains, type Question } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Filter, ListOrdered, Loader2, ArrowRight } from "lucide-react"
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

function PracticeContent() {
  const { token, isLoading: authLoading } = useAuth()

  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') // 'bookmark', 'wrong', or null
  const startQuestionId = searchParams.get('start') // question ID to start with

  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<Question | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, "correct" | "wrong">>({})
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [jumpToQuestion, setJumpToQuestion] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    setLoading(true)
    try {
      let url = ''

      if (mode === 'bookmark') {
        url = `${API_URL}/api/flags/`
      } else if (mode === 'wrong') {
        url = `${API_URL}/api/wrong/`
      } else {
        const domainParam = selectedDomain ? reverseDomainMap[selectedDomain] : ''
        url = `${API_URL}/api/questions/${domainParam ? `?domain=${domainParam}` : ''}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions(data)

        const answered: Record<number, "correct" | "wrong"> = {}
        data.forEach((q: any) => {
          // Prioritize last_submission_correct over is_solved
          // This ensures the most recent attempt is shown, not just "ever solved"
          if (q.last_submission_correct === true) {
            answered[q.id] = "correct"
          } else if (q.last_submission_correct === false) {
            answered[q.id] = "wrong"
          }
          // If last_submission_correct is null/undefined, don't mark it
        })
        setAnsweredQuestions(answered)

        if (startQuestionId) {
          const startId = parseInt(startQuestionId)
          const startIndex = data.findIndex((q: any) => q.id === startId)
          setCurrentIndex(startIndex !== -1 ? startIndex : 0)
        } else {
          setCurrentIndex(0)
        }
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedDomain, mode, startQuestionId, API_URL, token])

  const fetchQuestionDetail = useCallback(async (id: number) => {
    if (!token) return;
    setDetailLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/questions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()

        if (data.last_submission_correct !== null && data.last_submission_correct !== undefined) {
          setAnsweredQuestions(prev => ({
            ...prev,
            [id]: data.last_submission_correct ? "correct" : "wrong"
          }))
        }

        const mappedQuestion: Question = {
          id: data.id,
          domain: domainMap[data.domain] || data.domain,
          domainKo: mockDomains.find(d => d.id === domainMap[data.domain])?.ko || data.domain,
          titleKo: data.question,
          options: data.options.map((o: any) => ({
            key: o.label,
            textKo: o.content
          })),
          correctAnswer: data.options
            .filter((o: any) => o.is_answer)
            .map((o: any) => o.label)
            .join(","),
          explanationKo: data.explanation || ""
        }
        setCurrentQuestionDetail(mappedQuestion)
      }
    } catch (error) {
      console.error("Failed to fetch question detail:", error)
    } finally {
      setDetailLoading(false)
    }
  }, [API_URL, token])

  useEffect(() => {
    if (!authLoading && token) {
      fetchQuestions()
    }
  }, [fetchQuestions, authLoading, token])

  useEffect(() => {
    if (!authLoading && token && questions.length > 0 && questions[currentIndex]) {
      fetchQuestionDetail(questions[currentIndex].id)
    } else if (!authLoading && token && questions.length === 0 && !loading) {
      setCurrentQuestionDetail(null)
    }
  }, [currentIndex, questions, fetchQuestionDetail, authLoading, token, loading])

  if (authLoading) {
    return (
      <AppShell>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  const handleAnswer = (questionId: number, isCorrect: boolean | null) => {
    setAnsweredQuestions(prev => {
      const newState = { ...prev }
      if (isCorrect === null || isCorrect === undefined) {
        delete newState[questionId]
      } else {
        newState[questionId] = isCorrect ? "correct" : "wrong"
      }
      return newState
    })
  }

  const handleJumpToQuestion = () => {
    const questionNum = parseInt(jumpToQuestion)
    if (isNaN(questionNum) || questionNum < 1) {
      alert("올바른 문제 번호를 입력하세요")
      return
    }

    const index = questions.findIndex(q => q.id === questionNum)
    if (index !== -1) {
      setCurrentIndex(index)
      setJumpToQuestion("")
    } else {
      alert(`문제 ${questionNum}번을 찾을 수 없습니다`)
    }
  }

  const progress = questions.length > 0
    ? (Object.keys(answeredQuestions).length / questions.length) * 100
    : 0

  return (
    <AppShell>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {mode === 'bookmark' ? '북마크 문제 풀기' : mode === 'wrong' ? '오답 문제 풀기' : '문제 풀기'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'bookmark'
                ? '북마크한 문제만 모아서 풀어보세요.'
                : mode === 'wrong'
                ? '틀린 문제만 모아서 다시 풀어보세요.'
                : 'AWS SAA 시험 연습 문제를 풀어보세요.'
              }
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

        {!mode && (
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
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{"진행률"}</span>
              <span className="text-primary font-medium">{Object.keys(answeredQuestions).length}/{questions.length} 완료</span>
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-secondary" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">문제 번호로 이동:</span>
          <Input
            type="number"
            min="1"
            max={questions.length}
            value={jumpToQuestion}
            onChange={(e) => setJumpToQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJumpToQuestion()}
            placeholder="번호 입력"
            className="w-24 h-8 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleJumpToQuestion}
            disabled={!jumpToQuestion}
            className="h-8 gap-1.5"
          >
            <span>이동</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="hidden w-60 shrink-0 lg:block">
            {loading ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <QuestionListSidebar
                questions={questions.map((q) => ({
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
                onSelect={setCurrentIndex}
              />
            )}
          </div>

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
                onAnswer={handleAnswer}
                solvedStatus={answeredQuestions[currentQuestionDetail.id] || null}
                mode={mode}
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

export default function PracticePage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppShell>
    }>
      <PracticeContent />
    </Suspense>
  )
}
