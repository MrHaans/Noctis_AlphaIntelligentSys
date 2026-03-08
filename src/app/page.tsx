"use client";

import { useScan } from "@/lib/use-scan";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import type { TweetResult } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function strengthBadge(s: TweetResult["strength"]) {
  const map = {
    critical: "danger",
    high: "warning",
    medium: "info",
    low: "muted",
  } as const;
  return map[s];
}

function formatLastScan(d: Date | null): string {
  if (!d) return "—";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 5) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

// ─── Pipeline stage labels (derived from scan response) ───────────────────────

interface PipelineRow {
  label: string;
  icon: string;
  processed: number;
  passed: number;
  filtered: number;
  active: boolean;
}

function buildPipeline(
  totalScanned: number,
  passed: number,
  filtered: number,
  results: TweetResult[]
): PipelineRow[] {
  const critical = results.filter((t) => t.strength === "critical").length;
  const high = results.filter((t) => t.strength === "high").length;
  const fcfsSignals = critical + high;

  return [
    {
      label: "Keyword Scanner",
      icon: "🔍",
      processed: totalScanned,
      passed: totalScanned,
      filtered: 0,
      active: true,
    },
    {
      label: "Tweet Filter (Original Only)",
      icon: "🐦",
      processed: totalScanned,
      passed: passed + filtered,
      filtered: filtered,
      active: true,
    },
    {
      label: "FCFS Detector",
      icon: "🚨",
      processed: passed + filtered,
      passed: passed,
      filtered: filtered,
      active: true,
    },
    {
      label: "Alert System",
      icon: "🔔",
      processed: passed,
      passed: fcfsSignals,
      filtered: passed - fcfsSignals,
      active: true,
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, loading, error, lastScan, refresh } = useScan({ pollMs: 60_000 });

  const results = data?.results ?? [];
  const totalScanned = data?.total_scanned ?? 0;
  const passed = data?.passed ?? 0;
  const filtered = data?.filtered ?? 0;

  const criticalSignals = results.filter((t) => t.strength === "critical");
  const highSignals = results.filter((t) => t.strength === "high");
  const topSignals = [...criticalSignals, ...highSignals].slice(0, 5);

  const pipeline = buildPipeline(totalScanned, passed, filtered, results);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">
              Real-time crypto alpha discovery pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-sm font-medium">Scanning…</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 text-sm font-medium">Backend offline</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">Live Scanning</span>
              </div>
            )}
            <div className="text-white/30 text-sm">
              Last scan:{" "}
              <span className="text-white/60">{formatLastScan(lastScan)}</span>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-lg text-xs transition-colors disabled:opacity-40"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Backend error banner */}
        {error && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
            <span className="text-red-400 text-lg">⚠️</span>
            <div>
              <p className="text-red-400 text-sm font-medium">Backend not reachable</p>
              <p className="text-red-300/60 text-xs mt-0.5">{error}</p>
              <p className="text-white/30 text-xs mt-1">
                Start it:{" "}
                <code className="text-white/50">cd backend && python run.py</code>
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tweets Scanned"
            value={totalScanned.toLocaleString()}
            sub="This scan"
            icon="🔍"
            color="blue"
          />
          <StatCard
            label="Passed Filter"
            value={passed.toLocaleString()}
            sub="Original, non-reply"
            icon="🐦"
            color="cyan"
          />
          <StatCard
            label="FCFS Signals"
            value={criticalSignals.length + highSignals.length}
            sub="Critical + High"
            icon="🚨"
            color="red"
          />
          <StatCard
            label="Filtered Out"
            value={filtered.toLocaleString()}
            sub="Replies / retweets"
            icon="🚫"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Critical Signals"
            value={criticalSignals.length}
            sub="Score ≥ 80"
            icon="🔴"
            color="red"
          />
          <StatCard
            label="High Signals"
            value={highSignals.length}
            sub="Score 60–79"
            icon="🟠"
            color="amber"
          />
          <StatCard
            label="Medium Signals"
            value={results.filter((t) => t.strength === "medium").length}
            sub="Score 35–59"
            icon="🟡"
            color="blue"
          />
          <StatCard
            label="Total Results"
            value={results.length}
            sub="Above min score"
            icon="📊"
            color="emerald"
          />
        </div>

        {/* Pipeline Flow */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>⚡</span> Discovery Pipeline
          </h2>
          {!data && !loading && !error && (
            <p className="text-white/30 text-sm text-center py-4">
              No scan data yet — click Refresh to run a scan.
            </p>
          )}
          {loading && (
            <p className="text-white/30 text-sm text-center py-4 animate-pulse">
              Running pipeline scan…
            </p>
          )}
          {data && (
            <div className="space-y-3">
              {pipeline.map((stage, idx) => {
                const passRate =
                  stage.processed > 0
                    ? Math.round((stage.passed / stage.processed) * 100)
                    : 0;
                return (
                  <div key={stage.label} className="flex items-center gap-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        stage.active
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-white/5 text-white/30 border border-white/10"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-sm font-medium ${
                            stage.active ? "text-white" : "text-white/40"
                          }`}
                        >
                          {stage.icon} {stage.label}
                        </span>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${passRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 w-44">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <span className="text-white/40">
                          {stage.processed.toLocaleString()} in
                        </span>
                        <span className="text-emerald-400">
                          ✓ {stage.passed.toLocaleString()}
                        </span>
                        <span className="text-red-400">
                          ✗ {stage.filtered.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {idx < pipeline.length - 1 && (
                      <div className="text-white/20 text-xs flex-shrink-0">↓</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Signals */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span>🚨</span> Top FCFS Signals
            </h2>
            {topSignals.length > 0 && (
              <Badge variant="danger">{topSignals.length} signals</Badge>
            )}
          </div>

          {loading && (
            <p className="text-white/30 text-sm text-center py-6 animate-pulse">
              Scanning for signals…
            </p>
          )}

          {!loading && topSignals.length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">
              {error
                ? "Backend offline — start the Python backend to see live signals."
                : "No high-priority signals detected in this scan."}
            </p>
          )}

          <div className="space-y-3">
            {topSignals.map((tweet) => (
              <div
                key={tweet.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{tweet.handle}</span>
                    <span className="text-white/30 text-xs">{tweet.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={strengthBadge(tweet.strength)}>
                      {tweet.strength.toUpperCase()}
                    </Badge>
                    <span className="text-white/30 text-xs">{tweet.timestamp}</span>
                  </div>
                </div>
                <p className="text-white/50 text-xs line-clamp-2 mb-2">{tweet.text}</p>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>Score: <span className="text-white/60 font-medium">{tweet.score}/100</span></span>
                  <span>❤️ {tweet.likes}</span>
                  <span>🔁 {tweet.retweets}</span>
                  {tweet.url && (
                    <a
                      href={tweet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View →
                    </a>
                  )}
                </div>
                {tweet.matched_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tweet.matched_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
