"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { useScan } from "@/lib/use-scan";
import type { TweetResult } from "@/lib/api";

// ─── Strength config ──────────────────────────────────────────────────────────

type Strength = TweetResult["strength"];

const STRENGTH_CONFIG: Record<
  Strength,
  { badge: "danger" | "warning" | "info" | "muted"; label: string; color: string; bg: string }
> = {
  critical: { badge: "danger", label: "CRITICAL", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  high: { badge: "warning", label: "HIGH", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  medium: { badge: "info", label: "MEDIUM", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  low: { badge: "muted", label: "LOW", color: "text-white/40", bg: "bg-white/5 border-white/10" },
};

// FCFS detection rules (informational — mirrors backend scoring)
const DETECTION_RULES = [
  { id: "r1", rule: "Contains 'FCFS' or 'first come first serve'", weight: 25 },
  { id: "r2", rule: "Urgency language (NOW, LIVE, HURRY, LIMITED)", weight: 20 },
  { id: "r3", rule: "Spot/slot limit mentioned (e.g. '500 spots')", weight: 15 },
  { id: "r4", rule: "Mint is live / whitelist open", weight: 12 },
  { id: "r5", rule: "Time-limited offer (e.g. 'next 2 hours')", weight: 10 },
  { id: "r6", rule: "Airdrop live / free mint", weight: 10 },
  { id: "r7", rule: "Stealth launch", weight: 10 },
  { id: "r8", rule: "Hard cap / presale", weight: 5 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FCFSDetectorPage() {
  const [selectedStrength, setSelectedStrength] = useState<Strength | "all">("all");

  const { data, loading, error, lastScan, refresh } = useScan({ pollMs: 60_000 });

  const results = data?.results ?? [];

  // Only show tweets that have at least one matched keyword (real FCFS signals)
  const signals = results.filter((t) => t.matched_keywords.length > 0);

  const filtered =
    selectedStrength === "all"
      ? signals
      : signals.filter((t) => t.strength === selectedStrength);

  const counts: Record<Strength, number> = {
    critical: signals.filter((t) => t.strength === "critical").length,
    high: signals.filter((t) => t.strength === "high").length,
    medium: signals.filter((t) => t.strength === "medium").length,
    low: signals.filter((t) => t.strength === "low").length,
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🚨 FCFS Detector
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Live signals from Nitter — weighted rule scoring
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

        {/* Strength filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => {
            const isActive = selectedStrength === s;
            const count = s === "all" ? signals.length : counts[s];
            return (
              <button
                key={s}
                onClick={() => setSelectedStrength(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isActive
                    ? s === "all"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : `${STRENGTH_CONFIG[s].bg} ${STRENGTH_CONFIG[s].color}`
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                }`}
              >
                {s === "all" ? "All" : STRENGTH_CONFIG[s].label} ({count})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signal Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-white font-semibold">
              Detected Signals ({filtered.length})
            </h2>

            {loading && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-white/30 text-sm animate-pulse">
                  Scanning Nitter for FCFS signals…
                </p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-white/30 text-sm">
                  {error
                    ? "Backend offline — start the Python backend to see live signals."
                    : "No signals at this strength level in the current scan."}
                </p>
              </div>
            )}

            {filtered.map((tweet) => {
              const cfg = STRENGTH_CONFIG[tweet.strength];
              return (
                <div key={tweet.id} className={`rounded-xl border p-5 ${cfg.bg}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{tweet.handle}</span>
                        <span className="text-white/40 text-xs">{tweet.author}</span>
                      </div>
                      <span className="text-white/30 text-xs">{tweet.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={cfg.badge}>{cfg.label}</Badge>
                      <span className={`text-xs font-bold ${cfg.color}`}>
                        {tweet.score}/100
                      </span>
                    </div>
                  </div>

                  {/* Tweet text */}
                  <p className="text-white/70 text-sm leading-relaxed mb-3">{tweet.text}</p>

                  {/* Matched keywords as indicators */}
                  {tweet.matched_keywords.length > 0 && (
                    <div>
                      <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">
                        Detection Indicators
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tweet.matched_keywords.map((kw) => (
                          <span
                            key={kw}
                            className={`text-xs px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-white/40">
                    <span>❤️ {tweet.likes}</span>
                    <span>🔁 {tweet.retweets}</span>
                    <span>💬 {tweet.replies}</span>
                    {tweet.url && (
                      <a
                        href={tweet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View on Nitter →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Detection Rules */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Detection Rules</h2>
              <p className="text-white/40 text-xs mb-4">
                Weighted scoring system. Total score determines signal strength.
              </p>
              <div className="space-y-3">
                {DETECTION_RULES.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-5 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        rule.weight >= 20
                          ? "bg-red-500/20 text-red-400"
                          : rule.weight >= 10
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      +{rule.weight}
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">{rule.rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength thresholds */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Strength Thresholds</h2>
              <div className="space-y-2">
                {[
                  { label: "CRITICAL", range: "≥ 80 pts", color: "text-red-400", bg: "bg-red-500/10" },
                  { label: "HIGH", range: "60–79 pts", color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: "MEDIUM", range: "35–59 pts", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  { label: "LOW", range: "< 35 pts", color: "text-white/40", bg: "bg-white/5" },
                ].map((t) => (
                  <div
                    key={t.label}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${t.bg}`}
                  >
                    <span className={`text-xs font-bold ${t.color}`}>{t.label}</span>
                    <span className="text-white/40 text-xs">{t.range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Session Summary</h2>
              <div className="space-y-2">
                {(["critical", "high", "medium", "low"] as Strength[]).map((s) => (
                  <div key={s} className="flex items-center justify-between">
                    <Badge variant={STRENGTH_CONFIG[s].badge}>
                      {STRENGTH_CONFIG[s].label}
                    </Badge>
                    <span className={`text-sm font-bold ${STRENGTH_CONFIG[s].color}`}>
                      {counts[s]}
                    </span>
                  </div>
                ))}
              </div>
              {lastScan && (
                <p className="text-white/20 text-xs mt-3 pt-3 border-t border-white/10">
                  Last scan: {lastScan.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
