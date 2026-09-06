import { defineConfig } from "@prisma/config"
import { config } from "dotenv"

config()

export default defineConfig({
  datasource: {
    name: "db",
    provider: "postgresql",
    // CLI operations (migrate, db push, db pull) must use the direct
    // connection (port 5432) — the transaction-mode pooler (port 6543)
    // does not support the DDL / prepared statements Prisma needs.
    url: process.env.DIRECT_URL,
  },
})
