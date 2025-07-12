import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { questionId, answerId, voteType } = await request.json()

    if (!voteType || (voteType !== "upvote" && voteType !== "downvote")) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    if (!questionId && !answerId) {
      return NextResponse.json({ error: "Question ID or Answer ID is required" }, { status: 400 })
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Check if user already voted
      const existingVoteQuery = questionId
        ? "SELECT id, vote_type FROM votes WHERE user_id = $1 AND question_id = $2"
        : "SELECT id, vote_type FROM votes WHERE user_id = $1 AND answer_id = $2"

      const existingVoteParams = questionId ? [user.id, questionId] : [user.id, answerId]
      const existingVote = await client.query(existingVoteQuery, existingVoteParams)

      let voteChange = 0

      if (existingVote.rows.length > 0) {
        const currentVote = existingVote.rows[0]

        if (currentVote.vote_type === voteType) {
          // Remove vote if clicking same vote type
          await client.query("DELETE FROM votes WHERE id = $1", [currentVote.id])
          voteChange = voteType === "upvote" ? -1 : 1
        } else {
          // Change vote type
          await client.query("UPDATE votes SET vote_type = $1 WHERE id = $2", [voteType, currentVote.id])
          voteChange = voteType === "upvote" ? 2 : -2
        }
      } else {
        // Create new vote
        const insertVoteQuery = questionId
          ? "INSERT INTO votes (user_id, question_id, vote_type) VALUES ($1, $2, $3)"
          : "INSERT INTO votes (user_id, answer_id, vote_type) VALUES ($1, $2, $3)"

        const insertVoteParams = questionId ? [user.id, questionId, voteType] : [user.id, answerId, voteType]

        await client.query(insertVoteQuery, insertVoteParams)
        voteChange = voteType === "upvote" ? 1 : -1
      }

      // Update vote count
      if (questionId) {
        await client.query("UPDATE questions SET vote_count = vote_count + $1 WHERE id = $2", [voteChange, questionId])
      } else {
        await client.query("UPDATE answers SET vote_count = vote_count + $1 WHERE id = $2", [voteChange, answerId])

        // Create notification for answer owner when their answer gets voted
        const answerResult = await client.query("SELECT user_id FROM answers WHERE id = $1", [answerId])
        const answerOwner = answerResult.rows[0]

        if (answerOwner && answerOwner.user_id !== user.id) {
          const notificationType = voteType === "upvote" ? "upvote" : "downvote"
          const notificationMessage =
            voteType === "upvote" ? "Your answer received an upvote!" : "Your answer received a downvote"

          await client.query(
            "INSERT INTO notifications (user_id, type, title, message, related_answer_id) VALUES ($1, $2, $3, $4, $5)",
            [answerOwner.user_id, notificationType, "Answer Voted", notificationMessage, answerId],
          )
        }
      }

      await client.query("COMMIT")

      return NextResponse.json({ success: true })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
