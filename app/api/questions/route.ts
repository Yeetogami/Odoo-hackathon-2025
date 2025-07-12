import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await pool.query("SELECT 1")

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "newest"
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let orderBy = "q.created_at DESC"
    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []

    // Apply search filter - Fixed search functionality
    if (search.trim()) {
      whereClause += ` AND (q.title ILIKE $${queryParams.length + 1} OR q.description ILIKE $${queryParams.length + 2})`
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    // Apply status filters
    switch (filter) {
      case "unanswered":
        whereClause += " AND q.status = 'unanswered'"
        break
      case "answered":
        whereClause += " AND q.status = 'answered'"
        break
      case "most-voted":
        orderBy = "q.vote_count DESC, q.created_at DESC"
        break
    }

    // Simplified query to avoid complex joins that might fail
    const questionsQuery = `
      SELECT 
        q.id,
        q.title,
        q.description,
        q.status,
        q.vote_count,
        q.answer_count,
        q.created_at,
        u.username as user_username
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit, offset)

    const result = await pool.query(questionsQuery, queryParams)

    // Get tags for each question separately to avoid complex joins
    const questionsWithTags = await Promise.all(
      result.rows.map(async (question) => {
        try {
          const tagsResult = await pool.query(
            `SELECT t.name 
             FROM tags t 
             JOIN question_tags qt ON t.id = qt.tag_id 
             WHERE qt.question_id = $1`,
            [question.id],
          )

          return {
            ...question,
            user: { username: question.user_username },
            tags: tagsResult.rows.map((row) => ({ name: row.name })),
          }
        } catch (error) {
          console.error(`Error fetching tags for question ${question.id}:`, error)
          return {
            ...question,
            user: { username: question.user_username },
            tags: [],
          }
        }
      }),
    )

    // Get total count - Fixed to use same search parameters
    const countQuery = `SELECT COUNT(*) as total FROM questions q LEFT JOIN users u ON q.user_id = u.id ${whereClause}`
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const totalQuestions = Number.parseInt(countResult.rows[0].total)
    const totalPages = Math.ceil(totalQuestions / limit)

    return NextResponse.json({
      questions: questionsWithTags,
      totalPages,
      currentPage: page,
      totalQuestions,
    })
  } catch (error) {
    console.error("Get questions error:", error)

    // Return mock data if database fails
    const mockQuestions = [
      {
        id: 1,
        title: "How to get started with React?",
        description: "I'm new to React and want to learn the basics. What should I start with?",
        user: { username: "demo_user" },
        tags: [{ name: "react" }, { name: "javascript" }],
        vote_count: 5,
        answer_count: 3,
        status: "answered",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Database connection issues",
        description: "Having trouble connecting to PostgreSQL database. Any suggestions?",
        user: { username: "dev_user" },
        tags: [{ name: "postgresql" }, { name: "database" }],
        vote_count: 2,
        answer_count: 1,
        status: "unanswered",
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      questions: mockQuestions,
      totalPages: 1,
      currentPage: 1,
      totalQuestions: mockQuestions.length,
      error: "Database connection failed - showing demo data",
    })
  }
}

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

    const { title, description, tags } = await request.json()

    if (!title || !description || !tags || tags.length === 0) {
      return NextResponse.json({ error: "Title, description, and at least one tag are required" }, { status: 400 })
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Insert question
      const questionResult = await client.query(
        "INSERT INTO questions (title, description, user_id) VALUES ($1, $2, $3) RETURNING id",
        [title, description, user.id],
      )

      const questionId = questionResult.rows[0].id

      // Handle tags
      for (const tagName of tags) {
        // Insert tag if it doesn't exist
        await client.query(
          "INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET usage_count = tags.usage_count + 1",
          [tagName.toLowerCase()],
        )

        // Get tag id
        const tagResult = await client.query("SELECT id FROM tags WHERE name = $1", [tagName.toLowerCase()])

        const tagId = tagResult.rows[0].id

        // Link question to tag
        await client.query("INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)", [questionId, tagId])
      }

      await client.query("COMMIT")

      return NextResponse.json({ questionId })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Create question error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
