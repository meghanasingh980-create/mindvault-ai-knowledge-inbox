
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );
  }

  return genAI;
}

// Updated Google embedding model
const EMBEDDING_MODEL = "gemini-embedding-001";;

export async function generateEmbedding(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Text is required to generate an embedding.");
  }

  const client = getGeminiClient();

  const model = client.getGenerativeModel({
    model: EMBEDDING_MODEL,
  });

  const result = await model.embedContent(text);

  return result.embedding.values;
}

export { EMBEDDING_MODEL };
