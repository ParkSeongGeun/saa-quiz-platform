"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  StickyNote,
  Lightbulb,
  Loader2,
  RotateCcw,
} from "lucide-react"
import type { Question } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: Question
  currentIndex: number
  totalCount: number
  onNext: () => void
  onPrev: () => void
  onAnswer?: (questionId: number, isCorrect: boolean | null) => void
  isSolved?: boolean
  mode?: string | null
}

export function QuestionCard({
  question,
  currentIndex,
  totalCount,
  onNext,
  onPrev,
  onAnswer,
  isSolved,
  mode,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [apiResultCorrect, setApiResultCorrect] = useState<boolean | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [note, setNote] = useState("")
  const [showNote, setShowNote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the API result if available, otherwise fallback to local check
  const isCorrect = apiResultCorrect !== null ? apiResultCorrect : selectedAnswer === question.correctAnswer
  const isSubmitted = (selectedAnswer !== null && showExplanation) || isSolved

  // Sync isSolved state to local UI when question changes
  useEffect(() => {
    if (isSolved) {
      setShowExplanation(true)
    } else {
      setShowExplanation(false)
      setSelectedAnswer(null)
      setApiResultCorrect(null)
    }
  }, [isSolved, question.id])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Fetch initial bookmark state
  useEffect(() => {
    const fetchBookmarkState = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/flags/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const bookmarks = await response.json()
          const isBookmarked = bookmarks.some((b: any) => b.id === question.id)
          setIsBookmarked(isBookmarked)
        }
      } catch (error) {
        console.error("Failed to fetch bookmark state:", error)
      }
    }
    fetchBookmarkState()
  }, [question.id, API_URL])

  // Fetch existing note when note section is opened
  useEffect(() => {
    if (showNote) {
      const fetchNote = async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${API_URL}/api/tips/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const notes = await response.json()
            const existingNote = notes.find((n: any) => n.question_id === question.id)
            if (existingNote) {
              setNote(existingNote.tip_text)
            }
          }
        } catch (error) {
          console.error("Failed to fetch note:", error)
        }
      }
      fetchNote()
    }
  }, [showNote, question.id, API_URL])

  const handleSubmit = async () => {
    if (selectedAnswer) {
      setIsSubmitting(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/submit/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            question_id: question.id,
            selected_labels: [selectedAnswer]
          })
        })

        if (response.ok) {
          const data = await response.json()
          setApiResultCorrect(data.is_correct)
          setShowExplanation(true)
          // Notify parent component of answer result directly from backend
          if (onAnswer) {
            onAnswer(question.id, data.is_correct)
          }
        } else {
          // If API fails with non-200, fallback to local
          setShowExplanation(true)
          if (onAnswer) onAnswer(question.id, selectedAnswer === question.correctAnswer)
        }
      } catch (error) {
        console.error("Failed to submit answer:", error)
        // Fallback to local behavior if API fails completely
        setShowExplanation(true)
        if (onAnswer) onAnswer(question.id, selectedAnswer === question.correctAnswer)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token')
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`${API_URL}/api/flags/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ question_id: question.id })
        })
        if (response.ok || response.status === 204) {
          setIsBookmarked(false)
        }
      } else {
        // Add bookmark
        const response = await fetch(`${API_URL}/api/flags/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ question_id: question.id })
        })
        if (response.ok) {
          setIsBookmarked(true)
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
    }
  }

  const handleSaveNote = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/tips/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: question.id,
          tip_text: note
        })
      })
      if (response.ok) {
        alert("노트가 저장되었습니다!")
      }
    } catch (error) {
      console.error("Failed to save note:", error)
      alert("노트 저장에 실패했습니다.")
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    setApiResultCorrect(null)
    setShowNote(false)
    onNext()
  }

  const handlePrev = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    setApiResultCorrect(null)
    setShowNote(false)
    onPrev()
  }

  const handleReset = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/submit/${question.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok || response.status === 204) {
        // Reset local state
        setSelectedAnswer(null)
        setShowExplanation(false)
        setApiResultCorrect(null)
        
        // Notify parent to remove the checkmark/X from sidebar
        // We use a custom status if needed, but here we just pass null-like state
        if (onAnswer) {
          // Sending a specific signal to clear
          // PracticePage's handleAnswer can be adapted or we can just send false/true
          // Let's modify handleAnswer slightly later if needed, but for now:
          // We'll call it with a way that triggers state removal.
          // An elegant way is to refresh the answeredQuestions state in parent.
          onAnswer(question.id, undefined as any) 
        }
      }
    } catch (error) {
      console.error("Failed to reset question progress:", error)
    }
  }

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border text-muted-foreground">
            {currentIndex + 1} / {totalCount}
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">
            {question.domainKo}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {isSubmitted && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive transition-colors"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{"다시 풀기"}</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 border-border text-muted-foreground hover:text-foreground",
              showNote && "border-info/50 text-info"
            )}
            onClick={() => setShowNote(!showNote)}
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{"메모"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 border-border text-muted-foreground hover:text-foreground",
              isBookmarked && "border-primary/50 text-primary"
            )}
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isBookmarked ? "북마크됨" : "북마크"}
            </span>
          </Button>
        </div>
      </div>

      {/* Question */}
      <Card className="border-border bg-card">
        <CardHeader className="px-4 pt-4 pb-3">
          <h2 className="text-sm font-semibold leading-relaxed text-card-foreground md:text-base">
            <span className="mr-2 text-primary">Q{question.id}.</span>
            {question.titleKo}
          </h2>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.key
            const isCorrectOption = option.key === question.correctAnswer

            let optionStyle = "border-border bg-secondary/30 hover:border-muted-foreground/50"
            if (isSubmitted) {
              if (isCorrectOption) {
                optionStyle = "border-success/50 bg-success/10"
              } else if (isSelected && !isCorrect) {
                optionStyle = "border-destructive/50 bg-destructive/10"
              } else {
                optionStyle = "border-border bg-secondary/20 opacity-60"
              }
            } else if (isSelected) {
              optionStyle = "border-primary/50 bg-primary/10"
            }

            return (
              <button
                key={option.key}
                onClick={() => !isSubmitted && setSelectedAnswer(option.key)}
                disabled={isSubmitted || isSubmitting}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
                  optionStyle
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                    isSubmitted && isCorrectOption
                      ? "bg-success text-success-foreground"
                      : isSubmitted && isSelected && !isCorrect
                        ? "bg-destructive text-destructive-foreground"
                        : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                  )}
                >
                  {option.key}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-card-foreground">
                  {option.textKo}
                </span>
                {isSubmitted && isCorrectOption && (
                  <CheckCircle className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-success" />
                )}
                {isSubmitted && isSelected && !isCorrect && option.key === selectedAnswer && (
                  <XCircle className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Explanation */}
      {showExplanation && (
        <Card className={cn("border", isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-semibold text-success">{"정답입니다!"}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">
                    {"오답입니다. 정답: "}{question.correctAnswer}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-card/50 p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-card-foreground">
                {question.explanationKo}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note section */}
      {showNote && (
        <Card className="border-info/20 bg-info/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="h-4 w-4 text-info" />
              <span className="text-sm font-semibold text-info">{"내 메모"}</span>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="이 문제에 대한 팁, 암기법, 메모를 작성하세요..."
              className="min-h-20 border-info/20 bg-card/50 text-card-foreground placeholder:text-muted-foreground"
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" className="bg-info text-info-foreground hover:bg-info/90" onClick={handleSaveNote}>
                {"저장"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {"이전"}
        </Button>

        {!showExplanation && selectedAnswer ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "정답 확인"}
          </Button>
        ) : showExplanation ? (
          <Button
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === totalCount - 1}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {"다음 문제"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === totalCount - 1}
          className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
        >
          {"건너뛰기"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
