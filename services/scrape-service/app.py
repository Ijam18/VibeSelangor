from __future__ import annotations

import asyncio
import os
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
    import requests
    from bs4 import BeautifulSoup
except Exception:  # pragma: no cover
    requests = None
    BeautifulSoup = None

try:
    from scrapling.fetchers import Fetcher  # type: ignore
except Exception:  # pragma: no cover
    Fetcher = None


app = FastAPI(title="Vibe Scrape Service", version="0.1.0")


class CreateJobRequest(BaseModel):
    user_id: str
    urls: list[str] = Field(min_length=1)
    mode: str = "single"
    max_pages: int = 1


class ScrapeResult(BaseModel):
    url: str
    title: str = ""
    text: str = ""
    word_count: int = 0


class JobResponse(BaseModel):
    id: str
    status: str
    results: list[ScrapeResult] = []
    error: str | None = None


@dataclass
class JobState:
    id: str
    user_id: str
    urls: list[str]
    mode: str
    max_pages: int
    status: str = "queued"
    results: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None
    created_at: float = field(default_factory=time.time)


JOBS: dict[str, JobState] = {}


@app.get("/health")
async def health() -> dict[str, bool]:
    return {"ok": True}


@app.post("/v1/scrape/jobs", response_model=JobResponse)
async def create_job(req: CreateJobRequest) -> JobResponse:
    if req.mode not in {"single", "crawl"}:
        raise HTTPException(status_code=400, detail="mode must be single or crawl")

    max_pages = max(1, min(req.max_pages, 3))
    urls = [u.strip() for u in req.urls if u and u.strip()]
    if not urls:
        raise HTTPException(status_code=400, detail="urls is required")

    job_id = str(uuid.uuid4())
    job = JobState(
        id=job_id,
        user_id=req.user_id,
        urls=urls[: max_pages if req.mode == "crawl" else 1],
        mode=req.mode,
        max_pages=max_pages,
    )
    JOBS[job_id] = job
    asyncio.create_task(run_job(job_id))
    return JobResponse(id=job_id, status=job.status)


@app.get("/v1/scrape/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str) -> JobResponse:
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    return JobResponse(
        id=job.id,
        status=job.status,
        results=[ScrapeResult(**item) for item in job.results],
        error=job.error,
    )


async def run_job(job_id: str) -> None:
    job = JOBS.get(job_id)
    if not job:
        return
    job.status = "running"
    try:
        results: list[dict[str, Any]] = []
        for url in job.urls:
            result = await scrape_one(url)
            results.append(result)
        job.results = results
        job.status = "done"
    except Exception as exc:  # pragma: no cover
        job.status = "failed"
        job.error = str(exc)


async def scrape_one(url: str) -> dict[str, Any]:
    use_scrapling = os.getenv("USE_SCRAPLING", "false").strip().lower() in {"1", "true", "yes"}
    if use_scrapling and Fetcher is not None:
        page = await asyncio.to_thread(Fetcher.get, url)
        title = ""
        text = ""
        try:
            title = page.css("title::text").get() or ""
            text = " ".join(page.css("p::text").getall())[:10000]
        except Exception:
            title = ""
            text = str(page)[:5000]
        return {
            "url": url,
            "title": title,
            "text": text,
            "word_count": len(text.split()),
        }

    if requests is None or BeautifulSoup is None:
        raise RuntimeError("Neither Scrapling nor requests/bs4 are available.")

    try:
        response = await asyncio.to_thread(requests.get, url, timeout=15)
    except requests.exceptions.SSLError:
        # Local Windows cert stores can fail in ad-hoc setups. Retry without verify.
        response = await asyncio.to_thread(requests.get, url, timeout=15, verify=False)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    title = (soup.title.string or "").strip() if soup.title else ""
    text = " ".join(p.get_text(" ", strip=True) for p in soup.find_all("p"))[:10000]
    return {
        "url": url,
        "title": title,
        "text": text,
        "word_count": len(text.split()),
    }
