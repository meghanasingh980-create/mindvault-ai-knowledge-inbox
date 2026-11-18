import OpenAI from 'openai';

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('AI is not configured. Add OPENAI_API_KEY to backend/.env and restart the server.');
    error.status = 503;
    throw error;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function createEmbedding(text) {
  const client = getClient();
  const result = await client.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    input: text.slice(0, 8000)
  });
  return result.data[0].embedding;
}

export async function generateAnswer(question, sources) {
  const client = getClient();
  const context = sources.map((source, index) => `[Source ${index + 1}: ${source.title}]\n${source.chunk_text}`).join('\n\n');
  const result = await client.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Answer using only the supplied knowledge snippets. If the snippets do not contain the answer, say that the saved knowledge does not contain enough information. Cite supporting sources as [1], [2], etc. Be clear and concise.' },
      { role: 'user', content: `Question: ${question}\n\nKnowledge snippets:\n${context}` }
    ]
  });
  return result.choices[0]?.message?.content || 'I could not generate an answer.';
}
