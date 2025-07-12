import { Pool } from "pg"

let pool: Pool

if (!pool) {
  pool = new Pool({
    user: process.env.PGUSER || "postgres",
    host: process.env.PGHOST || "localhost",
    database: process.env.PGDATABASE || "stackit",
    password: process.env.PGPASSWORD || "password",
    port: Number.parseInt(process.env.PGPORT || "5432"),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}

export default pool
