"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Flag, Users, MessageSquare, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState({ users: 0, questions: 0, answers: 0, flagged: 0 })
  const [flaggedContent, setFlaggedContent] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setFlaggedContent(data.flaggedContent)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleDeleteContent = async (type: "question" | "answer", id: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/${type}s/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${type} deleted successfully`,
        })
        fetchAdminData()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive",
      })
    }
  }

  const handleUnflagContent = async (type: "question" | "answer", id: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/${type}s/${id}/unflag`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${type} unflagged successfully`,
        })
        fetchAdminData()
      } else {
        throw new Error("Failed to unflag")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to unflag ${type}`,
        variant: "destructive",
      })
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096A00]"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage and moderate StackIt content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.questions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Answers</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.answers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.flagged}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Content */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
          <CardDescription>Review and moderate flagged questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          {flaggedContent.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No flagged content to review</p>
          ) : (
            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={item.type === "question" ? "default" : "secondary"}>{item.type}</Badge>
                        <Badge variant="destructive">
                          <Flag className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-2">{item.type === "question" ? item.title : "Answer Content"}</h3>

                      <div
                        className="text-sm text-muted-foreground mb-2 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: item.type === "question" ? item.description : item.content,
                        }}
                      />

                      <p className="text-xs text-muted-foreground">
                        By {item.username} • {formatDate(item.created_at)}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleUnflagContent(item.type, item.id)}>
                        Unflag
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteContent(item.type, item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
