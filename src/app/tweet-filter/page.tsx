"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { useScan } from "@/lib/use-scan";
import type { TweetResult } from "@/lib/api";

// ─── Country filter config (UI-only — backend handles actual filtering) ────────

const DEFAULT_EXCLUDED: { code: string; name: string }[] = [
  { code: "IN", name: "India" },
  { code: "BD", name: "Bangladesh" },
  { code: "PK", name: "Pakistan" },
  { code: "NG", name: "Nigeria" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
];

// ─── Tweet Card ───────────────────────────────────────────────────────────────

function TweetCard({ tweet }: { tweet: TweetResult }) {
  const strengthColor = {
    critical: "text-red-400",
    high: "text-amber-400",
    medium: "text-cyan-400",
    low: "text-white/40",
  }[tweet.strength];

  return (
    <div className="p-4 rounded-xl border bg-white/5 border-white/10">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase">
          {tweet.handle.replace("@", "").slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{tweet.author}</span>
            <span className="text-white/40 text-xs">{tweet.handle}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/30 text-xs">{tweet.timestamp}</span>
          </div>

          {/* Tweet text */}
          <p className="text-white/70 text-sm mt-1.5 leading-relaxed">{tweet.text}</p>

          {/* Matched keywords */}
          {tweet.matched_keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tweet.matched_keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full"
                >
                  🏷️ {kw}
                </span>
              ))}
            </div>
          )}

          {/* Flags row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  tweet.is_reply ? "bg-red-400" : "bg-emerald-400"
                }`}
              />
              <span className="text-xs text-white/40">
                is_reply:{" "}
                <span className={tweet.is_reply ? "text-red-400" : "text-emerald-400"}>
                  {String(tweet.is_reply)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  tweet.is_retweet ? "bg-red-400" : "bg-emerald-400"
                }`}
              />
              <span className="text-xs text-white/40">
                is_retweet:{" "}
                <span className={tweet.is_retweet ? "text-red-400" : "text-emerald-400"}>
                  {String(tweet.is_retweet)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/40">
                ❤️ {tweet.likes} · 🔁 {tweet.retweets}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="success">PASSED</Badge>
              <span className={`text-xs font-bold ${strengthColor}`}>
                Score: {tweet.score}
              </span>
            </div>
          </div>

          {tweet.url && (
            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block transition-colors"
            >
              View on Nitter →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TweetFilterPage() {
  const [filterReplies, setFilterReplies] = useState(true);
  const [filterRetweets, setFilterRetweets] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [strengthFilter, setStrengthFilter] = useState<string>("all");

  const { data, loading, error, lastScan, refresh } = useScan({
    filter_replies: filterReplies,
    filter_retweets: filterRetweets,
    min_score: minScore,
    pollMs: 60_000,
  });

  const results = data?.results ?? [];

  const displayTweets =
    strengthFilter === "all"
      ? results
      : results.filter((t) => t.strength === strengthFilter);

  const totalScanned = data?.total_scanned ?? 0;
  const passed = data?.passed ?? 0;
  const filtered = data?.filtered ?? 0;

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🐦 Tweet Filter
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Live results from Nitter — original tweets only
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg text-xs transition-colors disabled:opacity-40"
          >
            {loading ? "Scanning…" : "↻ Refresh"}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm font-medium">Backend not reachable</p>
            <p className="text-red-300/60 text-xs mt-0.5">{error}</p>
            <p className="text-white/30 text-xs mt-1">
              Start it:{" "}
              <code className="text-white/50">cd backend && python run.py</code>
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{totalScanned.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">Total Scanned</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{passed.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">Passed Filter</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{filtered.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">Filtered Out</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filter Config */}
          <div className="space-y-4">
            {/* Tweet Type Filters */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Tweet Type Filters</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-medium">Filter Replies</p>
                    <p className="text-white/40 text-xs">is_reply = false only</p>
                  </div>
                  <button
                    onClick={() => setFilterReplies(!filterReplies)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      filterReplies ? "bg-blue-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        filterReplies ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-medium">Filter Retweets</p>
                    <p className="text-white/40 text-xs">is_retweet = false only</p>
                  </div>
                  <button
                    onClick={() => setFilterRetweets(!filterRetweets)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      filterRetweets ? "bg-blue-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        filterRetweets ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Min Score */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Min Score</h2>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-white font-mono text-sm w-8 text-right">{minScore}</span>
              </div>
              <p className="text-white/30 text-xs mt-2">
                Only show tweets scoring ≥ {minScore}
              </p>
            </div>

            {/* Strength Filter */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Signal Strength</h2>
              <div className="space-y-1">
                {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrengthFilter(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      strengthFilter === s
                        ? "bg-blue-500/20 text-blue-300"
                        : "text-white/50 hover:bg-white/5"
                    }`}
                  >
                    {s === "all" ? "All Strengths" : s.charAt(0).toUpperCase() + s.slice(1)}
                    <span className="ml-2 text-xs text-white/30">
                      ({s === "all" ? results.length : results.filter((t) => t.strength === s).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Country info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-1">Country Filter</h2>
              <p className="text-white/40 text-xs mb-3">
                Excluded at backend level (Nitter doesn&apos;t expose country data — configure in backend)
              </p>
              <div className="space-y-1">
                {DEFAULT_EXCLUDED.map((c) => (
                  <div key={c.code} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-white/40">{c.name}</span>
                    <span className="text-white/20">({c.code})</span>
                  </div>
                ))}
              </div>
            </div>

            {lastScan && (
              <p className="text-white/20 text-xs text-center">
                Last scan: {lastScan.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Tweet List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">
                Live Results
              </h2>
              <span className="text-white/40 text-sm">{displayTweets.length} tweets</span>
            </div>

            {loading && (
              <div className="text-center py-12 text-white/30 text-sm animate-pulse">
                Scanning Nitter instances…
              </div>
            )}

            {!loading && displayTweets.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">
                {error
                  ? "Backend offline — no live data available."
                  : "No tweets matched the current filters."}
              </div>
            )}

            {displayTweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
