# Assistant API Contracts

This file defines the request/response contracts for IJAM_BOT assistant orchestration and worker services.

## Public Endpoint

### `POST /api/assistant/chat`

Request:

```json
{
  "session_id": "uuid-or-client-id",
  "user_id": "uuid",
  "message": "summarize this page",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "system_prompt": "optional override",
  "context": {
    "url": "https://example.com/article",
    "page": "resource"
  },
  "options": {
    "use_memory": true,
    "allow_scrape": false,
    "model": "meta/llama-3.3-70b-instruct"
  }
}
```

Response:

```json
{
  "answer": "Ringkasan ...",
  "sources": [
    {
      "url": "https://example.com/article",
      "title": "Example Article",
      "excerpt": "..."
    }
  ],
  "meta": {
    "trace_id": "uuid",
    "used_memory": true,
    "used_scrape": false,
    "model": "meta/llama-3.3-70b-instruct",
    "latency_ms": 1240
  }
}
```

## Memory Worker

### `POST /v1/memory/retrieve`

Request:

```json
{
  "user_id": "uuid",
  "query": "user message",
  "limit": 8
}
```

Response:

```json
{
  "memory_block": "- fact one\n- fact two",
  "items": [
    { "content": "fact one", "score": 0.95 }
  ]
}
```

### `POST /v1/memory/capture`

Request:

```json
{
  "user_id": "uuid",
  "session_id": "uuid-or-client-id",
  "user_message": "...",
  "assistant_message": "...",
  "metadata": { "topic": "onboarding" }
}
```

Response:

```json
{
  "ok": true
}
```

### `POST /v1/memory/write`

Request:

```json
{
  "user_id": "uuid",
  "target": "today",
  "content": "User prefers practical steps.",
  "append": true
}
```

Response:

```json
{
  "ok": true
}
```

## Scrape Worker

### `POST /v1/scrape/jobs`

Request:

```json
{
  "user_id": "uuid",
  "urls": ["https://example.com"],
  "mode": "single",
  "max_pages": 1
}
```

Response:

```json
{
  "id": "uuid",
  "status": "queued"
}
```

### `GET /v1/scrape/jobs/{id}`

Response:

```json
{
  "id": "uuid",
  "status": "done",
  "results": [
    {
      "url": "https://example.com",
      "title": "Example",
      "text": "cleaned body text",
      "word_count": 532
    }
  ],
  "error": null
}
```
