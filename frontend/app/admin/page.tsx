"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Flag, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface FlaggedContent {
  moderation_id: number
  content_type: string
  content_id: number
  content_title: string
  content_text: string
  author: string
  flagged_words: string[]
  created_at: string
}

interface ModerationStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (!user.is_admin) {
      router.push("/")
      return
    }
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contentData, statsData] = await Promise.all([
        apiClient.getFlaggedContent(),
        apiClient.getModerationStats(),
      ])
      setFlaggedContent(contentData)
      setStats(statsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (moderationId: number, decision: "approved" | "rejected") => {
    try {
      setReviewingId(moderationId)
      await apiClient.reviewContent(moderationId, decision, adminNotes)
      toast({
        title: "Success",
        description: `Content ${decision} successfully`,
      })
      setAdminNotes("")
      fetchData() // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to review content",
        variant: "destructive",
      })
    } finally {
      setReviewingId(null)
    }
  }

  if (!user || !user.is_admin) {
    return null
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
        <div className="flex items-center gap-2 mb-6">
          <Flag className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <BarChart3 className="h-4 w-4 text-mute-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Flagged Content */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Flagged Content for Review</h2>

          {flaggedContent.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No content pending review</p>
              </CardContent>
            </Card>
          ) : (
            flaggedContent.map((item) => (
              <Card key={item.moderation_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.content_title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {item.content_type} by {item.author} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.content_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Content:</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{item.content_text}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Flagged Words:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.flagged_words.map((word, index) => (
                        <Badge key={index} variant="destructive">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${item.moderation_id}`}>Admin Notes (Optional)</Label>
                    <Textarea
                      id={`notes-${item.moderation_id}`}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes about your decision..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleReview(item.moderation_id, "approved")}
                      disabled={reviewingId === item.moderation_id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {reviewingId === item.moderation_id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleReview(item.moderation_id, "rejected")}
                      disabled={reviewingId === item.moderation_id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {reviewingId === item.moderation_id ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
