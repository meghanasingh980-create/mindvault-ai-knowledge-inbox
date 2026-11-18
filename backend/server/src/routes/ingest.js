
import express from "express";
import db from "../database.js";
import { chunkText } from "../utils/chunkText.js";
import { extractWebpage } from "../services/urlService.js";
import {
  generateEmbedding,
  EMBEDDING_MODEL,
} from "../services/embeddingService.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { type, content, url, title } = req.body || {};

    let itemTitle;
    let itemContent;
    let sourceUrl = null;

    if (type === "note") {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Note content is required.",
        });
      }

      itemContent = content.trim();

      if (itemContent.length > 100000) {
        return res.status(400).json({
          success: false,
          message: "Note content must not exceed 100,000 characters.",
        });
      }

      itemTitle =
        typeof title === "string" && title.trim()
          ? title.trim().slice(0, 200)
          : itemContent.slice(0, 60);
    } else if (type === "url") {
      if (typeof url !== "string" || !url.trim()) {
        return res.status(400).json({
          success: false,
          message: "A URL is required.",
        });
      }

      const webpage = await extractWebpage(url.trim());

      itemTitle =
  typeof title === "string" && title.trim()
    ? title.trim().slice(0, 200)
    : "";
      itemContent = webpage.content;
      sourceUrl = webpage.sourceUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'note' or 'url'.",
      });
    }

    const chunks = chunkText(itemContent);

    if (!chunks.length) {
      return res.status(400).json({
        success: false,
        message: "No content could be processed.",
      });
    }

    // Generate embeddings before saving the item
    const embeddings = await Promise.all(
      chunks.map(chunk => generateEmbedding(chunk))
    );

    // Save the item and embeddings atomically
    const saveItem = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO items
          (title, content, source_type, source_url)
        VALUES (?, ?, ?, ?)
      `).run(itemTitle, itemContent, type, sourceUrl);

      const itemId = Number(result.lastInsertRowid);

      const insertChunk = db.prepare(`
        INSERT INTO chunks
          (item_id, chunk_index, content, embedding, embedding_model)
        VALUES (?, ?, ?, ?, ?)
      `);

      chunks.forEach((chunk, index) => {
        insertChunk.run(
          itemId,
          index,
          chunk,
          JSON.stringify(embeddings[index]),
          EMBEDDING_MODEL
        );
      });

      return itemId;
    });

    const itemId = saveItem();

    console.log(JSON.stringify({
      level: "info",
      event: "content_ingested",
      itemId,
      sourceType: type,
      chunkCount: chunks.length,
      timestamp: new Date().toISOString(),
    }));

    return res.status(201).json({
      success: true,
      message: "Content saved and embedded successfully.",
      item: {
        id: itemId,
        title: itemTitle,
        source_type: type,
        source_url: sourceUrl,
        chunk_count: chunks.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
