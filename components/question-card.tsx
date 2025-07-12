import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, ArrowUp, Flag } from "lucide-react"

interface QuestionCardProps {
  id: number
  title: string
  content: string
  tags: Array<{ id: number; name: string }>
  user: { id: number; username: string }
  answer_count: number
  vote_count: number
  created_at: string
  is_answered?: boolean
  is_flagged?: boolean
  moderation_status?: string
  showModerationStatus?: boolean
}

export function QuestionCard({
  id,
  title,
  content,
  tags,
  user,
  answer_count,
  vote_count,
  created_at,
  is_answered = false,
  is_flagged = false,
  moderation_status = "approved",
  showModerationStatus = false,
}: QuestionCardProps) {
  const timeAgo = new Date(created_at).toLocaleDateString()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground min-w-[60px]">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4" />
              <span>{vote_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{answer_count}</span>
            </div>
            {is_flagged && (
              <div className="flex items-center gap-1 text-orange-500">
                <Flag className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <Link href={`/questions/${id}`} className="block">
              <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                {title}
                {is_answered && <span className="ml-2 text-sm text-green-600">[Answered]</span>}
              </h3>
            </Link>

            <p className="text-muted-foreground line-clamp-2">{content}</p>

            {showModerationStatus && moderation_status !== "approved" && (
              <div className="flex items-center gap-2">
                <Badge variant={moderation_status === "pending" ? "secondary" : "destructive"}>
                  {moderation_status}
                </Badge>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>by {user.username}</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
