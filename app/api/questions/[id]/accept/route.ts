import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const questionId = params.id
    const { answerId } = await request.json()

    // Verify user owns the question
    const questionResult = await pool.query("SELECT user_id FROM questions WHERE id = $1", [questionId])

    if (questionResult.rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    if (questionResult.rows[0].user_id !== user.id) {
      return NextResponse.json({ error: "Only question owner can accept answers" }, { status: 403 })
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Remove previous accepted answer
      await client.query("UPDATE answers SET is_accepted = false WHERE question_id = $1", [questionId])

      // Set new accepted answer
      await client.query("UPDATE answers SET is_accepted = true WHERE id = $1", [answerId])

      // Update question status and accepted_answer_id
      await client.query("UPDATE questions SET status = 'answered', accepted_answer_id = $1 WHERE id = $2", [
        answerId,
        questionId,
      ])

      // Get answer owner for notification
      const answerResult = await client.query("SELECT user_id FROM answers WHERE id = $1", [answerId])

      const answerOwner = answerResult.rows[0]

      // Create notification for answer owner (if not accepting own answer)
      if (answerOwner.user_id !== user.id) {
        await client.query(
          "INSERT INTO notifications (user_id, type, title, message, related_question_id, related_answer_id) VALUES ($1, $2, $3, $4, $5, $6)",
          [answerOwner.user_id, "accept", "Answer Accepted", "Your answer was accepted!", questionId, answerId],
        )
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
    console.error("Accept answer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
