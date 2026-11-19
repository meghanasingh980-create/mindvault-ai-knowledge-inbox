
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import db, { initDatabase } from './database.js';

import ingestRouter from './routes/ingest.js';
import itemsRouter from './routes/items.js';
import queryRouter from './routes/query.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');

    res.json({
      status: 'ok',
      service: 'AI Knowledge Inbox API',
      database: 'connected'
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);

    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

app.use('/api/ingest', ingestRouter);
app.use('/api/items', itemsRouter);
app.use('/api/query', queryRouter);

app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`
  });
});


app.use((error, _req, res, _next) => {
  console.error("SERVER ERROR:", error);

  const status =
    error.status ||
    (error.name === "AbortError" ? 504 : 500);

  const message =
    status >= 500
      ? "An internal server error occurred. Please try again later."
      : error.message || "Request failed.";

  res.status(status).json({
    success: false,
    error: message,
  });
});


const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDatabase();

    app.listen(port, '0.0.0.0', () => {
      console.log(`Knowledge Inbox API running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
