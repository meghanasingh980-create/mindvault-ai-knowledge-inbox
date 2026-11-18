# MindVault — AI Knowledge Inbox

MindVault is a full-stack AI-powered knowledge management application that allows users to save text notes and website URLs in one place and ask questions about their saved information.

It uses Retrieval-Augmented Generation (RAG) to retrieve relevant saved content and generate AI answers with source references.

## Features

- **Save text notes:** Store personal notes and useful information.
- **Save website URLs:** Extract and save readable webpage content.
- **Optional website titles:** Save a website without entering a title, or provide your own title.
- **Knowledge library:** View and manage saved notes and webpages.
- **Search and filtering:** Find saved information and filter by content type.
- **AI-powered question answering:** Ask questions using your saved knowledge.
- **Source citations:** Display the saved items used to generate each answer.
- **Duplicate-source handling:** Display separate citations for separately saved items, even when they contain similar content.
- **Clickable website links:** Open original websites from the Library and AI source references.
- **Delete saved items:** Remove unwanted notes and webpages.
- **SQLite persistence:** Keep saved content and embeddings in a local database.

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
- SQLite
- better-sqlite3
- Google Gemini API
- Cheerio for webpage content extraction

### AI and Retrieval
- Gemini Embedding Model: `gemini-embedding-001`
- Gemini Chat Model: `gemini-3.5-flash-lite`
- Cosine similarity for semantic retrieval
- Retrieval-Augmented Generation (RAG)

## Project Structure

```text
ai-knowledge-inbox/
│
├── backend/
│   ├── .env.example
│   └── server/
│       ├── data/
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── database.js
│       │   └── server.js
│       ├── .env
│       ├── package.json
│       └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── style.css
│   ├── dist/
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- Google Gemini API key with access to the required models

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd ai-knowledge-inbox
```

### 2. Configure the backend

The backend application is located inside `backend/server`.

Copy the environment example file into the backend server folder.

PowerShell:

```powershell
Copy-Item .\backend\.env.example .\backend\server\.env
```

Open `backend/server/.env` and configure:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

Use your own valid Gemini API key. Never upload the `.env` file or expose API keys in source code or GitHub.

### 3. Install backend dependencies

```powershell
cd backend/server
npm install
```

### 4. Start the backend server

```powershell
npm run dev
```

The backend API runs at:

http://localhost:5000

Health check:

http://localhost:5000/api/health

Keep this terminal running.

### 5. Install frontend dependencies

Open a new terminal from the project root.

```powershell
cd frontend
npm install
```

### 6. Start the frontend

```powershell
npm run dev
```

Open the local URL displayed by Vite, normally:

http://localhost:5173

## Production Build

To create an optimized frontend production build:

```powershell
cd frontend
npm run build
```

To run the production preview:

```powershell
npm run preview
```

The preview server normally runs at:

http://localhost:4173

The backend must also be running on port 5000.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API health |
| POST | `/api/ingest` | Save a text note or website |
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

The title is optional. When it is empty, the website is saved without automatically using the extracted webpage title.

The backend extracts readable webpage content, divides it into chunks, generates embeddings and stores the processed information in SQLite.

### Retrieve saved items

`GET /api/items`

Returns saved notes and webpages, including their source information and chunk counts.

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

The application generates an embedding for the question, ranks stored content using cosine similarity and retrieves relevant saved items.

The Gemini model generates an answer using the retrieved content and provides source citations.

## How RAG Works in MindVault

1. The user saves a text note or website.
2. The backend processes the content and divides it into smaller chunks.
3. Gemini generates embeddings for the content.
4. The content and embeddings are stored in SQLite.
5. The user asks a question through the AI Assistant.
6. The question is converted into an embedding.
7. Cosine similarity identifies relevant stored content.
8. Relevant chunks are grouped by their original saved item.
9. Gemini generates an answer using the retrieved information.
10. The application displays the answer and its supporting sources.

## Design Decisions and Limitations

- **Local database:** SQLite keeps the application lightweight and avoids requiring a separate database server.
- **Semantic retrieval:** Cosine similarity provides a straightforward approach to finding relevant saved content.
- **Source grouping:** Multiple chunks belonging to one saved item are presented under a single source citation.
- **Website extraction:** Cheerio extracts readable HTML content. Websites requiring JavaScript rendering or blocking automated requests may not be supported.
- **API dependency:** A valid Gemini API key is required for embedding generation and AI question answering.
- **Single-user design:** The application is currently intended as a small single-user project rather than a multi-user hosted service.

## Future Improvements

- User authentication and account management.
- Multi-user data isolation.
- Background processing for large website ingestion tasks.
- Improved webpage extraction and JavaScript-rendered content support.
- More advanced vector database integration.
- Rate limiting, monitoring and improved error handling.
- Cloud deployment and production security enhancements.

## Security Notes

- Keep API keys in environment variables.
- Never commit `.env` files or private credentials to GitHub.
- Validate external URLs and protect against server-side request forgery (SSRF).
- Configure authentication, authorization and request limits before public deployment.

## Project Status

MindVault includes working note saving, website ingestion, content extraction, semantic retrieval, AI-powered answers, source citations, clickable URLs and item deletion.

The application has been tested in both development and production-preview environments.

---

**MindVault — Your knowledge, connected.**