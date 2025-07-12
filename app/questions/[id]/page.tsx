"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ChevronUp, ChevronDown, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function QuestionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [newAnswer, setNewAnswer] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchQuestion()
      fetchAnswers()
    }
  }, [id])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${id}`)
      const data = await response.json()
      setQuestion(data.question)
    } catch (error) {
      console.error("Failed to fetch question:", error)
    }
  }

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/questions/${id}/answers`)
      const data = await response.json()
      setAnswers(data.answers || [])
    } catch (error) {
      console.error("Failed to fetch answers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (type: "question" | "answer", targetId: number, voteType: "upvote" | "downvote") => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to vote",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const endpoint = type === "question" ? "/api/votes" : "/api/votes"
      const body = type === "question" ? { questionId: targetId, voteType } : { answerId: targetId, voteType }

      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (type === "question") {
        fetchQuestion()
      } else {
        fetchAnswers()
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  const handleAcceptAnswer = async (answerId: number) => {
    if (!user || user.id !== question?.user_id) return

    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/questions/${id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answerId }),
      })

      fetchQuestion()
      fetchAnswers()
      toast({
        title: "Success",
        description: "Answer accepted successfully!",
      })
    } catch (error) {
      console.error("Failed to accept answer:", error)
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    if (!newAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please write an answer",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/questions/${id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newAnswer }),
      })

      setNewAnswer("")
      fetchAnswers()
      fetchQuestion()
      toast({
        title: "Success",
        description: "Answer posted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post answer",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096A00] mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading question...</p>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Question not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Questions
        </Link>
        <span className="mx-2 text-muted-foreground">{">"}</span>
        <span className="text-foreground">{question.title}</span>
      </nav>

      {/* Question */}
      <div className="border rounded-lg p-6 mb-6">
        <div className="flex gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("question", question.id, "upvote")}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold">{question.vote_count}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("question", question.id, "downvote")}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-4">{question.title}</h1>

            <div
              className="prose prose-sm max-w-none dark:prose-invert mb-4"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags?.map((tag: any) => (
                <Badge key={tag.name} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                asked by <span className="font-medium">{question.user?.username}</span>{" "}
                {formatDate(question.created_at)}
              </div>
              <Badge variant={question.status === "answered" ? "default" : "secondary"}>{question.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Answers ({answers.length})</h2>

        <div className="space-y-6">
          {answers.map((answer) => (
            <div key={answer.id} className="border rounded-lg p-6">
              <div className="flex gap-4">
                {/* Voting */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote("answer", answer.id, "upvote")}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                  <span className="text-lg font-semibold">{answer.vote_count}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote("answer", answer.id, "downvote")}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>

                  {/* Accept Answer Button */}
                  {user?.id === question.user_id && !question.accepted_answer_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className="h-8 w-8 p-0 text-[#096A00] hover:text-[#096A00]/80"
                      title="Accept this answer"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  )}

                  {answer.is_accepted && (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <Check className="h-5 w-5 text-[#096A00]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {answer.is_accepted && (
                    <Badge className="mb-2 bg-[#096A00] hover:bg-[#096A00]/90">Accepted Answer</Badge>
                  )}

                  <div
                    className="prose prose-sm max-w-none dark:prose-invert mb-4"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />

                  <div className="text-sm text-muted-foreground">
                    answered by <span className="font-medium">{answer.user?.username}</span>{" "}
                    {formatDate(answer.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Answer */}
      {user ? (
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Submit Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <RichTextEditor
              value={newAnswer}
              onChange={setNewAnswer}
              placeholder="Write your answer here..."
              className="mb-4"
            />
            <Button type="submit" disabled={submitting} className="bg-[#096A00] hover:bg-[#096A00]/90">
              {submitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-4">Please login to submit an answer</p>
          <Button asChild className="bg-[#096A00] hover:bg-[#096A00]/90">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
