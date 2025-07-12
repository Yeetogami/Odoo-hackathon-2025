import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const questionId = params.id

    const result = await pool.query(
      `
      SELECT 
        q.*,
        u.username as user_username,
        u.id as user_id,
        COALESCE(
          json_agg(
            json_build_object('name', t.name)
          ) FILTER (WHERE t.name IS NOT NULL), 
          '[]'
        ) as tags
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = $1
      GROUP BY q.id, u.username, u.id
    `,
      [questionId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const question = {
      ...result.rows[0],
      user: { username: result.rows[0].user_username },
      tags: result.rows[0].tags || [],
    }

    // Increment view count
    await pool.query("UPDATE questions SET view_count = view_count + 1 WHERE id = $1", [questionId])

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Get question error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
