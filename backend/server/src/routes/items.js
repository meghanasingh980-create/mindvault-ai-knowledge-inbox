
import express from "express";
import db from "../database.js";

const router = express.Router();

// Get all saved items
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        items.id,
        items.title,
        items.content,
        items.source_type,
        items.source_url,
        items.created_at,
        COUNT(chunks.id)::INTEGER AS chunk_count
      FROM items
      LEFT JOIN chunks ON items.id = chunks.item_id
      GROUP BY items.id
      ORDER BY items.created_at DESC, items.id DESC
    `);

    return res.json({
      success: true,
      items: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a saved item
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const result = await db.query(
      "DELETE FROM items WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    return res.json({
      success: true,
      message: "Item deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
