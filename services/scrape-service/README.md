# Scrape Service (Local Worker)

Contract-compatible scrape worker for `POST /v1/scrape/jobs` and `GET /v1/scrape/jobs/{id}`.

It prefers Scrapling when installed, and falls back to `requests + beautifulsoup4`.

## Run

```powershell
cd services/scrape-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -e ..\..\Scrapling-main
$env:PORT="8082"
uvicorn app:app --host 0.0.0.0 --port $env:PORT
```

## Quick test

```powershell
$job = Invoke-RestMethod -Method Post -Uri "http://localhost:8082/v1/scrape/jobs" -ContentType "application/json" -Body '{"user_id":"local-test","urls":["https://example.com"],"mode":"single","max_pages":1}'
Invoke-RestMethod -Uri ("http://localhost:8082/v1/scrape/jobs/" + $job.id)
```
