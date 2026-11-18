
import express from "express";
import { answerQuestion } from "../services/ragService.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { question } = req.body || {};

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question.",
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Question must not exceed 2,000 characters.",
      });
    }

    const result = await answerQuestion(question.trim());

    console.log(JSON.stringify({
      level: "info",
      event: "question_answered",
      sourceCount: result.sources.length,
      timestamp: new Date().toISOString(),
    }));

    res.status(200).json({
      success: true,
      question: question.trim(),
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
