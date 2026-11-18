
export function chunkText(text, chunkSize = 1000, overlap = 150) {
  if (typeof text !== "string" || !text.trim()) {
    return [];
  }

  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error("Invalid chunk size or overlap configuration.");
  }

  const cleanText = text.replace(/\s+/g, " ").trim();
  const chunks = [];

  let start = 0;

  while (start < cleanText.length) {
    let end = Math.min(start + chunkSize, cleanText.length);

    // Avoid cutting a word in half
    if (end < cleanText.length) {
      const lastSpace = cleanText.lastIndexOf(" ", end);

      if (lastSpace > start) {
        end = lastSpace;
      }
    }

    const chunk = cleanText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= cleanText.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}
