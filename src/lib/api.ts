/**
 * Typed API client for the Nitter scraper backend.
 * All requests go through the Next.js proxy at /api/scraper/*.
 */

// ─── Response Types ───────────────────────────────────────────────────────────

export interface TweetResult {
  id: string;
  text: string;
  author: string;
  handle: string;
  timestamp: string;
  is_reply: boolean;
  is_retweet: boolean;
  matched_keywords: string[];
  score: number;
  strength: "low" | "medium" | "high" | "critical";
  url: string;
  likes: number;
  retweets: number;
  replies: number;
}

export interface ScanResponse {
  total_scanned: number;
  passed: number;
  filtered: number;
  results: TweetResult[];
}

export interface SearchResponse {
  query: string;
  total: number;
  tweets: TweetResult[];
}

export interface HealthResponse {
  status: string;
  instances: Record<string, boolean>;
  healthy_count: number;
  total_count: number;
}

export interface BackendError {
  error: string;
  detail?: string;
  backend_url?: string;
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface ScanRequest {
  keywords: string[];
  max_per_keyword?: number;
  filter_replies?: boolean;
  filter_retweets?: boolean;
  min_score?: number;
}

// ─── API Base ─────────────────────────────────────────────────────────────────

const BASE = "/api/scraper";

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) {
      const err = json as BackendError;
      return { data: null, error: err.error ?? `HTTP ${res.status}` };
    }
    return { data: json as T, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/** Run a full pipeline scan across all keywords. */
export async function runScan(
  body: ScanRequest
): Promise<{ data: ScanResponse | null; error: string | null }> {
  return apiFetch<ScanResponse>("/scan", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Search for tweets matching a single query. */
export async function searchTweets(
  query: string,
  options?: { maxResults?: number; filterReplies?: boolean; filterRetweets?: boolean }
): Promise<{ data: SearchResponse | null; error: string | null }> {
  const params = new URLSearchParams({ q: query });
  if (options?.maxResults) params.set("max_results", String(options.maxResults));
  if (options?.filterReplies !== undefined)
    params.set("filter_replies", String(options.filterReplies));
  if (options?.filterRetweets !== undefined)
    params.set("filter_retweets", String(options.filterRetweets));
  return apiFetch<SearchResponse>(`/search?${params}`);
}

/** Check health of all Nitter instances. */
export async function checkHealth(): Promise<{
  data: HealthResponse | null;
  error: string | null;
}> {
  return apiFetch<HealthResponse>("/health");
}

/** Fetch recent tweets from a specific user handle. */
export async function getUserTweets(
  handle: string,
  options?: { maxResults?: number; filterReplies?: boolean; filterRetweets?: boolean }
): Promise<{ data: SearchResponse | null; error: string | null }> {
  const params = new URLSearchParams();
  if (options?.maxResults) params.set("max_results", String(options.maxResults));
  if (options?.filterReplies !== undefined)
    params.set("filter_replies", String(options.filterReplies));
  if (options?.filterRetweets !== undefined)
    params.set("filter_retweets", String(options.filterRetweets));
  const qs = params.toString();
  return apiFetch<SearchResponse>(`/user/${handle.replace(/^@/, "")}${qs ? `?${qs}` : ""}`);
}
