
import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";

// Resolve the current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Create the database directory if it doesn't exist
const dataDir = path.resolve(currentDir, "../data");
mkdirSync(dataDir, { recursive: true });

// Database file location
const dbPath = path.join(dataDir, "knowledge.db");

// Initialize SQLite database
const db = new Database(dbPath);

// Enable database safety and performance settings
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Create database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL
      CHECK(source_type IN ('note', 'url')),
    source_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT,
    embedding_model TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id)
      REFERENCES items(id)
      ON DELETE CASCADE,

    UNIQUE(item_id, chunk_index)
  );

  CREATE INDEX IF NOT EXISTS idx_chunks_item_id
  ON chunks(item_id);

  CREATE INDEX IF NOT EXISTS idx_items_created_at
  ON items(created_at);
`);

console.log("SQLite database initialized successfully.");

export default db;
