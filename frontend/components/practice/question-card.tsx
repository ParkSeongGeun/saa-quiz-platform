"use client"

import { useState } from "react"
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
} from "lucide-react"
import type { Question } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: Question
  currentIndex: number
  totalCount: number
  onNext: () => void
  onPrev: () => void
}

export function QuestionCard({
  question,
  currentIndex,
  totalCount,
  onNext,
  onPrev,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [note, setNote] = useState("")
  const [showNote, setShowNote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCorrect = selectedAnswer === question.correctAnswer
  const isSubmitted = selectedAnswer !== null && showExplanation

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleSubmit = async () => {
    if (selectedAnswer) {
      setIsSubmitting(true)
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/submit`, {
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
          setShowExplanation(true)
        }
      } catch (error) {
        console.error("Failed to submit answer:", error)
        // Fallback to local behavior if API fails
        setShowExplanation(true)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    setShowNote(false)
    onNext()
  }

  const handlePrev = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    setShowNote(false)
    onPrev()
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
            onClick={() => setIsBookmarked(!isBookmarked)}
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
              <Button size="sm" className="bg-info text-info-foreground hover:bg-info/90">
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
