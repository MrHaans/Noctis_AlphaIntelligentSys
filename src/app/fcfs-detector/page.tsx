"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { MOCK_FCFS_SIGNALS, MOCK_TWEETS } from "@/lib/mock-data";
import type { FCFSSignalStrength } from "@/lib/types";

const STRENGTH_CONFIG: Record<
  FCFSSignalStrength,
  { badge: "danger" | "warning" | "info" | "muted"; label: string; color: string; bg: string }
> = {
  critical: { badge: "danger", label: "CRITICAL", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  high: { badge: "warning", label: "HIGH", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  medium: { badge: "info", label: "MEDIUM", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  low: { badge: "muted", label: "LOW", color: "text-white/40", bg: "bg-white/5 border-white/10" },
};

// FCFS detection rules shown to user
const DETECTION_RULES = [
  { id: "r1", rule: "Contains 'FCFS' or 'first come first serve'", weight: 40, active: true },
  { id: "r2", rule: "Urgency language (NOW, LIVE, HURRY, LIMITED)", weight: 20, active: true },
  { id: "r3", rule: "Spot/slot limit mentioned (e.g. '500 spots')", weight: 15, active: true },
  { id: "r4", rule: "Time-limited offer (e.g. 'next 2 hours')", weight: 15, active: true },
  { id: "r5", rule: "Token ticker detected (e.g. $TOKEN)", weight: 10, active: true },
  { id: "r6", rule: "Hard cap mentioned (ETH/SOL amount)", weight: 10, active: true },
  { id: "r7", rule: "Whitelist / WL keyword present", weight: 5, active: true },
];

export default function FCFSDetectorPage() {
  const [selectedStrength, setSelectedStrength] = useState<FCFSSignalStrength | "all">("all");

  const filtered = selectedStrength === "all"
    ? MOCK_FCFS_SIGNALS
    : MOCK_FCFS_SIGNALS.filter((s) => s.strength === selectedStrength);

  const counts = {
    critical: MOCK_FCFS_SIGNALS.filter((s) => s.strength === "critical").length,
    high: MOCK_FCFS_SIGNALS.filter((s) => s.strength === "high").length,
    medium: MOCK_FCFS_SIGNALS.filter((s) => s.strength === "medium").length,
    low: MOCK_FCFS_SIGNALS.filter((s) => s.strength === "low").length,
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🚨 FCFS Detector
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Detects First Come First Serve signals from filtered tweets using weighted rule scoring
          </p>
        </div>

        {/* Strength filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => {
            const isActive = selectedStrength === s;
            const count = s === "all" ? MOCK_FCFS_SIGNALS.length : counts[s];
            return (
              <button
                key={s}
                onClick={() => setSelectedStrength(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isActive
                    ? s === "all"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : `${STRENGTH_CONFIG[s as FCFSSignalStrength].bg} ${STRENGTH_CONFIG[s as FCFSSignalStrength].color}`
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
            <h2 className="text-white font-semibold">Detected Signals ({filtered.length})</h2>
            {filtered.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-white/30 text-sm">No signals at this strength level</p>
              </div>
            )}
            {filtered.map((signal) => {
              const cfg = STRENGTH_CONFIG[signal.strength];
              const tweet = MOCK_TWEETS.find((t) => t.id === signal.tweetId);
              return (
                <div key={signal.id} className={`rounded-xl border p-5 ${cfg.bg}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{signal.handle}</span>
                        {signal.projectName && signal.projectName !== "Unknown Project" && (
                          <Badge variant="info">{signal.projectName}</Badge>
                        )}
                      </div>
                      <span className="text-white/30 text-xs">{signal.timestamp}</span>
                    </div>
                    <Badge variant={cfg.badge}>{cfg.label}</Badge>
                  </div>

                  {/* Tweet text */}
                  <p className="text-white/70 text-sm leading-relaxed mb-3">{signal.text}</p>

                  {/* Indicators */}
                  <div>
                    <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">Detection Indicators</p>
                    <div className="flex flex-wrap gap-1.5">
                      {signal.indicators.map((ind) => (
                        <span
                          key={ind}
                          className={`text-xs px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
                        >
                          ✓ {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tweet stats */}
                  {tweet && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-white/40">
                      <span>👥 {tweet.followers.toLocaleString()} followers</span>
                      <span>🌍 {tweet.country}</span>
                      <span>📊 Score: <span className="text-white/60">{tweet.score}/100</span></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detection Rules */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">Detection Rules</h2>
              <p className="text-white/40 text-xs mb-4">
                Weighted scoring system. Total score determines signal strength.
              </p>
              <div className="space-y-3">
                {DETECTION_RULES.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3">
                    <div className={`w-8 h-5 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      rule.weight >= 30 ? "bg-red-500/20 text-red-400" :
                      rule.weight >= 15 ? "bg-amber-500/20 text-amber-400" :
                      "bg-white/10 text-white/40"
                    }`}>
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
                  { label: "CRITICAL", range: "≥ 70 pts", color: "text-red-400", bg: "bg-red-500/10" },
                  { label: "HIGH", range: "50–69 pts", color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: "MEDIUM", range: "30–49 pts", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  { label: "LOW", range: "< 30 pts", color: "text-white/40", bg: "bg-white/5" },
                ].map((t) => (
                  <div key={t.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${t.bg}`}>
                    <span className={`text-xs font-bold ${t.color}`}>{t.label}</span>
                    <span className="text-white/40 text-xs">{t.range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Session Summary</h2>
              <div className="space-y-2">
                {(["critical", "high", "medium", "low"] as FCFSSignalStrength[]).map((s) => (
                  <div key={s} className="flex items-center justify-between">
                    <Badge variant={STRENGTH_CONFIG[s].badge}>{STRENGTH_CONFIG[s].label}</Badge>
                    <span className={`text-sm font-bold ${STRENGTH_CONFIG[s].color}`}>{counts[s]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
