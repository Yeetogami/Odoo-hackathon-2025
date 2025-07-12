import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get stats
    const usersCount = await pool.query("SELECT COUNT(*) as count FROM users")
    const questionsCount = await pool.query("SELECT COUNT(*) as count FROM questions")
    const answersCount = await pool.query("SELECT COUNT(*) as count FROM answers")
    const flaggedCount = await pool.query(
      "SELECT COUNT(*) as count FROM (SELECT id FROM questions WHERE is_flagged = true UNION ALL SELECT id FROM answers WHERE is_flagged = true) as flagged",
    )

    // Get flagged content
    const flaggedQuestions = await pool.query(`
      SELECT 
        q.id, q.title, q.description, q.created_at,
        u.username,
        'question' as type
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.is_flagged = true
      ORDER BY q.created_at DESC
    `)

    const flaggedAnswers = await pool.query(`
      SELECT 
        a.id, a.content, a.created_at,
        u.username,
        'answer' as type
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.is_flagged = true
      ORDER BY a.created_at DESC
    `)

    const flaggedContent = [
      ...flaggedQuestions.rows.map((row) => ({ ...row, type: "question" })),
      ...flaggedAnswers.rows.map((row) => ({ ...row, type: "answer" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      stats: {
        users: Number.parseInt(usersCount.rows[0].count),
        questions: Number.parseInt(questionsCount.rows[0].count),
        answers: Number.parseInt(answersCount.rows[0].count),
        flagged: Number.parseInt(flaggedCount.rows[0].count),
      },
      flaggedContent,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
