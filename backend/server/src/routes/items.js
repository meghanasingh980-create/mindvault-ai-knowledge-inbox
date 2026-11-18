
import express from "express";
import db from "../database.js";

const router = express.Router();

// Get all saved items
router.get("/", (req, res, next) => {
  try {
    const items = db.prepare(`
      SELECT
        items.id,
        items.title,
        items.content,
        items.source_type,
        items.source_url,
        items.created_at,
        COUNT(chunks.id) AS chunk_count
      FROM items
      LEFT JOIN chunks ON items.id = chunks.item_id
      GROUP BY items.id
      ORDER BY items.created_at DESC, items.id DESC
    `).all();

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a saved item
router.delete("/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid item ID",
      });
    }

    const existingItem = db.prepare(
      "SELECT id FROM items WHERE id = ?"
    ).get(id);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    const deleteTransaction = db.transaction(() => {
      db.prepare(
        "DELETE FROM chunks WHERE item_id = ?"
      ).run(id);

      db.prepare(
        "DELETE FROM items WHERE id = ?"
      ).run(id);
    });

    deleteTransaction();

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
