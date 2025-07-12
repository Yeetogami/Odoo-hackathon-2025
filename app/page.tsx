"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { QuestionCard } from "@/components/question-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

const mockQuestions = [
  {
    id: 1,
    title: "How to join 2 columns in a data set to make a separate column in SQL",
    description:
      "I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine...",
    tags: ["SQL", "Database"],
    author: "User Name",
    answerCount: 5,
    votes: 12,
    timeAgo: "2 hours ago",
    isAnswered: true,
  },
  {
    id: 2,
    title: "React useState not updating immediately",
    description:
      "I'm having trouble with useState not updating the state immediately when I call the setter function. The component doesn't re-render with the new value...",
    tags: ["React", "JavaScript", "Hooks"],
    author: "Developer123",
    answerCount: 3,
    votes: 8,
    timeAgo: "4 hours ago",
    isAnswered: false,
  },
  {
    id: 3,
    title: "Best practices for JWT token storage",
    description:
      "What are the security implications of storing JWT tokens in localStorage vs cookies? I want to implement authentication in my web application...",
    tags: ["JWT", "Security", "Authentication"],
    author: "SecureDev",
    answerCount: 2,
    votes: 15,
    timeAgo: "1 day ago",
    isAnswered: false,
  },
]

export default function HomePage() {
  const [filter, setFilter] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 7

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} username="User" notificationCount={3} />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Link href="/ask">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Ask New Question
            </Button>
          </Link>

          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="most-voted">Most Voted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {mockQuestions.map((question) => (
            <QuestionCard key={question.id} {...question} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-primary" : ""}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
