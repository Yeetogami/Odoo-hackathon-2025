import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  username: string
  email: string
  role: string
  avatar_url?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const result = await pool.query("SELECT id, username, email, role, avatar_url FROM users WHERE id = $1", [decoded.id])

  return result.rows[0] || null
}
