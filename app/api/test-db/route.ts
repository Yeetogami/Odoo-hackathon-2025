import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    // Test basic connection
    const result = await pool.query("SELECT NOW() as current_time, version() as pg_version")

    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    // Test if we have data
    const usersCount = await pool.query("SELECT COUNT(*) as count FROM users")
    const questionsCount = await pool.query("SELECT COUNT(*) as count FROM questions")

    return NextResponse.json({
      status: "success",
      database: {
        connected: true,
        time: result.rows[0].current_time,
        version: result.rows[0].pg_version,
      },
      tables: tablesResult.rows.map((row) => row.table_name),
      data: {
        users: Number.parseInt(usersCount.rows[0].count),
        questions: Number.parseInt(questionsCount.rows[0].count),
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        connected: false,
      },
      { status: 500 },
    )
  }
}
