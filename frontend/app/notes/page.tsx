"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StickyNote, Trash2, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NotesPage() {
  useAuth()

  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
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
    fetchNotes()
  }, [API_URL])

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
        setNotes(prev => prev.map(n => n.question_id === questionId ? data : n))
        setEditingId(null)
        setEditText("")
      }
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }

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
          <h1 className="text-xl font-bold tracking-tight text-foreground">{"내 노트"}</h1>
          <p className="text-sm text-muted-foreground">
            {"문제에 대한 내 생각과 팁을 기록합니다. 총 "}{notes.length}{"개"}
          </p>
        </div>

        {/* Notes list */}
        <div className="space-y-2.5">
          {notes.map((note) => {
            const isEditing = editingId === note.question_id

            return (
              <Card key={note.question_id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <StickyNote className="mt-0.5 h-5 w-5 shrink-0 text-info" />
                        <div>
                          <Link href={`/practice`}>
                            <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
                              문제 {note.question_id}
                            </span>
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(note.updated_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5"
                              onClick={() => saveNote(note.question_id)}
                            >
                              <Save className="h-3.5 w-3.5" />
                              {"저장"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
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
                              className="h-8"
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
                              className="h-8 gap-1.5 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteNote(note.question_id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
                        className="min-h-20 border-info/20 bg-card/50"
                        placeholder="노트 내용을 입력하세요..."
                      />
                    ) : (
                      <div className="rounded-lg bg-info/5 border border-info/20 p-3">
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
