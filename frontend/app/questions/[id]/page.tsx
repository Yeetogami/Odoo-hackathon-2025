"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Check, Flag } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function QuestionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [question, setQuestion] = useState<any>(null)
  const [newAnswer, setNewAnswer] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const questionId = Number.parseInt(params.id as string)

  useEffect(() => {
    fetchQuestion()
  }, [questionId])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getQuestion(questionId)
      setQuestion(data)
    } catch (error: any) {
      console.error("Failed to fetch question:", error)
      toast({
        title: "Error",
        description: "Failed to load question",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (type: "up" | "down", targetType: "question" | "answer", targetId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to vote",
        variant: "destructive",
      })
      return
    }

    try {
      if (targetType === "question") {
        await apiClient.voteQuestion(targetId, type)
      } else {
        await apiClient.voteAnswer(targetId, type)
      }
      fetchQuestion() // Refresh to get updated vote counts
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to vote",
        variant: "destructive",
      })
    }
  }

  const handleAcceptAnswer = async (answerId: number) => {
    if (!user || user.id !== question.user_id) {
      toast({
        title: "Error",
        description: "Only the question author can accept answers",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.acceptAnswer(answerId)
      fetchQuestion()
      toast({
        title: "Success",
        description: "Answer accepted!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept answer",
        variant: "destructive",
      })
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit an answer",
        variant: "destructive",
      })
      return
    }

    if (!newAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please enter an answer",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await apiClient.createAnswer({
        content: newAnswer.trim(),
        question_id: questionId,
      })
      setNewAnswer("")
      fetchQuestion()
      toast({
        title: "Success",
        description: "Answer submitted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center">Question not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <nav className="text-sm text-muted-foreground mb-4">
          <span>
            Question {">"} {question.title.substring(0, 20)}...
          </span>
        </nav>

        <div className="space-y-6">
          {/* Question */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVote("up", "question", question.id)}
                    className={question.user_vote === "up" ? "text-primary" : ""}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <span className="text-lg font-semibold">{question.vote_count}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVote("down", "question", question.id)}
                    className={question.user_vote === "down" ? "text-destructive" : ""}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                  {question.is_flagged && (
                    <div className="mt-2">
                      <Flag className="h-5 w-5 text-orange-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <h1 className="text-2xl font-bold">{question.title}</h1>

                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: question.content.replace(/\n/g, "<br>") }} />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Asked by {question.user.username} • {new Date(question.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Answers ({question.answers.length})</h2>

            {question.answers.map((answer: any) => (
              <Card key={answer.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVote("up", "answer", answer.id)}
                        className={answer.user_vote === "up" ? "text-primary" : ""}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="text-lg font-semibold">{answer.vote_count}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVote("down", "answer", answer.id)}
                        className={answer.user_vote === "down" ? "text-destructive" : ""}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                      {answer.is_accepted && (
                        <div className="mt-2">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      {!answer.is_accepted && user && user.id === question.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAcceptAnswer(answer.id)}
                          title="Accept this answer"
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                      )}
                      {answer.is_flagged && (
                        <div className="mt-2">
                          <Flag className="h-5 w-5 text-orange-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: answer.content.replace(/\n/g, "<br>") }} />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Answered by {answer.user.username} • {new Date(answer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Answer */}
          {user && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Submit Your Answer</h3>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <RichTextEditor value={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Answer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Please login to submit an answer</p>
                <Button onClick={() => router.push("/login")}>Login</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
