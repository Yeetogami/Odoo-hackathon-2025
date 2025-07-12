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

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const answerId = params.id

    await pool.query("UPDATE answers SET is_flagged = false WHERE id = $1", [answerId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unflag answer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
