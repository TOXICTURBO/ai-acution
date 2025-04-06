import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../shared/schema";

async function main() {
  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create drizzle instance
  const db = drizzle(pool, { schema });

  // Run migrations
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migrations completed!");

  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});