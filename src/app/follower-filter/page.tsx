"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { MOCK_TWEETS } from "@/lib/mock-data";

const PRESETS = [
  { label: "Micro (1K–10K)", min: 1000, max: 10000 },
  { label: "Small (10K–50K)", min: 10000, max: 50000 },
  { label: "Mid (50K–200K)", min: 50000, max: 200000 },
  { label: "Large (200K+)", min: 200000, max: 999999999 },
  { label: "Any", min: 0, max: 999999999 },
];

export default function FollowerFilterPage() {
  const [enabled, setEnabled] = useState(false);
  const [min, setMin] = useState(5000);
  const [max, setMax] = useState(500000);

  const passedTweets = MOCK_TWEETS.filter((t) => {
    if (!enabled) return true;
    return t.followers >= min && t.followers <= max;
  });

  const filteredTweets = MOCK_TWEETS.filter((t) => {
    if (!enabled) return false;
    return t.followers < min || t.followers > max;
  });

  const applyPreset = (preset: { min: number; max: number }) => {
    setMin(preset.min);
    setMax(preset.max);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              📊 Follower Range Filter
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Optional filter — only pass tweets from accounts within a follower range
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm">Filter Status:</span>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                enabled
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-white/5 text-white/40 border-white/10"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${enabled ? "bg-emerald-400" : "bg-white/30"}`} />
              {enabled ? "Enabled" : "Disabled (Optional)"}
            </button>
          </div>
        </div>

        {/* Info banner when disabled */}
        {!enabled && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-amber-400 text-xl">⚠️</span>
            <div>
              <p className="text-amber-300 text-sm font-medium">Follower Filter is Disabled</p>
              <p className="text-white/40 text-xs mt-0.5">
                All accounts pass through regardless of follower count. Enable to restrict by range.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <div className="space-y-4">
            {/* Range Config */}
            <div className={`bg-white/5 border rounded-xl p-5 transition-all ${
              enabled ? "border-white/10" : "border-white/5 opacity-60"
            }`}>
              <h2 className="text-white font-semibold mb-4">Follower Range</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                    Minimum Followers
                  </label>
                  <input
                    type="number"
                    value={min}
                    onChange={(e) => setMin(Number(e.target.value))}
                    disabled={!enabled}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                    Maximum Followers
                  </label>
                  <input
                    type="number"
                    value={max}
                    onChange={(e) => setMax(Number(e.target.value))}
                    disabled={!enabled}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
                  />
                </div>
              </div>

              {enabled && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-xs">
                    Passing accounts with{" "}
                    <span className="font-bold">{min.toLocaleString()}</span>
                    {" "}–{" "}
                    <span className="font-bold">{max.toLocaleString()}</span>
                    {" "}followers
                  </p>
                </div>
              )}
            </div>

            {/* Presets */}
            <div className={`bg-white/5 border rounded-xl p-5 transition-all ${
              enabled ? "border-white/10" : "border-white/5 opacity-60"
            }`}>
              <h2 className="text-white font-semibold mb-3">Quick Presets</h2>
              <div className="space-y-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => { applyPreset(preset); setEnabled(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors border border-white/5 hover:border-white/15"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Filter Results</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm">Total Input</span>
                  <span className="text-white font-medium">{MOCK_TWEETS.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm">Passed</span>
                  <span className="text-emerald-400 font-medium">{passedTweets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm">Filtered</span>
                  <span className="text-red-400 font-medium">{filteredTweets.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tweet List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-white font-semibold">
              {enabled ? "Filtered Results" : "All Accounts (Filter Disabled)"}
            </h2>
            {MOCK_TWEETS.map((tweet) => {
              const passes = !enabled || (tweet.followers >= min && tweet.followers <= max);
              return (
                <div
                  key={tweet.id}
                  className={`p-4 rounded-xl border transition-all ${
                    passes
                      ? "bg-white/5 border-white/10"
                      : "bg-red-500/5 border-red-500/20 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {tweet.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{tweet.author}</span>
                        <span className="text-white/40 text-xs">{tweet.handle}</span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{tweet.text}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${
                        tweet.followers >= 30000 ? "text-emerald-400" :
                        tweet.followers >= 10000 ? "text-blue-400" :
                        "text-white/50"
                      }`}>
                        {tweet.followers.toLocaleString()}
                      </p>
                      <p className="text-white/30 text-xs">followers</p>
                    </div>
                    <Badge variant={passes ? "success" : "danger"}>
                      {passes ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                  {!passes && enabled && (
                    <p className="text-red-400 text-xs mt-2 ml-12">
                      ✗ {tweet.followers < min
                        ? `Below minimum (${min.toLocaleString()})`
                        : `Above maximum (${max.toLocaleString()})`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
