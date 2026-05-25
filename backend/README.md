# Harput Castle — Backend

FastAPI + Python backend for the Harput Rehberi mobile app.

## Features

| System | Endpoints |
|--------|-----------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| **Gallery** | `GET /gallery`, `POST /gallery/upload`, `GET /media/{filename}` |
| **Reviews** | `GET /reviews/{place_slug}`, `GET /reviews/{place_slug}/summary`, `POST /reviews/{place_slug}` |
| **Assistant** | `POST /assistant/chat` (SSE stream) |

## Getting Started

### 1. Prerequisites

- Python 3.11+
- `pip`

### 2. Set up environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure `.env`

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Any long random string — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `GEMINI_API_KEY` | Your Gemini API key (see below) |

Everything else works with its default values for local development.

### 4. Get a Gemini API Key (free)

1. Go to **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and paste it into `GEMINI_API_KEY=` in your `.env` file

The free tier of **Gemini 2.0 Flash** is used — no billing required.

### 5. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- **API**: `http://localhost:8000`
- **Interactive docs (Swagger)**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── main.py          # App factory, CORS, static files, routers
│   ├── config.py        # Settings loaded from .env
│   ├── database.py      # Async SQLAlchemy + SQLite
│   ├── dependencies.py  # get_db, get_current_user
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic (auth, gallery, assistant)
│   └── routers/         # FastAPI route handlers
├── media/               # Uploaded gallery images (auto-created)
├── harput.db            # SQLite database (auto-created on first run)
├── .env                 # Your local config (not committed)
├── .env.example         # Template
└── requirements.txt
```

## Auth Flow

```
POST /auth/register   →  { id, username, email, created_at }
POST /auth/login      →  { access_token, refresh_token, token_type }
POST /auth/refresh    →  { access_token, refresh_token, token_type }
GET  /auth/me         →  { id, username, email, is_active, created_at }
```

- Access token expires in **30 minutes**
- Refresh token expires in **7 days** and is rotated on every refresh call
- Send the access token as: `Authorization: Bearer <token>`

## Gallery

- Anyone can fetch images: `GET /gallery?cursor=&limit=20`
- Any authenticated user can upload: `POST /gallery/upload` (multipart form, field name `file`)
- Images are served as static files: `GET /media/{filename}`

## Reviews

- Place slugs are validated against the 19 hardcoded Harput sites
- One review per user per place (enforced at DB level)
- Auth required to POST a review; anyone can GET reviews

## Assistant

- Streams responses as **Server-Sent Events**
- Auth required
- Powered by **Gemini 2.0 Flash** with a Harput Castle system prompt
- Responds in the same language the user writes in (Turkish or English)
