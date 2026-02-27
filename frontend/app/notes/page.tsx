"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  StickyNote,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { questions } from "@/lib/mock-data"

interface NoteData {
  questionId: number
  content: string
  updatedAt: string
}

const initialNotes: NoteData[] = [
  {
    questionId: 1,
    content: "Multi-AZ = 고가용성 (HA)\nRead Replica = 읽기 성능 향상\n둘을 헷갈리지 않도록 주의!\n\n핵심: ALB + Multi-AZ EC2 = 가용성 보장",
    updatedAt: "2026-02-25 14:30",
  },
  {
    questionId: 3,
    content: "SSE-S3: AWS 관리 키 (기본)\nSSE-KMS: 고객 관리 키 (CMK) - 자동 교체 지원\nSSE-C: 고객 제공 키 - 수동 관리\n\n시험 팁: '고객 관리형 키 + 자동 교체' = SSE-KMS가 답",
    updatedAt: "2026-02-25 15:45",
  },
  {
    questionId: 4,
    content: "비용 최적화 문제 풀이 전략:\n1. 사용 패턴 파악 (24/7? 일부 시간?)\n2. 중단 가능성 확인 (Spot vs On-Demand)\n3. 예약 가능 여부 (RI vs On-Demand)\n\nInstance Scheduler = 온디맨드 + 스케줄링 = 간헐적 사용에 최적",
    updatedAt: "2026-02-24 10:20",
  },
  {
    questionId: 6,
    content: "VPC Endpoint 유형:\n- Gateway: S3, DynamoDB (무료)\n- Interface: 대부분의 다른 서비스 (유료)\n\naws:sourceVpce 조건으로 VPC 엔드포인트 제한 가능\n프라이빗 연결 = 인터넷 통하지 않음",
    updatedAt: "2026-02-24 16:00",
  },
  {
    questionId: 8,
    content: "S3 스토리지 클래스 비용 순서 (비싼->저렴):\nStandard > Standard-IA > One Zone-IA > Glacier > Glacier Deep Archive\n\n수명 주기 정책: 자동 전환으로 비용 절약\n최소 보관 일수 주의: Standard-IA = 30일",
    updatedAt: "2026-02-23 09:15",
  },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteData[]>(initialNotes)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true
    const q = questions.find((q) => q.id === note.questionId)
    const searchLower = searchQuery.toLowerCase()
    return (
      note.content.toLowerCase().includes(searchLower) ||
      q?.titleKo.includes(searchQuery) ||
      q?.domainKo.includes(searchQuery)
    )
  })

  const startEdit = (noteData: NoteData) => {
    setEditingId(noteData.questionId)
    setEditContent(noteData.content)
  }

  const saveEdit = (questionId: number) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.questionId === questionId
          ? { ...n, content: editContent, updatedAt: new Date().toLocaleString("ko-KR") }
          : n
      )
    )
    setEditingId(null)
  }

  const deleteNote = (questionId: number) => {
    setNotes((prev) => prev.filter((n) => n.questionId !== questionId))
  }

  return (
    <AppShell>
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{"내 노트"}</h1>
          <p className="text-sm text-muted-foreground">
            {"문제별로 작성한 팁, 암기법, 메모를 관리하세요. 총 "}{notes.length}{"개의 노트"}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="노트 내용, 문제, 영역으로 검색..."
            className="pl-10 border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Notes list */}
        <div className="space-y-2.5">
          {filteredNotes.map((noteData) => {
            const q = questions.find((q) => q.id === noteData.questionId)
            if (!q) return null
            const isEditing = editingId === noteData.questionId
            const isExpanded = expandedId === noteData.questionId

            return (
              <Card key={noteData.questionId} className="border-border bg-card">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : noteData.questionId)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <StickyNote className="mt-0.5 h-5 w-5 shrink-0 text-info" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-primary">Q{q.id}</span>
                        <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                          {q.domainKo}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{noteData.updatedAt}</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-card-foreground line-clamp-2">
                        {q.titleKo}
                      </p>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">
                          {noteData.content}
                        </p>
                      )}
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
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-28 border-info/30 bg-secondary/30 text-foreground"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 border-border text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-3.5 w-3.5" />
                              {"취소"}
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1.5 bg-info text-info-foreground hover:bg-info/90"
                              onClick={() => saveEdit(noteData.questionId)}
                            >
                              <Save className="h-3.5 w-3.5" />
                              {"저장"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="rounded-lg border border-info/20 bg-info/5 p-3">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-card-foreground">
                              {noteData.content}
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 border-border text-muted-foreground hover:text-destructive hover:border-destructive/50"
                              onClick={() => deleteNote(noteData.questionId)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {"삭제"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 border-border text-muted-foreground hover:text-info hover:border-info/50"
                              onClick={() => startEdit(noteData)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {"수정"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <StickyNote className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-base font-medium text-muted-foreground">{"노트가 없습니다"}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {searchQuery ? "검색 결과가 없습니다." : "문제 풀이 중 메모를 작성해보세요."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
