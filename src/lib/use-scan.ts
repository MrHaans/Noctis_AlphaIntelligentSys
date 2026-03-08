"use client";

/**
 * useScan — React hook that runs a pipeline scan against the real backend
 * and optionally polls on an interval.
 *
 * Usage:
 *   const { data, loading, error, lastScan, refresh } = useScan({ keywords, pollMs: 30_000 });
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { runScan, type ScanResponse, type ScanRequest } from "./api";

export interface UseScanOptions extends Partial<ScanRequest> {
  /** Auto-refresh interval in ms. Set to 0 to disable. Default: 0 */
  pollMs?: number;
  /** Run immediately on mount. Default: true */
  runOnMount?: boolean;
}

export interface UseScanResult {
  data: ScanResponse | null;
  loading: boolean;
  error: string | null;
  lastScan: Date | null;
  refresh: () => void;
}

const DEFAULT_KEYWORDS = [
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
];

export function useScan(options: UseScanOptions = {}): UseScanResult {
  const {
    keywords = DEFAULT_KEYWORDS,
    max_per_keyword = 20,
    filter_replies = true,
    filter_retweets = true,
    min_score = 30,
    pollMs = 0,
    runOnMount = true,
  } = options;

  const [data, setData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  // Trigger counter — incrementing this causes the fetch effect to re-run
  const [trigger, setTrigger] = useState(() => (runOnMount ? 1 : 0));

  // Keep latest options in a ref so the fetch effect always uses fresh values
  const optsRef = useRef({ keywords, max_per_keyword, filter_replies, filter_retweets, min_score });
  useEffect(() => {
    optsRef.current = { keywords, max_per_keyword, filter_replies, filter_retweets, min_score };
  }, [keywords, max_per_keyword, filter_replies, filter_retweets, min_score]);

  // Expose a stable refresh callback that just bumps the trigger
  const refresh = useCallback(() => {
    setTrigger((n) => n + 1);
  }, []);

  // Actual fetch — runs whenever trigger changes (and trigger > 0)
  useEffect(() => {
    if (trigger === 0) return;

    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      setError(null);
      const { data: result, error: err } = await runScan(optsRef.current);
      if (cancelled) return;
      if (err) {
        setError(err);
      } else {
        setData(result);
        setLastScan(new Date());
      }
      setLoading(false);
    }

    doFetch();
    return () => { cancelled = true; };
  }, [trigger]);

  // Polling — bump trigger on interval
  useEffect(() => {
    if (!pollMs) return;
    const id = setInterval(() => setTrigger((n) => n + 1), pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  return { data, loading, error, lastScan, refresh };
}
