"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StickyNote, Trash2, Save, Loader2, BookOpen, ExternalLink } from "lucide-react"
import { domains as mockDomains } from "@/lib/mock-data"

const domainMap: Record<string, string> = {
  "Resilience": "design-resilient",
  "Performance": "design-performant",
  "Security": "design-secure",
  "Cost": "design-cost",
}

export default function NotesPage() {
  const { token, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchNotes = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/tips/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      fetchNotes()
    }
  }, [token, authLoading, API_URL])

  const deleteNote = async (questionId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/tips/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 204) {
        setNotes(prev => prev.filter(n => n.question_id !== questionId))
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  const saveNote = async (questionId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/tips/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: questionId,
          tip_text: editText
        })
      })

      if (response.ok) {
        const data = await response.json()
        // We need to merge the new tip data with existing question text/domain
        setNotes(prev => prev.map(n => 
          n.question_id === questionId 
            ? { ...n, tip_text: data.tip_text, updated_at: data.updated_at } 
            : n
        ))
        setEditingId(null)
        setEditText("")
      }
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }

  if (authLoading || loading) {
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">{"내 노트"}</h1>
          <p className="text-sm text-muted-foreground">
            {"문제에 대한 내 생각과 팁을 기록합니다. 총 "}{notes.length}{"개"}
          </p>
        </div>

        {/* Notes list */}
        <div className="space-y-4">
          {notes.map((note) => {
            const isEditing = editingId === note.question_id
            const domainId = domainMap[note.domain] || note.domain
            const domainKo = mockDomains.find(d => d.id === domainId)?.ko || note.domain

            return (
              <Card key={note.question_id} className="border-border bg-card overflow-hidden">
                <CardContent className="p-0">
                  {/* Question Context Header */}
                  <div className="bg-secondary/20 px-4 py-3 border-b border-border">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">Q{note.question_id}</span>
                        <Badge variant="outline" className="text-[10px] h-5 border-border bg-background">
                          {domainKo}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => router.push(`/practice?start=${note.question_id}`)}
                      >
                        {"문제 보기"}
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-card-foreground line-clamp-2 leading-relaxed">
                      {note.question_text}
                    </p>
                  </div>

                  {/* Note Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <StickyNote className="h-4 w-4 text-info" />
                        <span className="text-xs font-semibold text-info">{"메모"}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {new Date(note.updated_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => saveNote(note.question_id)}
                            >
                              <Save className="h-3 w-3" />
                              {"저장"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setEditingId(null)
                                setEditText("")
                              }}
                            >
                              {"취소"}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setEditingId(note.question_id)
                                setEditText(note.tip_text)
                              }}
                            >
                              {"수정"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteNote(note.question_id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              {"삭제"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-24 border-info/20 bg-card/50 text-sm"
                        placeholder="노트 내용을 입력하세요..."
                      />
                    ) : (
                      <div className="rounded-lg bg-info/5 border border-info/10 p-3">
                        <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap">
                          {note.tip_text}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <StickyNote className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-base font-medium text-muted-foreground">{"작성한 노트가 없습니다"}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {"문제 풀이 중 메모 기능을 사용해보세요."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
