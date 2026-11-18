import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ingestRouter from './routes/ingest.js';
import itemsRouter from './routes/items.js';
import queryRouter from './routes/query.js';

const app = express();
app.use(cors({ origin: [ 'http://localhost:5173', 'http://localhost:4173']}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'AI Knowledge Inbox API' }));
app.use('/api/ingest', ingestRouter);
app.use('/api/items', itemsRouter);
app.use('/api/query', queryRouter);
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error("FULL SERVER ERROR:", error);
  const status = error.status || (error.name === 'AbortError' ? 504 : 500);

  res.status(status).json({
    error: error.message || "Unknown server error",
    details: error.stack
  });
});
const port = process.env.PORT || 5000;
console.log("Starting Express server...");
app.listen(port, () => console.log(`Knowledge Inbox API running at http://localhost:${port}`));
