"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { QuestionCard } from "@/components/question-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data for when backend is not available
const mockQuestions = [
  {
    id: 1,
    title: "How to join 2 columns in a data set to make a separate column in SQL",
    content:
      "I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine both first name and last name.",
    tags: [
      { id: 1, name: "SQL" },
      { id: 2, name: "Database" },
    ],
    user: { id: 1, username: "User Name" },
    answer_count: 5,
    vote_count: 12,
    created_at: new Date().toISOString(),
    is_answered: true,
    is_flagged: false,
    moderation_status: "approved",
  },
  {
    id: 2,
    title: "React useState not updating immediately",
    content:
      "I'm having trouble with useState not updating the state immediately when I call the setter function. The component doesn't re-render with the new value...",
    tags: [
      { id: 3, name: "React" },
      { id: 4, name: "JavaScript" },
      { id: 5, name: "Hooks" },
    ],
    user: { id: 2, username: "Developer123" },
    answer_count: 3,
    vote_count: 8,
    created_at: new Date().toISOString(),
    is_answered: false,
    is_flagged: false,
    moderation_status: "approved",
  },
  {
    id: 3,
    title: "Best practices for JWT token storage",
    content:
      "What are the security implications of storing JWT tokens in localStorage vs cookies? I want to implement authentication in my web application...",
    tags: [
      { id: 6, name: "JWT" },
      { id: 7, name: "Security" },
      { id: 8, name: "Authentication" },
    ],
    user: { id: 3, username: "SecureDev" },
    answer_count: 2,
    vote_count: 15,
    created_at: new Date().toISOString(),
    is_answered: false,
    is_flagged: false,
    moderation_status: "approved",
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [backendAvailable, setBackendAvailable] = useState(true)
  const searchQuery = searchParams.get("search") || ""

  const questionsPerPage = 10

  useEffect(() => {
    fetchQuestions()
  }, [filter, currentPage, searchQuery])

  const fetchQuestions = async () => {
    try {
      setLoading(true)

      // First check if backend is available
      await apiClient.healthCheck()
      setBackendAvailable(true)

      const data = await apiClient.getQuestions({
        skip: (currentPage - 1) * questionsPerPage,
        limit: questionsPerPage,
        filter_type: filter,
        search: searchQuery || undefined,
      })
      setQuestions(data)
      setTotalPages(Math.max(1, Math.ceil(data.length / questionsPerPage)))
    } catch (error: any) {
      console.error("Failed to fetch questions:", error)

      if (error.message.includes("Unable to connect to server")) {
        setBackendAvailable(false)
        setQuestions(mockQuestions)
        setTotalPages(1)
        toast({
          title: "Backend Unavailable",
          description: "Using demo data. Please start the backend server.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch questions",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {!backendAvailable && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Backend server is not running. Showing demo data. To enable full functionality, please start the backend
              server at http://localhost:8000
            </AlertDescription>
          </Alert>
        )}

        {searchQuery && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Search results for: "{searchQuery}"</h2>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {user && backendAvailable && (
            <Link href="/ask">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Ask New Question
              </Button>
            </Link>
          )}

          {!backendAvailable && (
            <Button disabled className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Ask New Question (Backend Required)
            </Button>
          )}

          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="most_voted">Most Voted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question) => <QuestionCard key={question.id} {...question} />)
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No questions found.</p>
              {user && backendAvailable && (
                <Link href="/ask">
                  <Button className="mt-4">Ask the first question</Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {questions.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
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
        )}
      </main>
    </div>
  )
}
