import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { join } from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dbPath = join(__dirname, "../../../database.db");
const migrationsPath = join(__dirname, "../drizzle");

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: migrationsPath });

console.log("Migrations applied successfully");
sqlite.close();
