import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, ArrowUp } from "lucide-react"

interface QuestionCardProps {
  id: number
  title: string
  description: string
  tags: string[]
  author: string
  answerCount: number
  votes: number
  timeAgo: string
  isAnswered?: boolean
}

export function QuestionCard({
  id,
  title,
  description,
  tags,
  author,
  answerCount,
  votes,
  timeAgo,
  isAnswered = false,
}: QuestionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground min-w-[60px]">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4" />
              <span>{votes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{answerCount}</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <Link href={`/questions/${id}`} className="block">
              <h3 className="text-lg font-semibold hover:text-primary transition-colors">{title}</h3>
            </Link>

            <p className="text-muted-foreground line-clamp-2">{description}</p>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>by {author}</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
