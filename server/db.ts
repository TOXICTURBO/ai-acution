import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export for use in other files
export default db;