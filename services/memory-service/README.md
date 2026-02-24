# Memory Service (Local Worker)

HTTP wrapper around `memory-extract` for assistant orchestration.

## Endpoints

- `GET /health`
- `POST /v1/memory/retrieve`
- `POST /v1/memory/capture`
- `POST /v1/memory/write`

## Run

```powershell
cd services/memory-service
go mod tidy
$env:PORT="8081"
$env:MEMORY_WORKSPACE="..\.."
go run .
```

`MEMORY_WORKSPACE` points to where `memory/` files are written (defaults to current dir).
