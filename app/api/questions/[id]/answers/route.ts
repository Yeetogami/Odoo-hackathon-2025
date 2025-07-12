import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const questionId = params.id

    const result = await pool.query(
      `
      SELECT 
        a.*,
        u.username as user_username
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.is_accepted DESC, a.vote_count DESC, a.created_at ASC
    `,
      [questionId],
    )

    const answers = result.rows.map((row) => ({
      ...row,
      user: { username: row.user_username },
    }))

    return NextResponse.json({ answers })
  } catch (error) {
    console.error("Get answers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Insert answer
      const answerResult = await client.query(
        "INSERT INTO answers (content, question_id, user_id) VALUES ($1, $2, $3) RETURNING id",
        [content, questionId, user.id],
      )

      const answerId = answerResult.rows[0].id

      // Update question answer count
      await client.query("UPDATE questions SET answer_count = answer_count + 1 WHERE id = $1", [questionId])

      // Get question owner for notification
      const questionResult = await client.query("SELECT user_id, title FROM questions WHERE id = $1", [questionId])

      const questionOwner = questionResult.rows[0]

      // Create notification for question owner (if not answering own question)
      if (questionOwner.user_id !== user.id) {
        await client.query(
          "INSERT INTO notifications (user_id, type, title, message, related_question_id, related_answer_id) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            questionOwner.user_id,
            "answer",
            "New Answer",
            `Someone answered your question: ${questionOwner.title}`,
            questionId,
            answerId,
          ],
        )
      }

      await client.query("COMMIT")

      return NextResponse.json({ answerId })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Create answer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
