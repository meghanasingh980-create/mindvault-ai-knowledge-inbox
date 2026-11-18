
import db from "./database.js";
import {
  generateEmbedding,
  EMBEDDING_MODEL,
} from "./services/embeddingService.js";

async function reembedAll() {
  try {
    const result = await db.query(`
      SELECT id, content
      FROM chunks
      ORDER BY id
    `);

    const chunks = result.rows;

    console.log(`Found ${chunks.length} chunks to update.`);

    for (const chunk of chunks) {
      console.log(`Updating chunk ${chunk.id}...`);

      const embedding = await generateEmbedding(chunk.content);

      await db.query(
        `UPDATE chunks
         SET embedding = $1, embedding_model = $2
         WHERE id = $3`,
        [
          JSON.stringify(embedding),
          EMBEDDING_MODEL,
          chunk.id,
        ]
      );

      console.log(`Chunk ${chunk.id} updated successfully.`);
    }

    console.log("All embeddings regenerated successfully.");
  } catch (error) {
    console.error("Embedding migration failed:", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

reembedAll();
