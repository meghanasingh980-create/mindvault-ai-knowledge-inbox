
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured in .env');
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function initDatabase() {
  const client = await db.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source_type TEXT NOT NULL
          CHECK (source_type IN ('note', 'url')),
        source_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chunks (
        id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL
          REFERENCES items(id) ON DELETE CASCADE,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT,
        embedding_model TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (item_id, chunk_index)
      );

      CREATE INDEX IF NOT EXISTS idx_chunks_item_id
      ON chunks(item_id);

      CREATE INDEX IF NOT EXISTS idx_items_created_at
      ON items(created_at);
    `);

    console.log('Neon PostgreSQL database initialized successfully.');
  } finally {
    client.release();
  }
}

export default db;
