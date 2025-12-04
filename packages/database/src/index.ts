import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { eq, desc } from "drizzle-orm";
import { resolve } from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
// Resolve to project root - go up from packages/database/src to project root
const dbPath = resolve(__dirname, "../../../database.db");

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export { schema, eq, desc };
export * from "./schema";
