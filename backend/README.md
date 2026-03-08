# Crypto Alpha Intelligence — Nitter Scraper Backend

Zero-cost Twitter/X scraping via [Nitter](https://github.com/zedeus/nitter) public instances.  
No Twitter API key required. No monthly fees.

---

## How It Works

1. **Nitter** is an open-source, privacy-respecting Twitter frontend
2. Public Nitter instances mirror Twitter's public timeline data
3. This backend scrapes those instances using `httpx` + `BeautifulSoup`
4. It automatically rotates through 8+ known instances when one fails
5. Failed instances enter a 2-minute cooldown before being retried

---

## Setup

### Prerequisites
- Python 3.11+
- pip or pipenv

### Install

```bash
cd backend
pip install -r requirements.txt
```

### Run

```bash
# Option 1: Quick start
python run.py

# Option 2: Direct uvicorn
uvicorn main:app --reload --port 8000

# Option 3: Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

## API Endpoints

### `GET /health`
Check which Nitter instances are currently alive.

```json
{
  "status": "ok",
  "instances": {
    "https://nitter.privacydev.net": true,
    "https://nitter.poast.org": false
  },
  "healthy_count": 5,
  "total_count": 8
}
```

### `GET /search?q=FCFS+mint&max_results=50`
Search for tweets matching a query.

| Param | Default | Description |
|-------|---------|-------------|
| `q` | required | Search query |
| `max_results` | 50 | Max tweets (1–200) |
| `filter_replies` | true | Exclude replies |
| `filter_retweets` | true | Exclude retweets |

### `POST /scan`
Run a full pipeline scan across all configured keywords.

```json
{
  "keywords": ["FCFS", "airdrop live", "mint now"],
  "max_per_keyword": 20,
  "filter_replies": true,
  "filter_retweets": true,
  "min_score": 30
}
```

Returns tweets sorted by FCFS signal score (0–100), with strength labels:
- `critical` (80–100)
- `high` (60–79)
- `medium` (35–59)
- `low` (0–34)

### `GET /user/{handle}`
Fetch recent tweets from a specific account.

```
GET /user/cryptowhale_eth?max_results=20
```

### `GET /instances`
List all configured Nitter instances and their cooldown status.

---

## Connecting to the Next.js Dashboard

The Next.js frontend proxies requests through `/api/scraper/*`.  
Set the backend URL in your environment:

```bash
# .env.local (Next.js)
SCRAPER_BACKEND_URL=http://localhost:8000
```

---

## Limitations & Reliability

| Issue | Impact | Mitigation |
|-------|--------|------------|
| Nitter instances go down | No data from that instance | Auto-fallback to 7 other instances |
| Twitter blocks Nitter | All instances fail | Wait for community to spin up new ones |
| Rate limiting | Slow responses | Instance cooldown + rotation |
| No follower count | Can't filter by followers | Follower filter disabled in Nitter mode |
| No geo data | Can't filter by country | Country filter disabled in Nitter mode |

> **Note**: Nitter scraping is best-effort. For production use with guaranteed uptime,
> consider the Twitter API Basic tier ($100/month) or a paid scraping service.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |

---

## File Structure

```
backend/
├── main.py          # FastAPI app + all API routes
├── scraper.py       # Nitter scraper + FCFS scorer
├── run.py           # Quick-start script
├── requirements.txt # Python dependencies
└── README.md        # This file
```
