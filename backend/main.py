"""
Crypto Alpha Intelligence — Nitter Scraper Backend
FastAPI service that scrapes Nitter instances for crypto alpha signals.

Run with:
    uvicorn main:app --reload --port 8000

Or with the helper script:
    python run.py
"""

from __future__ import annotations

import asyncio
import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scraper import (
    NitterScraper,
    ScrapedTweet,
    classify_strength,
    match_keywords,
    score_tweet,
)

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Crypto Alpha Intelligence — Nitter Scraper",
    description="Zero-cost Twitter scraping via Nitter instances",
    version="1.0.0",
)

# Allow requests from the Next.js frontend (localhost:3000 in dev)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared scraper instance (reuses HTTP connections, tracks instance health)
scraper = NitterScraper(timeout=15, max_retries=3)

# ─── Default Keywords ─────────────────────────────────────────────────────────

DEFAULT_KEYWORDS = [
    "FCFS",
    "first come first serve",
    "whitelist open",
    "airdrop live",
    "mint now",
    "presale",
    "alpha call",
    "stealth launch",
    "free mint",
    "WL spots",
]

# ─── Response Models ──────────────────────────────────────────────────────────

class TweetResult(BaseModel):
    id: str
    text: str
    author: str
    handle: str
    timestamp: str
    is_reply: bool
    is_retweet: bool
    matched_keywords: list[str]
    score: int
    strength: str  # "low" | "medium" | "high" | "critical"
    url: str
    likes: int
    retweets: int
    replies: int


class SearchResponse(BaseModel):
    query: str
    total: int
    tweets: list[TweetResult]


class HealthResponse(BaseModel):
    status: str
    instances: dict[str, bool]
    healthy_count: int
    total_count: int


class ScanRequest(BaseModel):
    keywords: list[str] = DEFAULT_KEYWORDS
    max_per_keyword: int = 20
    filter_replies: bool = True
    filter_retweets: bool = True
    min_score: int = 30


class ScanResponse(BaseModel):
    total_scanned: int
    passed: int
    filtered: int
    results: list[TweetResult]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _enrich(tweet: ScrapedTweet, keywords: list[str]) -> TweetResult:
    """Enrich a raw scraped tweet with scoring and keyword matching."""
    matched = match_keywords(tweet.text, keywords)
    score, _ = score_tweet(tweet.text)
    strength = classify_strength(score)
    return TweetResult(
        id=tweet.id,
        text=tweet.text,
        author=tweet.author,
        handle=tweet.handle,
        timestamp=tweet.timestamp,
        is_reply=tweet.is_reply,
        is_retweet=tweet.is_retweet,
        matched_keywords=matched,
        score=score,
        strength=strength,
        url=tweet.url,
        likes=tweet.likes,
        retweets=tweet.retweets,
        replies=tweet.replies,
    )


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/", tags=["meta"])
async def root():
    return {
        "service": "Crypto Alpha Intelligence — Nitter Scraper",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["meta"])
async def health_check():
    """
    Check which Nitter instances are currently alive.
    Call this from the Settings page to show instance status.
    """
    instances = await scraper.check_instance_health()
    healthy = sum(1 for v in instances.values() if v)
    return HealthResponse(
        status="ok" if healthy > 0 else "degraded",
        instances=instances,
        healthy_count=healthy,
        total_count=len(instances),
    )


@app.get("/search", response_model=SearchResponse, tags=["scraping"])
async def search_tweets(
    q: str = Query(..., description="Search query, e.g. 'FCFS mint'"),
    max_results: int = Query(50, ge=1, le=200, description="Max tweets to return"),
    filter_replies: bool = Query(True, description="Exclude reply tweets"),
    filter_retweets: bool = Query(True, description="Exclude retweets"),
):
    """
    Search Nitter for tweets matching a query.
    Automatically falls back through healthy Nitter instances.
    """
    tweets = await scraper.search(
        query=q,
        max_results=max_results,
        filter_replies=filter_replies,
        filter_retweets=filter_retweets,
    )

    results = [_enrich(t, [q]) for t in tweets]

    return SearchResponse(
        query=q,
        total=len(results),
        tweets=results,
    )


@app.post("/scan", response_model=ScanResponse, tags=["scraping"])
async def run_pipeline_scan(body: ScanRequest):
    """
    Run a full pipeline scan across all configured keywords.

    This is the main endpoint called by the dashboard. It:
    1. Searches Nitter for each keyword concurrently
    2. Deduplicates tweets
    3. Scores each tweet for FCFS/alpha signal strength
    4. Filters by minimum score
    5. Returns enriched results sorted by score (highest first)
    """
    # Run all keyword searches concurrently
    tasks = [
        scraper.search(
            query=kw,
            max_results=body.max_per_keyword,
            filter_replies=body.filter_replies,
            filter_retweets=body.filter_retweets,
        )
        for kw in body.keywords
    ]
    all_results = await asyncio.gather(*tasks, return_exceptions=True)

    # Deduplicate by tweet ID
    seen: set[str] = set()
    raw_tweets: list[ScrapedTweet] = []
    for result in all_results:
        if isinstance(result, Exception):
            continue
        for tweet in result:
            if tweet.id not in seen:
                seen.add(tweet.id)
                raw_tweets.append(tweet)

    total_scanned = len(raw_tweets)

    # Enrich and filter by minimum score
    enriched = [_enrich(t, body.keywords) for t in raw_tweets]
    passed = [t for t in enriched if t.score >= body.min_score]
    filtered_count = total_scanned - len(passed)

    # Sort by score descending
    passed.sort(key=lambda t: t.score, reverse=True)

    return ScanResponse(
        total_scanned=total_scanned,
        passed=len(passed),
        filtered=filtered_count,
        results=passed,
    )


@app.get("/user/{handle}", response_model=SearchResponse, tags=["scraping"])
async def get_user_tweets(
    handle: str,
    max_results: int = Query(20, ge=1, le=100),
    filter_replies: bool = Query(True),
    filter_retweets: bool = Query(True),
):
    """
    Fetch recent tweets from a specific Twitter/X account via Nitter.
    Useful for monitoring tracked project accounts.
    """
    tweets = await scraper.get_user_tweets(
        handle=handle,
        max_results=max_results,
        filter_replies=filter_replies,
        filter_retweets=filter_retweets,
    )

    results = [_enrich(t, DEFAULT_KEYWORDS) for t in tweets]

    return SearchResponse(
        query=f"@{handle.lstrip('@')}",
        total=len(results),
        tweets=results,
    )


@app.get("/instances", tags=["meta"])
async def list_instances():
    """List all configured Nitter instances and their cooldown status."""
    from scraper import NITTER_INSTANCES
    import time

    now = time.time()
    return {
        "instances": [
            {
                "url": inst,
                "in_cooldown": now - scraper._instance_health.get(inst, 0) <= scraper._cooldown,
                "last_failed": scraper._instance_health.get(inst),
            }
            for inst in NITTER_INSTANCES
        ]
    }
