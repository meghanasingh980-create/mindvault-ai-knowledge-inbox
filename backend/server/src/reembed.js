
import db from "./database.js";
import {
  generateEmbedding,
  EMBEDDING_MODEL,
} from "./services/embeddingService.js";

async function reembedAll() {
  try {
    const chunks = db.prepare(`
      SELECT id, content
      FROM chunks
      ORDER BY id
    `).all();

    console.log(`Found ${chunks.length} chunks to update.`);

    const update = db.prepare(`
      UPDATE chunks
      SET embedding = ?, embedding_model = ?
      WHERE id = ?
    `);

    for (const chunk of chunks) {
      console.log(`Updating chunk ${chunk.id}...`);

      const embedding = await generateEmbedding(chunk.content);

      update.run(
        JSON.stringify(embedding),
        EMBEDDING_MODEL,
        chunk.id
      );

      console.log(`Chunk ${chunk.id} updated successfully.`);
    }

    console.log("All embeddings regenerated successfully.");
  } catch (error) {
    console.error("Embedding migration failed:", error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

reembedAll();
