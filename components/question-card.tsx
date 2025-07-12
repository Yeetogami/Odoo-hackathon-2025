"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, MessageSquare } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface QuestionCardProps {
  question: {
    id: number
    title: string
    description: string
    user: { username: string }
    tags: { name: string }[]
    vote_count: number
    answer_count: number
    status: string
    created_at: string
  }
  showVoting?: boolean
  onVote?: (questionId: number, voteType: "upvote" | "downvote") => void
}

export function QuestionCard({ question, showVoting = false, onVote }: QuestionCardProps) {
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 200)
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {showVoting && (
          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onVote?.(question.id, "upvote")} className="h-8 w-8 p-0">
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{question.vote_count}</span>
            <Button variant="ghost" size="sm" onClick={() => onVote?.(question.id, "downvote")} className="h-8 w-8 p-0">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Link
                href={`/questions/${question.id}`}
                className="text-lg font-semibold hover:text-[#096A00] transition-colors"
              >
                {question.title}
              </Link>
              <p className="text-muted-foreground mt-1 text-sm">{stripHtml(question.description)}...</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{question.answer_count}</span>
              </div>
              <Badge variant={question.status === "answered" ? "default" : "secondary"}>{question.status}</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag) => (
                <Badge key={tag.name} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              asked by <span className="font-medium">{question.user.username}</span> {formatDate(question.created_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
