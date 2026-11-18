
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
          message: "A valid URL is required.",
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
        message: "Type must be either note or url.",
      });
    }

    const chunks = chunkText(itemContent);

    if (!chunks.length) {
      return res.status(400).json({
        success: false,
        message: "No content available to process.",
      });
    }

    const embeddings = await Promise.all(
      chunks.map((chunk) => generateEmbedding(chunk))
    );

    const client = await db.connect();

    let savedItem;

    try {
      await client.query("BEGIN");

      const itemResult = await client.query(
        `INSERT INTO items (title, content, source_type, source_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [itemTitle, itemContent, type, sourceUrl]
      );

      const itemId = itemResult.rows[0].id;

      for (let i = 0; i < chunks.length; i++) {
        await client.query(
          `INSERT INTO chunks
           (item_id, chunk_index, content, embedding, embedding_model)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            itemId,
            i,
            chunks[i],
            JSON.stringify(embeddings[i]),
            EMBEDDING_MODEL,
          ]
        );
      }

      await client.query("COMMIT");

      savedItem = {
        id: itemId,
        title: itemTitle,
        source_type: type,
        source_url: sourceUrl,
        chunk_count: chunks.length,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    console.log("content_ingested", savedItem);

    return res.status(201).json({
      success: true,
      message: "Content saved successfully.",
      item: savedItem,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
