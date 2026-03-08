"""
Nitter-based Twitter scraper — zero API cost.

Scrapes public Nitter instances (open-source Twitter frontends) to collect
tweets matching keywords. Falls back through a list of known instances when
one is unavailable.
"""

import asyncio
import re
import time
from dataclasses import dataclass, field
from typing import Optional
import httpx
from bs4 import BeautifulSoup

# ─── Nitter Instance Pool ─────────────────────────────────────────────────────
# Public Nitter instances — ordered by reliability. The scraper rotates through
# these automatically when one fails or rate-limits us.
NITTER_INSTANCES = [
    "https://nitter.privacydev.net",
    "https://nitter.poast.org",
    "https://nitter.1d4.us",
    "https://nitter.kavin.rocks",
    "https://nitter.unixfox.eu",
    "https://nitter.moomoo.me",
    "https://nitter.it",
    "https://nitter.nl",
]

# ─── Data Models ──────────────────────────────────────────────────────────────

@dataclass
class ScrapedTweet:
    id: str
    text: str
    author: str
    handle: str
    timestamp: str
    is_reply: bool
    is_retweet: bool
    matched_keywords: list[str] = field(default_factory=list)
    url: str = ""
    likes: int = 0
    retweets: int = 0
    replies: int = 0


# ─── Nitter Scraper ───────────────────────────────────────────────────────────

class NitterScraper:
    """
    Scrapes Nitter instances for tweets matching keywords.

    Usage:
        scraper = NitterScraper()
        tweets = await scraper.search("FCFS mint", max_results=50)
    """

    def __init__(self, timeout: int = 15, max_retries: int = 3):
        self.timeout = timeout
        self.max_retries = max_retries
        self._instance_health: dict[str, float] = {}  # instance -> last_fail_time
        self._cooldown = 120  # seconds to wait before retrying a failed instance

    def _get_healthy_instances(self) -> list[str]:
        """Return instances that are not in cooldown."""
        now = time.time()
        return [
            inst for inst in NITTER_INSTANCES
            if now - self._instance_health.get(inst, 0) > self._cooldown
        ]

    def _mark_failed(self, instance: str) -> None:
        self._instance_health[instance] = time.time()

    async def _fetch(self, url: str, client: httpx.AsyncClient) -> Optional[str]:
        """Fetch a URL, returning HTML or None on failure."""
        try:
            resp = await client.get(url, timeout=self.timeout, follow_redirects=True)
            if resp.status_code == 200:
                return resp.text
        except Exception:
            pass
        return None

    def _parse_tweets(self, html: str, base_url: str) -> list[ScrapedTweet]:
        """Parse Nitter search results HTML into ScrapedTweet objects."""
        soup = BeautifulSoup(html, "html.parser")
        tweets: list[ScrapedTweet] = []

        for item in soup.select(".timeline-item"):
            # Skip pinned tweets and ads
            if item.select_one(".pinned"):
                continue

            try:
                # Tweet text
                content_el = item.select_one(".tweet-content")
                if not content_el:
                    continue
                text = content_el.get_text(separator=" ", strip=True)

                # Author info
                fullname_el = item.select_one(".fullname")
                username_el = item.select_one(".username")
                author = fullname_el.get_text(strip=True) if fullname_el else "Unknown"
                handle = username_el.get_text(strip=True) if username_el else "@unknown"
                if not handle.startswith("@"):
                    handle = f"@{handle}"

                # Timestamp
                time_el = item.select_one(".tweet-date a")
                timestamp = ""
                if time_el:
                    timestamp = time_el.get("title", time_el.get_text(strip=True))

                # Tweet link / ID
                tweet_link = item.select_one(".tweet-link")
                tweet_url = ""
                tweet_id = ""
                if tweet_link:
                    href = tweet_link.get("href", "")
                    tweet_url = f"{base_url}{href}" if href.startswith("/") else href
                    # Extract ID from URL like /user/status/12345
                    m = re.search(r"/status/(\d+)", href)
                    tweet_id = m.group(1) if m else href

                # Reply / retweet detection
                is_reply = bool(item.select_one(".replying-to"))
                is_retweet = bool(item.select_one(".retweet-header"))

                # Stats
                def _stat(selector: str) -> int:
                    el = item.select_one(selector)
                    if el:
                        try:
                            return int(el.get_text(strip=True).replace(",", ""))
                        except ValueError:
                            pass
                    return 0

                likes = _stat(".icon-heart + span") or _stat(".tweet-stat:nth-child(4) span")
                retweets = _stat(".icon-retweet + span") or _stat(".tweet-stat:nth-child(3) span")
                replies = _stat(".icon-comment + span") or _stat(".tweet-stat:nth-child(1) span")

                tweets.append(ScrapedTweet(
                    id=tweet_id,
                    text=text,
                    author=author,
                    handle=handle,
                    timestamp=timestamp,
                    is_reply=is_reply,
                    is_retweet=is_retweet,
                    url=tweet_url,
                    likes=likes,
                    retweets=retweets,
                    replies=replies,
                ))

            except Exception:
                continue

        return tweets

    async def search(
        self,
        query: str,
        max_results: int = 50,
        filter_replies: bool = True,
        filter_retweets: bool = True,
    ) -> list[ScrapedTweet]:
        """
        Search Nitter for tweets matching `query`.

        Args:
            query: Search term (e.g. "FCFS mint" or "airdrop live")
            max_results: Maximum number of tweets to return
            filter_replies: If True, exclude reply tweets
            filter_retweets: If True, exclude retweets

        Returns:
            List of ScrapedTweet objects
        """
        instances = self._get_healthy_instances()
        if not instances:
            # All instances in cooldown — reset and try anyway
            self._instance_health.clear()
            instances = NITTER_INSTANCES[:]

        all_tweets: list[ScrapedTweet] = []
        seen_ids: set[str] = set()

        async with httpx.AsyncClient(
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept-Language": "en-US,en;q=0.9",
            }
        ) as client:
            for instance in instances:
                if len(all_tweets) >= max_results:
                    break

                encoded_query = query.replace(" ", "+")
                url = f"{instance}/search?q={encoded_query}&f=tweets"

                html = await self._fetch(url, client)
                if not html:
                    self._mark_failed(instance)
                    continue

                tweets = self._parse_tweets(html, instance)
                if not tweets:
                    # Likely blocked or instance is down
                    self._mark_failed(instance)
                    continue

                for tweet in tweets:
                    if tweet.id in seen_ids:
                        continue
                    if filter_replies and tweet.is_reply:
                        continue
                    if filter_retweets and tweet.is_retweet:
                        continue
                    seen_ids.add(tweet.id)
                    all_tweets.append(tweet)

                    if len(all_tweets) >= max_results:
                        break

        return all_tweets

    async def get_user_tweets(
        self,
        handle: str,
        max_results: int = 20,
        filter_replies: bool = True,
        filter_retweets: bool = True,
    ) -> list[ScrapedTweet]:
        """
        Fetch recent tweets from a specific user account.

        Args:
            handle: Twitter handle (with or without @)
            max_results: Maximum tweets to return
        """
        handle = handle.lstrip("@")
        instances = self._get_healthy_instances()
        if not instances:
            self._instance_health.clear()
            instances = NITTER_INSTANCES[:]

        async with httpx.AsyncClient(
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                ),
            }
        ) as client:
            for instance in instances:
                url = f"{instance}/{handle}"
                html = await self._fetch(url, client)
                if not html:
                    self._mark_failed(instance)
                    continue

                tweets = self._parse_tweets(html, instance)
                if not tweets:
                    self._mark_failed(instance)
                    continue

                result = []
                for tweet in tweets:
                    if filter_replies and tweet.is_reply:
                        continue
                    if filter_retweets and tweet.is_retweet:
                        continue
                    result.append(tweet)
                    if len(result) >= max_results:
                        break

                return result

        return []

    async def check_instance_health(self) -> dict[str, bool]:
        """
        Ping all known Nitter instances and return their health status.
        Useful for the settings page to show which instances are alive.
        """
        results: dict[str, bool] = {}

        async with httpx.AsyncClient(
            headers={"User-Agent": "Mozilla/5.0"},
        ) as client:
            tasks = {inst: self._fetch(f"{inst}/search?q=test&f=tweets", client)
                     for inst in NITTER_INSTANCES}
            responses = await asyncio.gather(*tasks.values(), return_exceptions=True)

            for inst, resp in zip(tasks.keys(), responses):
                results[inst] = isinstance(resp, str) and len(resp) > 100

        return results


# ─── Keyword Matcher ──────────────────────────────────────────────────────────

def match_keywords(text: str, keywords: list[str]) -> list[str]:
    """Return which keywords from the list appear in the tweet text (case-insensitive)."""
    text_lower = text.lower()
    return [kw for kw in keywords if kw.lower() in text_lower]


# ─── FCFS Scorer ──────────────────────────────────────────────────────────────

FCFS_INDICATORS = {
    # High-weight signals
    "fcfs": 25,
    "first come first serve": 25,
    "first come first served": 25,
    # Medium-weight signals
    "spots remaining": 15,
    "spots left": 15,
    "limited spots": 15,
    "only .* spots": 15,
    "mint is live": 15,
    "mint live": 12,
    "whitelist open": 12,
    "wl open": 12,
    "presale live": 12,
    "airdrop live": 10,
    "free mint": 10,
    "stealth launch": 10,
    # Low-weight signals
    "hurry": 5,
    "don't miss": 5,
    "dont miss": 5,
    "act fast": 5,
    "limited time": 5,
    "hard cap": 5,
    "alpha call": 5,
    "presale": 3,
    "airdrop": 3,
    "whitelist": 3,
    "mint": 2,
}

URGENCY_PATTERNS = [
    r"only \d+ (spots?|slots?|left|remaining)",
    r"\d+ (spots?|slots?) (left|remaining|only)",
    r"(live|now|today|tonight|hours?|minutes?)",
    r"(🚨|🔥|⚡|‼️|❗)",
]


def score_tweet(text: str) -> tuple[int, list[str]]:
    """
    Score a tweet for FCFS/alpha signal strength.

    Returns:
        (score 0-100, list of matched indicator labels)
    """
    text_lower = text.lower()
    score = 0
    matched: list[str] = []

    for indicator, weight in FCFS_INDICATORS.items():
        if re.search(indicator, text_lower):
            score += weight
            matched.append(indicator)

    for pattern in URGENCY_PATTERNS:
        if re.search(pattern, text_lower):
            score += 5

    # Cap at 100
    score = min(score, 100)
    return score, matched


def classify_strength(score: int) -> str:
    """Map numeric score to signal strength label."""
    if score >= 80:
        return "critical"
    elif score >= 60:
        return "high"
    elif score >= 35:
        return "medium"
    else:
        return "low"
