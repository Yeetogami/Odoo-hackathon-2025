"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Check } from "lucide-react"

const mockQuestion = {
  id: 1,
  title: "How to join 2 columns in a data set to make a separate column in SQL",
  description:
    "I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine both first name and last name.",
  tags: ["SQL", "Database"],
  author: "User Name",
  votes: 12,
  timeAgo: "2 hours ago",
  isAnswered: false,
}

const mockAnswers = [
  {
    id: 1,
    content:
      "You can use the CONCAT function or the || operator to combine columns:\n\n```sql\nSELECT \n  first_name,\n  last_name,\n  CONCAT(first_name, ' ', last_name) AS full_name\nFROM your_table;\n```",
    author: "SQLExpert",
    votes: 8,
    timeAgo: "1 hour ago",
    isAccepted: true,
  },
  {
    id: 2,
    content:
      "Another approach is to use string concatenation with the + operator (in SQL Server) or || (in PostgreSQL):\n\n```sql\nSELECT first_name + ' ' + last_name AS full_name\nFROM your_table;\n```",
    author: "DatabaseGuru",
    votes: 3,
    timeAgo: "30 minutes ago",
    isAccepted: false,
  },
]

export default function QuestionDetailPage() {
  const [newAnswer, setNewAnswer] = useState("")
  const [userVotes, setUserVotes] = useState<{ [key: string]: "up" | "down" | null }>({})

  const handleVote = (type: "up" | "down", targetType: "question" | "answer", targetId: number) => {
    const key = `${targetType}-${targetId}`
    const currentVote = userVotes[key]

    if (currentVote === type) {
      // Remove vote if clicking the same button
      setUserVotes((prev) => ({ ...prev, [key]: null }))
    } else {
      // Set new vote
      setUserVotes((prev) => ({ ...prev, [key]: type }))
    }
  }

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting answer:", newAnswer)
    setNewAnswer("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} username="User" notificationCount={3} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <nav className="text-sm text-muted-foreground mb-4">
          <span>Question {">"} How to join 2...</span>
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
                    onClick={() => handleVote("up", "question", mockQuestion.id)}
                    className={userVotes[`question-${mockQuestion.id}`] === "up" ? "text-primary" : ""}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <span className="text-lg font-semibold">{mockQuestion.votes}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVote("down", "question", mockQuestion.id)}
                    className={userVotes[`question-${mockQuestion.id}`] === "down" ? "text-destructive" : ""}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <h1 className="text-2xl font-bold">{mockQuestion.title}</h1>

                  <div className="flex flex-wrap gap-2">
                    {mockQuestion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p>{mockQuestion.description}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Asked by {mockQuestion.author} • {mockQuestion.timeAgo}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Answers ({mockAnswers.length})</h2>

            {mockAnswers.map((answer) => (
              <Card key={answer.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVote("up", "answer", answer.id)}
                        className={userVotes[`answer-${answer.id}`] === "up" ? "text-primary" : ""}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="text-lg font-semibold">{answer.votes}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVote("down", "answer", answer.id)}
                        className={userVotes[`answer-${answer.id}`] === "down" ? "text-destructive" : ""}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                      {answer.isAccepted && (
                        <div className="mt-2">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: answer.content.replace(/\n/g, "<br>") }} />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Answered by {answer.author} • {answer.timeAgo}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Answer */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Submit Your Answer</h3>
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <RichTextEditor value={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Submit Answer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
