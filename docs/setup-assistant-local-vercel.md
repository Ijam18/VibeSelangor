# Setup Guide: Local + Vercel (Assistant, Memory, Scrape)

This guide matches the code in:

- `api/assistant/chat.js`
- `src/lib/assistantApi.js`
- `services/memory-service/*`
- `services/scrape-service/*`

## 1) Local Environment

Create `.env.local` at project root:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
NVIDIA_API_KEY_70B=YOUR_NVIDIA_KEY

FEATURE_MEMORY_EXTRACT=true
FEATURE_SCRAPLING=false
ASSISTANT_MAX_SCRAPE_URLS=3

MEMORY_SERVICE_URL=http://localhost:8081
SCRAPE_SERVICE_URL=http://localhost:8082

VITE_USE_ASSISTANT_API=true
```

## 2) Run Memory Worker (Go)

```powershell
cd services/memory-service
go mod tidy
$env:PORT="8081"
$env:MEMORY_WORKSPACE="..\.."
go run .
```

Health check:

```powershell
Invoke-RestMethod -Uri "http://localhost:8081/health"
```

## 3) Run Scrape Worker (Python)

```powershell
cd services/scrape-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -e ..\..\Scrapling-main
$env:PORT="8082"
uvicorn app:app --host 0.0.0.0 --port $env:PORT
```

Health check:

```powershell
Invoke-RestMethod -Uri "http://localhost:8082/health"
```

## 4) Run App + API Locally

Use Vercel dev so `/api/*` works:

```powershell
vercel dev
```

Open the shown localhost URL and test IJAM_BOT.

Optional helper:

```powershell
.\scripts\start-local-assistant-stack.ps1
```

## 5) Vercel Environment Variables

In Vercel Dashboard -> Project -> Settings -> Environment Variables, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NVIDIA_API_KEY_70B`
- `FEATURE_MEMORY_EXTRACT`
- `FEATURE_SCRAPLING`
- `ASSISTANT_MAX_SCRAPE_URLS`
- `MEMORY_SERVICE_URL`
- `SCRAPE_SERVICE_URL`
- `VITE_USE_ASSISTANT_API`

Deploy after saving.

## 6) Recommended Rollout

1. `FEATURE_MEMORY_EXTRACT=true`
2. `FEATURE_SCRAPLING=false`
3. Verify traces in `assistant_traces`
4. Then enable scraping with `FEATURE_SCRAPLING=true`
