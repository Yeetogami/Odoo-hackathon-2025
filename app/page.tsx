"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuestionCard } from "@/components/question-card"
import { Plus, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HomePage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("newest")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchQuestions()
  }, [filter, search, currentPage])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1) // Reset to first page when searching
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        filter,
        search,
        page: currentPage.toString(),
        limit: "10",
      })

      const response = await fetch(`/api/questions?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setQuestions(data.questions || [])
      setTotalPages(data.totalPages || 1)

      // Show warning if using demo data
      if (data.error) {
        console.warn("Database issue:", data.error)
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)

      // Set fallback data
      setQuestions([
        {
          id: 1,
          title: "Welcome to StackIt!",
          description: "This is a demo question while we set up the database connection.",
          user: { username: "system" },
          tags: [{ name: "demo" }],
          vote_count: 0,
          answer_count: 0,
          status: "unanswered",
          created_at: new Date().toISOString(),
        },
      ])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (questionId: number, voteType: "upvote" | "downvote") => {
    if (!user) return

    try {
      const token = localStorage.getItem("token")
      await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId, voteType }),
      })

      fetchQuestions()
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setCurrentPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Questions</h1>
          <p className="text-muted-foreground">
            Find answers to your questions or help others by sharing your knowledge
          </p>
        </div>

        {user && (
          <Button asChild className="bg-[#096A00] hover:bg-[#096A00]/90">
            <Link href="/ask">
              <Plus className="mr-2 h-4 w-4" />
              Ask Question
            </Link>
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>

        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
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

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096A00] mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {search ? `No questions found for "${search}"` : "No questions found"}
            </p>
            {user && (
              <Button asChild className="bg-[#096A00] hover:bg-[#096A00]/90">
                <Link href="/ask">Ask the first question</Link>
              </Button>
            )}
          </div>
        ) : (
          questions.map((question: any) => (
            <QuestionCard key={question.id} question={question} showVoting={!!user} onVote={handleVote} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? "bg-[#096A00] hover:bg-[#096A00]/90" : ""}
              >
                {page}
              </Button>
            )
          })}

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
