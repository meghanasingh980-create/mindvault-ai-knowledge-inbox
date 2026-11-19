# MindVault — AI Knowledge Inbox

**Your knowledge, connected.**

MindVault is a full-stack AI-powered knowledge management application that allows users to save text notes and website URLs in one place and ask questions about their saved information.

It uses Retrieval-Augmented Generation (RAG) to retrieve relevant saved content using semantic similarity and generate AI answers with source references.

## Features

- **Save text notes:** Store personal notes and useful information.
- **Save website URLs:** Extract and save readable webpage content.
- **Optional website titles:** Provide a custom title when saving a webpage.
- **Knowledge library:** View and manage saved notes and webpages.
- **Search and filtering:** Find saved information and filter by content type.
- **AI-powered question answering:** Ask questions using saved knowledge.
- **Semantic search:** Retrieve relevant content using vector embeddings and cosine similarity.
- **Source citations:** Display the saved items used to generate each answer.
- **Duplicate-source handling:** Display separately saved items as separate sources.
- **Clickable website links:** Open original websites from the Library and AI source references.
- **Delete saved items:** Remove unwanted notes and webpages.
- **Persistent cloud database:** Store content and embeddings in Neon PostgreSQL.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- `pg` PostgreSQL client
- Google Gemini API
- Cheerio for webpage content extraction

### AI and Retrieval
- Embedding model: `gemini-embedding-001`
- Chat model: `gemini-3.5-flash-lite`
- Vector embeddings: 3,072 dimensions using the default embedding output
- Cosine similarity for semantic retrieval
- Retrieval-Augmented Generation (RAG)
- Source-based answer generation

### Database and Hosting
- Neon Serverless PostgreSQL
- Render (backend deployment, when configured)

## Project Architecture

```text
React Frontend (Vite)
        |
        | HTTP API requests
        v
Node.js + Express Backend
        |
        +---- Ingestion Routes
        |       |
        |       +---- Text / URL processing
        |       +---- Content chunking
        |       +---- Gemini embedding generation
        |
        +---- Query Routes
        |       |
        |       +---- Question embedding generation
        |       +---- PostgreSQL chunk retrieval
        |       +---- Cosine similarity calculation
        |       +---- Relevant source selection
        |       +---- Gemini answer generation
        |
        +---- Items Routes
        |       |
        |       +---- Retrieve saved items
        |       +---- Delete saved items
        |
        v
Neon PostgreSQL Database
        |
        +---- items
        |
        +---- chunks
                |
                +---- Content
                +---- Embedding vectors
                +---- Embedding model information
```

## Project Structure

```text
ai-knowledge-inbox/
│
├── backend/
│   ├── .env.example
│   └── server/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── ingest.js
│       │   │   ├── items.js
│       │   │   └── query.js
│       │   │
│       │   ├── services/
│       │   │   ├── embeddingService.js
│       │   │   ├── ragService.js
│       │   │   └── urlService.js
│       │   │
│       │   ├── utils/
│       │   │   ├── chunkText.js
│       │   │   └── cosineSimilarity.js
│       │   │
│       │   ├── database.js
│       │   └── server.js
│       │
│       ├── package.json
│       └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Requirements

Install the following before running the application:

- Node.js 22.19 or newer.
- npm.
- A Google Gemini API key with access to the required models.
- A Neon PostgreSQL database and connection string.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/meghanasingh980-create/mindvault-ai-knowledge-inbox.git
cd mindvault-ai-knowledge-inbox
```

### 2. Configure the backend environment

The backend is located inside `backend/server`.

Copy the environment example file into the backend server directory.

PowerShell:

```powershell
Copy-Item .\backend\.env.example .\backend\server\.env
```

Open `backend/server/.env` and configure:

```
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_postgresql_connection_string
```

Replace the placeholder values with your own credentials.

**Important security notes:**
- Never commit `.env` files to GitHub.
- Never expose the Gemini API key in frontend code.
- Never expose the PostgreSQL connection string in frontend code.
- Use your own Gemini API key and Neon database credentials.

### 3. Install backend dependencies

Open a terminal in the project root:

```powershell
cd backend/server
npm install
```

### 4. Start the backend server

```powershell
npm run dev
```

The backend normally runs at:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

On startup, the backend initializes the required PostgreSQL tables if they do not already exist.

Keep the backend terminal running.

### 5. Install frontend dependencies

Open another terminal from the project root:

```powershell
cd frontend
npm install
```

### 6. Start the frontend

```powershell
npm run dev
```

Open the local URL displayed by Vite, normally:

`http://localhost:5173`

The frontend communicates with the backend API running on port 5000.

## Database Design

MindVault uses Neon PostgreSQL with two primary tables.

### items

Stores the original saved notes and webpage information.

| Column | Description |
|---|---|
| id | Unique item identifier |
| title | Saved item title |
| content | Original processed content |
| source_type | Note or URL |
| source_url | Original webpage URL |
| created_at | Creation timestamp |

### chunks

Stores the processed text chunks and their embeddings.

| Column | Description |
|---|---|
| id | Unique chunk identifier |
| item_id | Associated saved item |
| chunk_index | Chunk position |
| content | Individual text chunk |
| embedding | Serialized numerical embedding vector |
| embedding_model | Model used to generate the embedding |
| created_at | Creation timestamp |

The `item_id` column references the `items` table. Deleting an item also deletes its associated chunks.

## ## How Semantic Search and RAG Work

1. The user saves a text note or webpage.
2. The backend extracts or processes the content.
3. The content is divided into smaller text chunks.
4. Gemini generates an embedding for each chunk using `gemini-embedding-001`.
5. The original content and serialized embedding vectors are stored in Neon PostgreSQL.
6. The user submits a question through the AI Assistant.
7. Gemini converts the question into an embedding.
8. The backend retrieves stored chunks that contain embeddings.
9. Cosine similarity compares the question vector with the stored content vectors.
10. Relevant chunks are ranked by similarity and grouped by their original saved items.
11. The backend selects up to 5 saved items based on their highest chunk similarity scores.
12. Up to 3 relevant chunks per selected item are included as context for the Gemini chat model.
13. Gemini generates an answer using the retrieved content.
14. The application displays the answer with supporting source citations.

**Retrieval details:**

- All stored embeddings are currently loaded and compared in application code.
- No minimum similarity threshold is applied.
- The top 5 items are selected based on their highest-scoring chunks.

### Cosine Similarity

Cosine similarity measures how closely two vectors point in the same direction.

The application calculates similarity using:

```text
similarity(A, B) =
    (A · B) / (||A|| × ||B||)
```

A higher score indicates greater vector similarity.

The application uses the similarity scores to rank relevant content before sending it to the Gemini chat model.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API health |
| POST | `/api/ingest` | Save a note or webpage |
| GET | `/api/items` | Retrieve saved items |
| DELETE | `/api/items/:id` | Delete a saved item |
| POST | `/api/query` | Ask questions using saved knowledge |

### Save a text note

`POST /api/ingest`

Example request:

```json
{
  "type": "note",
  "title": "C# Basics",
  "content": "C# is an object-oriented programming language."
}
```

### Save a website

`POST /api/ingest`

Example request:

```json
{
  "type": "url",
  "url": "https://example.com/article",
  "title": ""
}
```

The backend extracts readable webpage content, divides it into chunks, generates embeddings, and stores the processed information in PostgreSQL.

### Retrieve saved items

`GET /api/items`

Returns saved notes and webpages.

### Delete a saved item

`DELETE /api/items/:id`

Deletes the selected saved item and its associated chunks.

### Ask a question

`POST /api/query`

Example request:

```json
{
  "question": "What does my saved note say about C#?"
}
```

The backend generates a question embedding, retrieves relevant chunks using cosine similarity, and generates an answer with source citations.

## Production Build

To create an optimized frontend build:

```powershell
cd frontend
npm run build
```

To run the production preview:

```powershell
npm run preview
```

The preview server normally runs at:

`http://localhost:4173`

The backend must also be running and configured to allow the frontend origin.

## Design Decisions and Technical Tradeoffs

### 1. PostgreSQL and Neon

Neon PostgreSQL provides persistent cloud database storage without requiring a locally installed database server.

**Tradeoff:** The application depends on an external database connection and internet access.

### 2. JSON-based embedding storage

Embedding vectors are currently serialized as JSON strings and stored in a PostgreSQL `TEXT` column.

**Tradeoff:** This keeps the implementation straightforward and avoids requiring the PostgreSQL `pgvector` extension. However, vector comparisons are performed in application code rather than by a specialized vector index.

### 3. Application-level cosine similarity

The backend retrieves stored vectors and calculates cosine similarity using JavaScript.

**Tradeoff:** This is easy to understand and suitable for a small knowledge collection. Retrieving and comparing every stored vector will become less efficient as the database grows.

### 4. Chunk-based retrieval

Long content is divided into smaller chunks so that relevant sections can be retrieved rather than relying on entire documents.

**Tradeoff:** Chunk size and overlap affect retrieval quality and API usage.

### 5. Gemini API integration

Gemini is used for embedding generation and AI answer generation.

**Tradeoff:** The application depends on API availability, rate limits, model access, and usage costs.

### 6. Website content extraction

Cheerio is used to extract readable content from webpage HTML.

**Tradeoff:** Websites requiring JavaScript rendering, authentication, or blocking automated requests may not be supported.

### 7. Current application scope

MindVault is currently designed as a small single-user knowledge management application.

Authentication, multi-user data isolation, and advanced production access controls are not yet implemented.

## Validation and Testing

The following checks have been performed during development:

- Backend health endpoint verification.
- PostgreSQL connection and table initialization.
- Embedding generation and persistence verification.
- Stored embedding dimension verification.
- Semantic question-answering test using differently worded questions.
- Source citation verification.
- Empty note validation.
- Empty URL validation.
- Invalid content type validation.
- Frontend development server verification.
- Frontend production build verification using `npm run build`.
- Frontend production preview verification using `npm run preview`, including AI question answering and source citations.
## Future Improvements

- User authentication and account management.
- Multi-user data isolation.
- PostgreSQL `pgvector` integration and vector indexing.
- Improved webpage extraction and JavaScript-rendered content support.
- Background processing for large ingestion tasks.
- Rate limiting and monitoring.
- More comprehensive automated tests.
- Improved production security and deployment configuration.

## Security Notes

- Keep API keys and database credentials in environment variables.
- Never commit `.env` files or private credentials to GitHub.
- Validate external URLs and block known local or private network addresses. Additional SSRF protections, including DNS resolution checks, are needed before production use.
- Configure CORS for trusted frontend origins.
- Use authentication and authorization before supporting multiple users.
- Avoid exposing internal server errors or stack traces to clients.

## Project Status

MindVault includes note saving, webpage ingestion, content extraction, embedding generation, PostgreSQL persistence, semantic retrieval, AI-powered answers, source citations, clickable URLs, and item deletion.

The embedding persistence and semantic question-answering workflow have been tested locally.

---

**MindVault — Your knowledge, connected.**